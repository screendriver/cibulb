module Main exposing (..)

import Bluetooth
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import Http
import Json.Decode as Decode
import LightBulb exposing (lightBulb)
import Maybe.Extra
import Time exposing (Time, second, minute)


type alias Flags =
    { ciURL : String, ciJobName : String }


type alias CiJob =
    { name : String, color : String }


type alias Model =
    { bulbId : Maybe Bluetooth.BulbId
    , ciURL : String
    , ciJobName : String
    , ciStatus : CiStatus
    , errorMessage : Maybe String
    }


type alias BluetoothError =
    String


type CiStatus
    = None
    | Passed
    | Broken
    | Disabled
    | Aborted


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
    | SetBulbMode BulbMode
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
            ( 0, 0, 255 )

        Yellow ->
            ( 255, 255, 0 )

        Green ->
            ( 20, 242, 0 )

        Red ->
            ( 255, 0, 0 )

        Pink ->
            ( 255, 0, 228 )


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

        _ ->
            None


ciStatusToBulbColor : CiStatus -> BulbColor
ciStatusToBulbColor status =
    case status of
        Broken ->
            Red

        Passed ->
            Green

        _ ->
            Pink


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

        SetBulbMode _ ->
            ( model, changeColor Red )

        FetchCiJobs _ ->
            ( model, fetchCiJobs model.ciURL )

        CiJobsFetched (Ok jobs) ->
            jobs
                |> List.filter (\job -> job.name == model.ciJobName)
                |> List.map
                    (\job ->
                        ( { model | ciStatus = ciStatusFromColor job.color }
                        , ciStatusFromColor job.color |> ciStatusToBulbColor |> changeColor
                        )
                    )
                |> List.head
                |> Maybe.withDefault ( model, Cmd.none )

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
                Time.every minute FetchCiJobs :: defaultSubs
            else
                defaultSubs
    in
        Sub.batch subs


init : Flags -> ( Model, Cmd Msg )
init { ciURL, ciJobName } =
    ( { bulbId = Nothing
      , ciURL = ciURL
      , ciJobName = ciJobName
      , ciStatus = None
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
