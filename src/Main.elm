module Main exposing (..)

import Bluetooth
import FeatherIcons
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)


type alias Model =
    { connectedDevice : Maybe Bluetooth.BluetoothDevice }


type alias BluetoothError =
    String


type Msg
    = RequestDevice
    | Error BluetoothError
    | DevicePaired Bluetooth.BluetoothDevice


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RequestDevice ->
            ( model, Bluetooth.requestDevice () )

        DevicePaired device ->
            ( { model | connectedDevice = Just device }, Cmd.none )

        _ ->
            Debug.crash "TODO"


view : Model -> Html Msg
view model =
    div []
        [ button [ onClick RequestDevice ] [ text "Connect", FeatherIcons.bluetooth ]
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch [ Bluetooth.error Error, Bluetooth.device DevicePaired ]


init : ( Model, Cmd Msg )
init =
    ( { connectedDevice = Nothing }, Cmd.none )


main : Program Never Model Msg
main =
    Html.program
        { view = view
        , init = init
        , update = update
        , subscriptions = subscriptions
        }
