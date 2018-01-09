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
        , parseBranchBlacklist
        , branchesUrl
        , statusesUrl
        , decodeBranchNames
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
    , branchBlacklist = []
    }


testModel : Model
testModel =
    { gitHub = gitHubModel
    , bulbId = Nothing
    , branches = RemoteData.NotAsked
    , errorMessage = Nothing
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
        , describe "parseBranchBlacklist"
            [ test "return an empty list when string is empty" <|
                \_ ->
                    parseBranchBlacklist ""
                        |> List.isEmpty
                        |> Expect.true "Expected the list to be empty."
            , test "parses the given branches and return a list of branches" <|
                \_ ->
                    parseBranchBlacklist "foo,bar"
                        |> Expect.equal [ "foo", "bar" ]
            , fuzz string "can handle random strings" <|
                \randomString ->
                    let
                        branchBlacklist =
                            parseBranchBlacklist randomString
                    in
                        case String.trim randomString of
                            "" ->
                                branchBlacklist
                                    |> List.isEmpty
                                    |> Expect.true "Expected the list to be empty."

                            other ->
                                String.split "," other
                                    |> Expect.equal branchBlacklist
            ]
        , test "branchesUrl return the correct URL to branches" <|
            \_ ->
                branchesUrl
                    |> Url.toString
                        { gitHubOwner = "me"
                        , gitHubRepo = "myproject"
                        }
                    |> Expect.equal "/repos/me/myproject/branches"
        , test "statusesUrl return the correct URL to statuses" <|
            \_ ->
                statusesUrl
                    |> Url.toString
                        { gitHubOwner = "me"
                        , gitHubRepo = "myproject"
                        , branchName = "master"
                        }
                    |> Expect.equal "/repos/me/myproject/commits/master/statuses"
        , test "decodeBranchNames" <|
            \_ ->
                let
                    json =
                        """
                        [{ "name": "the-branch" }]
                        """
                in
                    Decode.decodeString decodeBranchNames json
                        |> Expect.equal
                            (Ok [ "the-branch" ])
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
            [ test "Cmd change color to Pink when Dict is empty" <|
                \_ ->
                    changeColorCmd Dict.empty
                        |> Expect.equal (changeColor Main.Pink)
            , test "Cmd.none when any WebData state is not successed" <|
                \_ ->
                    let
                        branches =
                            Dict.fromList
                                [ ( "master", RemoteData.Loading ) ]
                    in
                        changeColorCmd branches
                            |> Expect.equal Cmd.none
            , test "Cmd change color to Yellow when any state is pending" <|
                \_ ->
                    let
                        branches =
                            Dict.fromList
                                [ ( "master", RemoteData.succeed "pending" )
                                , ( "wip", RemoteData.succeed "success" )
                                ]
                    in
                        changeColorCmd branches
                            |> Expect.equal (changeColor Main.Yellow)
            , test "Cmd change color to Red when any state is failure" <|
                \_ ->
                    let
                        branches =
                            Dict.fromList
                                [ ( "master", RemoteData.succeed "failure" )
                                , ( "wip", RemoteData.succeed "success" )
                                ]
                    in
                        changeColorCmd branches
                            |> Expect.equal (changeColor Main.Red)
            , test "Cmd change color to Red when any state is error" <|
                \_ ->
                    let
                        branches =
                            Dict.fromList
                                [ ( "master", RemoteData.succeed "error" )
                                , ( "wip", RemoteData.succeed "success" )
                                ]
                    in
                        changeColorCmd branches
                            |> Expect.equal (changeColor Main.Red)
            , test "Cmd change color to Green when all states are success" <|
                \_ ->
                    let
                        branches =
                            Dict.fromList
                                [ ( "master", RemoteData.succeed "success" ) ]
                    in
                        changeColorCmd branches
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
