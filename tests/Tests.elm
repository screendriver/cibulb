module Tests exposing (..)

import Bluetooth
import Expect
import Main
    exposing
        ( bulbName
        , service
        , changeModeCharacteristic
        , changeColorCharacteristic
        , getRgb
        , changeColor
        , getCiStatus
        )
import Test exposing (..)


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
                        |> Expect.equal ( 0, 0, 255 )
            , test "0 0 255 when Color is Yellow" <|
                \_ ->
                    getRgb Main.Yellow
                        |> Expect.equal ( 255, 255, 0 )
            , test "0 0 255 when Color is Green" <|
                \_ ->
                    getRgb Main.Green
                        |> Expect.equal ( 20, 242, 0 )
            , test "0 0 255 when Color is Red" <|
                \_ ->
                    getRgb Main.Red
                        |> Expect.equal ( 255, 0, 0 )
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
        , describe "getCiStatus"
            [ test "Unknown when list is empty" <|
                \_ ->
                    getCiStatus [] |> Expect.equal Main.Unknown
            , test "Unknown when any list item has unknown color" <|
                \_ ->
                    getCiStatus [ Main.CiJob "" "blue", Main.CiJob "" "foo" ]
                        |> Expect.equal Main.Unknown
            , test "Broken when any list item has red color" <|
                \_ ->
                    getCiStatus [ Main.CiJob "" "blue", Main.CiJob "" "red" ]
                        |> Expect.equal Main.Broken
            , test "Running when any list item has a running color" <|
                \_ ->
                    getCiStatus [ Main.CiJob "" "blue", Main.CiJob "" "red_anime" ]
                        |> Expect.equal Main.Running
            , test "Passed when all list item has a blue color" <|
                \_ ->
                    getCiStatus [ Main.CiJob "" "blue", Main.CiJob "" "blue" ]
                        |> Expect.equal Main.Passed
            , test "ignore 'disabled' builds" <|
                \_ ->
                    getCiStatus [ Main.CiJob "" "disabled", Main.CiJob "" "blue" ]
                        |> Expect.equal Main.Passed
            , test "ignore 'aborted' builds" <|
                \_ ->
                    getCiStatus [ Main.CiJob "" "aborted", Main.CiJob "" "blue" ]
                        |> Expect.equal Main.Passed
            ]
        ]
