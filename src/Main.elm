module Main exposing (..)

import Bluetooth
import FeatherIcons
import Html exposing (Html, button, div, p, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)


type alias Model =
    { connectedDevice : Maybe Bluetooth.BluetoothDevice
    , errorMessage : Maybe String
    }


type alias BluetoothError =
    String


type Msg
    = RequestDevice
    | Error BluetoothError
    | DevicePaired Bluetooth.BluetoothDevice
    | Disconnect


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RequestDevice ->
            ( model, Bluetooth.requestDevice () )

        DevicePaired device ->
            ( { model | connectedDevice = Just device }, Cmd.none )

        Disconnect ->
            model.connectedDevice
                |> Maybe.map (\{ id } -> ( model, Bluetooth.disconnect id ))
                |> Maybe.withDefault ( model, Cmd.none )

        Error error ->
            ( { model | errorMessage = Just error }, Cmd.none )


view : Model -> Html Msg
view model =
    div []
        [ errorView model
        , button [ onClick RequestDevice ] [ text "Connect", FeatherIcons.bluetooth ]
        , button [ onClick Disconnect ] [ text "Disconnect", FeatherIcons.bluetooth ]
        ]


errorView : Model -> Html Msg
errorView { errorMessage } =
    case errorMessage of
        Nothing ->
            div [] []

        Just message ->
            p [ class "errorMessage" ] [ text message ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch [ Bluetooth.error Error, Bluetooth.device DevicePaired ]


init : ( Model, Cmd Msg )
init =
    ( { connectedDevice = Nothing, errorMessage = Nothing }, Cmd.none )


main : Program Never Model Msg
main =
    Html.program
        { view = view
        , init = init
        , update = update
        , subscriptions = subscriptions
        }
