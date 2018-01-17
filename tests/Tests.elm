module Tests exposing (..)

import Bluetooth
import Dict exposing (Dict)
import Expect
import Fuzz exposing (..)
import Json.Decode as Decode
import Main
    exposing
        ( bulbName
        , service
        , changeModeCharacteristic
        , changeColorCharacteristic
        , getRgb
        , changeColor
        , statusesUrl
        , decodeStatuses
        , changeColorCmd
        , Model
        , GitHub
        , update
        , showNotification
        )
import Notification
import RemoteData
import Test exposing (..)
import Url exposing (Url)


gitHubModel : GitHub
gitHubModel =
    { apiUrl = "https://github.com/api/v3/"
    , apiToken = "the-token"
    , owner = "screendriver"
    , repo = "ci-light-bulb"
    }


testModel : Model
testModel =
    { gitHub = gitHubModel
    , bulbId = Nothing
    , buildStatuses = RemoteData.NotAsked
    , errorMessage = Nothing
    , writeValueInProgress = False
    }


suite : Test
suite =
    describe "Main"
        [ test "bulbName equals to 'icolorlive'" <|
            \_ ->
                Expect.equal bulbName "icolorlive"
        , test "service has correct uuid" <|
            \_ ->
                Expect.equal service "f000ffa0-0451-4000-b000-000000000000"
        , test "changeModeCharacteristic has correct uuid" <|
            \_ ->
                Expect.equal changeModeCharacteristic "f000ffa3-0451-4000-b000-000000000000"
        , test "changeColorCharacteristic has correct uuid" <|
            \_ ->
                Expect.equal changeColorCharacteristic "f000ffa4-0451-4000-b000-000000000000"
        , describe "getRgb"
            [ test "0 0 0 when Color is Off" <|
                \_ ->
                    getRgb Main.Off
                        |> Expect.equal ( 0, 0, 0 )
            , test "0 0 255 when Color is Blue" <|
                \_ ->
                    getRgb Main.Blue
                        |> Expect.equal ( 0, 0, 26 )
            , test "0 0 255 when Color is Yellow" <|
                \_ ->
                    getRgb Main.Yellow
                        |> Expect.equal ( 26, 26, 0 )
            , test "0 0 255 when Color is Green" <|
                \_ ->
                    getRgb Main.Green
                        |> Expect.equal ( 0, 26, 0 )
            , test "0 0 255 when Color is Red" <|
                \_ ->
                    getRgb Main.Red
                        |> Expect.equal ( 26, 0, 0 )
            ]
        , test "changeColor should call a port" <|
            \_ ->
                let
                    calledPort =
                        getRgb Main.Red
                            |> Bluetooth.WriteParams service changeColorCharacteristic
                            |> Bluetooth.writeValue
                in
                    changeColor Main.Red
                        |> Expect.equal calledPort
        , test "statusesUrl return the correct URL to statuses" <|
            \_ ->
                statusesUrl
                    |> Url.toString
                        { gitHubOwner = "me"
                        , gitHubRepo = "myproject"
                        }
                    |> Expect.equal "/repos/me/myproject/commits/master/statuses"
        , test "decodeStatuses" <|
            \_ ->
                let
                    json =
                        """
                        [{ "id": 123, "state": "success" }]
                        """
                in
                    Decode.decodeString decodeStatuses json
                        |> Expect.equal (Ok [ { id = 123, state = "success" } ])
        , describe "changeColorCmd"
            [ test "Cmd change color to Pink when String is empty" <|
                \_ ->
                    changeColorCmd ""
                        |> Expect.equal (changeColor Main.Pink)
            , test "Cmd change color to Pink when String is unknown" <|
                \_ ->
                    changeColorCmd "unknown"
                        |> Expect.equal (changeColor Main.Pink)
            , test "Cmd change color to Yellow when state is pending" <|
                \_ ->
                    changeColorCmd "pending"
                        |> Expect.equal (changeColor Main.Yellow)
            , test "Cmd change color to Red when any state is failure" <|
                \_ ->
                    changeColorCmd "failure"
                        |> Expect.equal (changeColor Main.Red)
            , test "Cmd change color to Red when any state is error" <|
                \_ ->
                    changeColorCmd "error"
                        |> Expect.equal (changeColor Main.Red)
            , test "Cmd change color to Green when state is success" <|
                \_ ->
                    changeColorCmd "success"
                        |> Expect.equal (changeColor Main.Green)
            ]
        , describe "update"
            [ test "Connect Msg" <|
                \_ ->
                    update Main.Connect testModel
                        |> Expect.equal
                            ( { testModel | errorMessage = Nothing }
                            , Bluetooth.connect <| Bluetooth.Bulb bulbName service
                            )
            , test "Connected Msg" <|
                \_ ->
                    update (Main.Connected "abc1234") testModel
                        |> Expect.equal
                            ( { testModel | bulbId = Just "abc1234" }
                            , Cmd.batch
                                [ changeColor Main.Blue
                                , showNotification Main.Info "Connected"
                                ]
                            )
            , test "Disconnect Msg" <|
                \_ ->
                    update Main.Disconnect testModel
                        |> Expect.equal ( testModel, changeColor Main.Off )
            , test "Disconnected Msg" <|
                \_ ->
                    update (Main.Disconnected ()) testModel
                        |> Expect.equal
                            ( { testModel | bulbId = Nothing }
                            , Cmd.none
                            )
            , test "ConnectionError Msg" <|
                \_ ->
                    let
                        cmd =
                            Notification.showNotification
                                { title = "Error"
                                , body = "failed"
                                , renotify = True
                                , tag = "lightbulb"
                                }
                    in
                        update (Main.ConnectionError "failed") testModel
                            |> Expect.equal
                                ( { testModel | errorMessage = Just "failed" }
                                , cmd
                                )
            ]
        ]
