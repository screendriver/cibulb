module Main exposing (..)

import Bluetooth
import FeatherIcons
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import Html.Events exposing (onClick)
import LightBulb exposing (lightBulb)
import Maybe.Extra


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
    | Disconnected ()


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RequestDevice ->
            ( { model | errorMessage = Nothing }, Bluetooth.requestDevice () )

        DevicePaired device ->
            ( { model | connectedDevice = Just device }, Cmd.none )

        Disconnect ->
            model.connectedDevice
                |> Maybe.map (\{ id } -> ( model, Bluetooth.disconnect id ))
                |> Maybe.withDefault ( model, Cmd.none )

        Disconnected _ ->
            ( { model | connectedDevice = Nothing }, Cmd.none )

        Error error ->
            ( { model | errorMessage = Just error }, Cmd.none )


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
        , a [ href "http://www.freepik.com", title "Freepik" ] [ text "Freepik" ]
        , text " from "
        , a [ href "https://www.flaticon.com/", title "Flaticon" ] [ text "www.flaticon.com" ]
        , text " is licensed by "
        , a [ href "http://creativecommons.org/licenses/by/3.0/", title "Creative Commons BY 3.0", target "_blank" ] [ text "CC 3.0 BY" ]
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Bluetooth.error Error
        , Bluetooth.paired DevicePaired
        , Bluetooth.disconnected Disconnected
        ]


init : ( Model, Cmd Msg )
init =
    ( { connectedDevice = Nothing
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
