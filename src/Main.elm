module Main exposing (..)

import Bluetooth
import Html exposing (Html, a, button, div, footer, img, p, text)
import Html.Attributes exposing (class, disabled, href, src, target, title)
import LightBulb exposing (lightBulb)
import Maybe.Extra
import Time exposing (Time, millisecond)


type alias Model =
    { bulbId : Maybe Bluetooth.BulbId
    , flash : Bool
    , flashColor : String
    , flashCount : Int
    , errorMessage : Maybe String
    }


type alias BluetoothError =
    String


type Msg
    = Connect
    | Error BluetoothError
    | Connected Bluetooth.BulbId
    | FlashTick Time
    | Disconnect
    | Disconnected ()


bulbName : String
bulbName =
    "icolorlive"


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Connect ->
            ( { model | errorMessage = Nothing }, Bluetooth.connect bulbName )

        Connected bulbId ->
            ( { model
                | bulbId = Just bulbId
                , flash = True
                , flashColor = "FFFF00"
              }
            , Cmd.none
            )

        FlashTick _ ->
            flash model

        Disconnect ->
            model.bulbId
                |> Maybe.map (\_ -> ( model, Bluetooth.disconnect () ))
                |> Maybe.withDefault ( model, Cmd.none )

        Disconnected _ ->
            ( { model | bulbId = Nothing }, Cmd.none )

        Error error ->
            ( { model | errorMessage = Just error }, Cmd.none )


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


flash : Model -> ( Model, Cmd msg )
flash model =
    let
        flash =
            model.flashCount < 5

        flashCount =
            if flash then
                model.flashCount + 1
            else
                0
    in
        ( { model | flash = flash, flashCount = flashCount }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions { flash } =
    let
        defaultSubs =
            [ Bluetooth.error Error
            , Bluetooth.connected Connected
            , Bluetooth.disconnected Disconnected
            ]

        subs =
            if flash then
                Time.every (500 * millisecond) FlashTick :: defaultSubs
            else
                defaultSubs
    in
        Sub.batch subs


init : ( Model, Cmd Msg )
init =
    ( { bulbId = Nothing
      , flash = True
      , flashColor = ""
      , flashCount = 0
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
