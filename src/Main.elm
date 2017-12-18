module Main exposing (..)

import Bluetooth
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import Http
import Json.Decode as Decode
import LightBulb exposing (lightBulb)
import Maybe.Extra
import Time exposing (Time, second)


type alias Branch =
    String


type alias Flags =
    { gitHubApiUrl : String
    , gitHubOwner : String
    , gitHubRepo : String
    , gitHubBranchBlacklist : String
    }


type alias CiJob =
    { name : String, color : String }


type alias Model =
    { gitHubApiUrl : String
    , gitHubOwner : String
    , gitHubRepo : String
    , gitHubBranchBlacklist : List Branch
    , bulbId : Maybe Bluetooth.BulbId
    , ciStatus : CiStatus
    , errorMessage : Maybe String
    }


type alias BluetoothError =
    String


type CiStatus
    = Unknown
    | Passed
    | Broken
    | Disabled
    | Aborted
    | Running


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


type Msg
    = Connect
    | Error BluetoothError
    | Connected Bluetooth.BulbId
    | Disconnect
    | Disconnected ()
    | FetchCiJobs Time
    | CiJobsFetched (Result Http.Error (List CiJob))
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


decodeCiStatus : Decode.Decoder (List CiJob)
decodeCiStatus =
    Decode.field "jobs"
        (Decode.list
            (Decode.map2
                CiJob
                (Decode.field "name" Decode.string)
                (Decode.field "color" Decode.string)
            )
        )


fetchCiJobs : String -> Cmd Msg
fetchCiJobs url =
    let
        ŕequest =
            Http.get url decodeCiStatus
    in
        Http.send CiJobsFetched ŕequest


ciStatusFromColor : String -> CiStatus
ciStatusFromColor color =
    case color of
        "red" ->
            Broken

        "blue" ->
            Passed

        "disabled" ->
            Disabled

        "aborted" ->
            Aborted

        "red_anime" ->
            Running

        "blue_anime" ->
            Running

        "notbuilt_anime" ->
            Running

        _ ->
            Unknown


ciStatusToBulbColor : CiStatus -> BulbColor
ciStatusToBulbColor status =
    case status of
        Broken ->
            Red

        Passed ->
            Green

        Running ->
            Yellow

        _ ->
            Pink


getCiStatus : List Branch -> List CiJob -> CiStatus
getCiStatus branches jobs =
    let
        statusList =
            jobs
                |> List.filter (\{ name } -> not <| List.member name branches)
                |> List.map (\{ color } -> ciStatusFromColor color)
                |> List.filter (\ciStatus -> ciStatus /= Disabled && ciStatus /= Aborted)

        isBroken status =
            status == Broken

        isPassed status =
            status == Passed

        isRunning status =
            status == Running
    in
        if List.isEmpty statusList then
            Unknown
        else if List.any isRunning statusList then
            Running
        else if List.any isBroken statusList then
            Broken
        else if List.all isPassed statusList then
            Passed
        else
            Unknown


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Connect ->
            ( { model | errorMessage = Nothing }
            , Bluetooth.connect <| Bluetooth.Bulb bulbName service
            )

        Connected bulbId ->
            ( { model | bulbId = Just bulbId }, changeColor Blue )

        Disconnect ->
            ( model, changeColor Off )

        Disconnected _ ->
            ( { model | bulbId = Nothing }, Cmd.none )

        Error error ->
            ( { model | errorMessage = Just error }, Cmd.none )

        FetchCiJobs _ ->
            ( model, fetchCiJobs model.gitHubApiUrl )

        CiJobsFetched (Ok jobs) ->
            let
                ciStatus =
                    getCiStatus model.gitHubBranchBlacklist jobs
            in
                ( { model | ciStatus = ciStatus }
                , ciStatusToBulbColor ciStatus |> changeColor
                )

        CiJobsFetched (Err err) ->
            ( model, Cmd.none )

        ValueWritten { value } ->
            if value == getRgb Off then
                ( model, Bluetooth.disconnect () )
            else
                ( model, Cmd.none )


view : Model -> Html Msg
view model =
    let
        isConnected =
            Maybe.Extra.isJust model.bulbId

        lightBulbMsg =
            if isConnected then
                Disconnect
            else
                Connect
    in
        div [ class "main" ]
            [ bulbIdView model
            , lightBulb isConnected lightBulbMsg
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


bulbIdView : Model -> Html Msg
bulbIdView { bulbId } =
    case bulbId of
        Nothing ->
            div [] []

        Just id ->
            div [] [ p [] [ text id ] ]


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
            [ Bluetooth.error Error
            , Bluetooth.connected Connected
            , Bluetooth.disconnected Disconnected
            , Bluetooth.valueWritten ValueWritten
            ]

        subs =
            if Maybe.Extra.isJust model.bulbId then
                Time.every (10 * second) FetchCiJobs :: defaultSubs
            else
                defaultSubs
    in
        Sub.batch subs


getBranchBlacklist : String -> List Branch
getBranchBlacklist blacklist =
    case String.trim blacklist of
        "" ->
            []

        trimmed ->
            String.split "," trimmed


init : Flags -> ( Model, Cmd Msg )
init { gitHubApiUrl, gitHubOwner, gitHubRepo, gitHubBranchBlacklist } =
    ( { gitHubApiUrl = gitHubApiUrl
      , gitHubOwner = gitHubOwner
      , gitHubRepo = gitHubRepo
      , gitHubBranchBlacklist = getBranchBlacklist gitHubBranchBlacklist
      , bulbId = Nothing
      , ciStatus = Unknown
      , errorMessage = Nothing
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
