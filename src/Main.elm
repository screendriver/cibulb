module Main exposing (..)

import Bluetooth
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import LightBulb exposing (lightBulb)
import Maybe.Extra
import Time exposing (Time, millisecond)


type alias Model =
    { connectedDevice : Maybe Bluetooth.BluetoothDevice
    , deviceBlink : Bool
    , errorMessage : Maybe String
    }


type alias BluetoothError =
    String


type Msg
    = RequestDevice
    | Error BluetoothError
    | DevicePaired Bluetooth.BluetoothDevice
    | DeviceBlinkTick Time
    | Disconnect
    | Disconnected ()


deviceName : String
deviceName =
    "icolorlive"


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RequestDevice ->
            ( { model | errorMessage = Nothing }, Bluetooth.requestDevice deviceName )

        DevicePaired device ->
            ( { model
                | connectedDevice = Just device
                , deviceBlink = True
              }
            , Cmd.none
            )

        Disconnect ->
            model.connectedDevice
                |> Maybe.map (\_ -> ( model, Bluetooth.disconnect () ))
                |> Maybe.withDefault ( model, Cmd.none )

        Disconnected _ ->
            ( { model | connectedDevice = Nothing }, Cmd.none )

        Error error ->
            ( { model | errorMessage = Just error }, Cmd.none )

        _ ->
            Debug.crash "TODO"


view : Model -> Html Msg
view model =
    let
        isConnected =
            Maybe.Extra.isJust model.connectedDevice

        lightBulbMsg =
            if isConnected then
                Disconnect
            else
                RequestDevice
    in
        div [ class "main" ]
            [ connectedDeviceView model
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


connectedDeviceView : Model -> Html Msg
connectedDeviceView { connectedDevice } =
    case connectedDevice of
        Nothing ->
            div [] []

        Just device ->
            div [] [ p [] [ text device.name ] ]


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
subscriptions { deviceBlink } =
    let
        defaultSubs =
            [ Bluetooth.error Error
            , Bluetooth.paired DevicePaired
            , Bluetooth.disconnected Disconnected
            ]

        subs =
            if deviceBlink then
                Time.every (500 * millisecond) DeviceBlinkTick :: defaultSubs
            else
                defaultSubs
    in
        Sub.batch subs


init : ( Model, Cmd Msg )
init =
    ( { connectedDevice = Nothing
      , deviceBlink = False
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
