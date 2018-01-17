module Main exposing (..)

import Bluetooth
import Dict exposing (Dict)
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import Http
import Json.Decode as Decode
import LightBulb exposing (lightBulb)
import Maybe.Extra
import Notification
import RemoteData exposing (WebData)
import Time exposing (Time, second)
import Url exposing (Url, (</>), (<?>), (@), root, s, string, int, bool)


type alias ApiToken =
    String


type alias Flags =
    { gitHubApiUrl : String
    , gitHubApiToken : ApiToken
    , gitHubOwner : String
    , gitHubRepo : String
    }


type alias BuildStatus =
    { id : Int, state : String }


type alias GitHub =
    { apiUrl : String
    , apiToken : ApiToken
    , owner : String
    , repo : String
    }


type alias Model =
    { gitHub : GitHub
    , bulbId : Maybe Bluetooth.BulbId
    , errorMessage : Maybe String
    , buildStatuses : WebData (List BuildStatus)
    , writeValueInProgress : Bool
    }


type alias BluetoothError =
    String


type BulbColor
    = Off
    | Blue
    | Yellow
    | Green
    | Red
    | Pink


type alias RGB =
    ( Int, Int, Int )


type BulbMode
    = White
    | Colored


type NotificationType
    = Error
    | Info


type Msg
    = Connect
    | ConnectionError BluetoothError
    | Connected Bluetooth.BulbId
    | Disconnect
    | Disconnected ()
    | FetchBuildStatuses Time
    | BuildStatusesFetched (WebData (List BuildStatus))
    | ValueWritten Bluetooth.WriteParams


bulbName : String
bulbName =
    "icolorlive"


service : String
service =
    "f000ffa0-0451-4000-b000-000000000000"


changeModeCharacteristic : String
changeModeCharacteristic =
    "f000ffa3-0451-4000-b000-000000000000"



-- 4d43 (0x4F43) changes to color
-- 4d57 (0x4F57) changes to white


changeColorCharacteristic : String
changeColorCharacteristic =
    "f000ffa4-0451-4000-b000-000000000000"


getRgb : BulbColor -> RGB
getRgb color =
    case color of
        Off ->
            ( 0, 0, 0 )

        Blue ->
            ( 0, 0, 26 )

        Yellow ->
            ( 26, 26, 0 )

        Green ->
            ( 0, 26, 0 )

        Red ->
            ( 26, 0, 0 )

        Pink ->
            ( 26, 0, 26 )


changeColor : BulbColor -> Cmd msg
changeColor color =
    getRgb color
        |> Bluetooth.WriteParams service changeColorCharacteristic
        |> Bluetooth.writeValue


decodeStatuses : Decode.Decoder (List BuildStatus)
decodeStatuses =
    Decode.list <|
        Decode.map2
            BuildStatus
            (Decode.field "id" Decode.int)
            (Decode.field "state" Decode.string)


statusesUrl : Url { gitHubOwner : String, gitHubRepo : String }
statusesUrl =
    root
        </> s "repos"
        </> string .gitHubOwner
        </> string .gitHubRepo
        </> s "commits"
        </> s "master"
        </> s "statuses"


httpRequest : ApiToken -> String -> Decode.Decoder a -> Http.Request a
httpRequest apiToken url decoder =
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" ("Bearer " ++ apiToken) ]
        , url = url
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


fetchBuildStatuses : GitHub -> Cmd Msg
fetchBuildStatuses { apiUrl, apiToken, owner, repo } =
    let
        url =
            apiUrl ++ statusesUrl @ { gitHubOwner = owner, gitHubRepo = repo }
    in
        httpRequest apiToken url decodeStatuses
            |> RemoteData.sendRequest
            |> Cmd.map BuildStatusesFetched


changeColorCmd : String -> Cmd Msg
changeColorCmd state =
    case String.toLower state of
        "pending" ->
            changeColor Yellow

        "failure" ->
            changeColor Red

        "error" ->
            changeColor Red

        "success" ->
            changeColor Green

        _ ->
            changeColor Pink


showNotification : NotificationType -> String -> Cmd msg
showNotification notificationType text =
    let
        title =
            case notificationType of
                Error ->
                    "Error"

                Info ->
                    "Info"
    in
        Notification.showNotification
            { title = title
            , body = text
            , renotify = True
            , tag = "lightbulb"
            }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Connect ->
            ( { model | errorMessage = Nothing }
            , Bluetooth.connect <| Bluetooth.Bulb bulbName service
            )

        Connected bulbId ->
            { model | bulbId = Just bulbId }
                ! [ changeColor Blue
                  , showNotification Info "Connected"
                  ]

        Disconnect ->
            ( model, changeColor Off )

        Disconnected _ ->
            ( { model | bulbId = Nothing }, Cmd.none )

        ConnectionError error ->
            ( { model | errorMessage = Just error }, showNotification Error error )

        FetchBuildStatuses _ ->
            ( { model | buildStatuses = RemoteData.NotAsked }, fetchBuildStatuses model.gitHub )

        BuildStatusesFetched RemoteData.NotAsked ->
            ( { model | buildStatuses = RemoteData.NotAsked }, Cmd.none )

        BuildStatusesFetched RemoteData.Loading ->
            ( { model | buildStatuses = RemoteData.Loading }, Cmd.none )

        BuildStatusesFetched (RemoteData.Success statuses) ->
            let
                firstState =
                    statuses
                        |> List.sortBy .id
                        |> List.reverse
                        |> List.head

                cmd =
                    case firstState of
                        Nothing ->
                            Cmd.none

                        Just state ->
                            changeColorCmd state.state
            in
                case model.writeValueInProgress of
                    True ->
                        ( model, Cmd.none )

                    False ->
                        ( { model
                            | buildStatuses = RemoteData.succeed statuses
                            , writeValueInProgress = cmd /= Cmd.none
                          }
                        , cmd
                        )

        BuildStatusesFetched (RemoteData.Failure err) ->
            ( { model | buildStatuses = (RemoteData.Failure err) }, Cmd.none )

        ValueWritten { value } ->
            ( { model | writeValueInProgress = False }
            , if value == getRgb Off then
                Bluetooth.disconnect ()
              else
                Cmd.none
            )


view : Model -> Html Msg
view model =
    let
        flash =
            Maybe.Extra.isJust model.bulbId

        lightBulbMsg =
            if flash then
                Disconnect
            else
                Connect
    in
        div [ class "main" ]
            [ lightBulb flash lightBulbMsg
            , errorView model
            , footerView model
            ]


errorView : Model -> Html Msg
errorView { errorMessage } =
    case errorMessage of
        Nothing ->
            div [] []

        Just message ->
            p [ class "errorMessage" ] [ text message ]


footerView : Model -> Html Msg
footerView model =
    footer []
        [ text "Icons made by "
        , a
            [ href "http://www.freepik.com"
            , title "Freepik"
            ]
            [ text "Freepik" ]
        , text " from "
        , a
            [ href "https://www.flaticon.com/"
            , title "Flaticon"
            ]
            [ text "www.flaticon.com" ]
        , text " is licensed by "
        , a
            [ href "http://creativecommons.org/licenses/by/3.0/"
            , title "Creative Commons BY 3.0"
            , target "_blank"
            ]
            [ text "CC 3.0 BY" ]
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    let
        defaultSubs =
            [ Bluetooth.error ConnectionError
            , Bluetooth.connected Connected
            , Bluetooth.disconnected Disconnected
            , Bluetooth.valueWritten ValueWritten
            ]

        subs =
            case model.bulbId of
                Just id ->
                    Time.every (10 * second) FetchBuildStatuses :: defaultSubs

                Nothing ->
                    defaultSubs
    in
        Sub.batch subs


init : Flags -> ( Model, Cmd Msg )
init { gitHubApiUrl, gitHubApiToken, gitHubOwner, gitHubRepo } =
    ( { gitHub =
            { apiUrl = gitHubApiUrl
            , apiToken = gitHubApiToken
            , owner = gitHubOwner
            , repo = gitHubRepo
            }
      , bulbId = Nothing
      , errorMessage = Nothing
      , buildStatuses = RemoteData.NotAsked
      , writeValueInProgress = False
      }
    , Cmd.none
    )


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { view = view
        , init = init
        , update = update
        , subscriptions = subscriptions
        }
