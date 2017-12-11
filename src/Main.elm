module Main exposing (..)

import Bluetooth
import Delay
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import Http
import Json.Decode as Decode
import LightBulb exposing (lightBulb)
import Maybe.Extra
import Time exposing (second)


type alias Flags =
    { ciURL : String, ciJobName : String }


type alias CiJob =
    { name : String, color : String }


type alias Model =
    { ciURL : String
    , ciJobName : String
    , bulbId : Maybe Bluetooth.BulbId
    , errorMessage : Maybe String
    , ciColor : String
    }


type alias BluetoothError =
    String


type Color
    = Off
    | Blue
    | Yellow
    | Green
    | Red


type alias RGB =
    ( Int, Int, Int )


type BulbMode
    = White
    | Colored


type Msg
    = Connect
    | Error BluetoothError
    | Connected Bluetooth.BulbId
    | TurnOff
    | Disconnect
    | Disconnected ()
    | SetBulbMode BulbMode
    | FetchCIStatus
    | CIStatusFetched (Result Http.Error (List CiJob))


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


getRgb : Color -> RGB
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


changeColor : Color -> Cmd msg
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


getCiColor : String -> Cmd Msg
getCiColor url =
    let
        ŕequest =
            Http.get url decodeCiStatus
    in
        Http.send CIStatusFetched ŕequest


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
                  , Delay.after 20 second TurnOff
                  ]

        TurnOff ->
            ( model, changeColor Off )

        Disconnect ->
            model.bulbId
                |> Maybe.map (\_ -> ( model, Bluetooth.disconnect () ))
                |> Maybe.withDefault ( model, Cmd.none )

        Disconnected _ ->
            ( { model | bulbId = Nothing }, Cmd.none )

        Error error ->
            ( { model | errorMessage = Just error }, Cmd.none )

        SetBulbMode _ ->
            ( model
            , getRgb Red
                |> Bluetooth.WriteParams service changeColorCharacteristic
                |> Bluetooth.writeValue
            )

        FetchCIStatus ->
            ( model, getCiColor model.ciURL )

        CIStatusFetched (Ok jobs) ->
            jobs
                |> List.filter (\job -> job.name == model.ciJobName)
                |> List.map (\job -> ( { model | ciColor = job.color }, Cmd.none ))
                |> List.head
                |> Maybe.withDefault ( model, Cmd.none )

        _ ->
            Debug.crash "TODO"


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
subscriptions _ =
    Sub.batch
        [ Bluetooth.error Error
        , Bluetooth.connected Connected
        , Bluetooth.disconnected Disconnected
        ]


init : Flags -> ( Model, Cmd Msg )
init { ciURL, ciJobName } =
    ( { ciURL = ciURL
      , ciJobName = ciJobName
      , bulbId = Nothing
      , errorMessage = Nothing
      , ciColor = ""
      }
    , getCiColor ciURL
    )


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { view = view
        , init = init
        , update = update
        , subscriptions = subscriptions
        }
