module Tests exposing (..)

import Bluetooth
import Expect
import Fuzz exposing (..)
import Main
    exposing
        ( bulbName
        , service
        , changeModeCharacteristic
        , changeColorCharacteristic
        , getRgb
        , changeColor
        , getCiStatus
        , getBranchBlacklist
        , branchesUrl
        , statusesUrl
        )
import Test exposing (..)
import Url exposing (Url)


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
        , describe "getBranchBlacklist"
            [ test "return an empty list when string is empty" <|
                \_ ->
                    getBranchBlacklist ""
                        |> List.isEmpty
                        |> Expect.true "Expected the list to be empty."
            , test "parses the given branches and return a list of branches" <|
                \_ ->
                    getBranchBlacklist "foo,bar"
                        |> Expect.equal [ "foo", "bar" ]
            , fuzz string "can handle random strings" <|
                \randomString ->
                    let
                        branchBlacklist =
                            getBranchBlacklist randomString
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
        , describe "branchesUrl"
            [ test "return the correct URL to branches" <|
                \_ ->
                    branchesUrl
                        |> Url.toString
                            { gitHubOwner = "me"
                            , gitHubRepo = "myproject"
                            }
                        |> Expect.equal "/repos/me/myproject/branches"
            ]
        , describe "statusesUrl"
            [ test "return the correct URL to statuses" <|
                \_ ->
                    statusesUrl
                        |> Url.toString
                            { gitHubOwner = "me"
                            , gitHubRepo = "myproject"
                            , branch = "thebranch"
                            }
                        |> Expect.equal "/repos/me/myproject/statuses/thebranch"
            ]
        ]
