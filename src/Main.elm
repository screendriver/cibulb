module Main exposing (..)

import Bluetooth
import Delay
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import LightBulb exposing (lightBulb)
import Maybe.Extra
import Time exposing (second)


type alias Model =
    { bulbId : Maybe Bluetooth.BulbId
    , errorMessage : Maybe String
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


init : ( Model, Cmd Msg )
init =
    ( { bulbId = Nothing
      , errorMessage = Nothing
      }
    , Cmd.none
    )


main : Program Never Model Msg
main =
    Html.program
        { view = view
        , init = init
        , update = update
        , subscriptions = subscriptions
        }
