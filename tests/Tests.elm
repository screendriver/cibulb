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
import Fuzz exposing (..)


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
            [ fuzz (list string) "Unknown when list is empty" <|
                \branches ->
                    getCiStatus branches []
                        |> Expect.equal Main.Unknown
            , fuzz (list string) "Unknown when any list item has unknown color" <|
                \branches ->
                    getCiStatus branches
                        [ Main.CiJob "master" "blue"
                        , Main.CiJob "master" "foo"
                        ]
                        |> Expect.equal Main.Unknown
            , fuzz (list string) "Broken when any list item has red color" <|
                \branches ->
                    getCiStatus branches
                        [ Main.CiJob "master" "blue"
                        , Main.CiJob "master" "red"
                        ]
                        |> Expect.equal Main.Broken
            , fuzz (list string) "Running when any list item has a running color" <|
                \branches ->
                    getCiStatus branches
                        [ Main.CiJob "master" "blue"
                        , Main.CiJob "master" "red_anime"
                        ]
                        |> Expect.equal Main.Running
            , fuzz (list string) "Passed when all list item has a blue color" <|
                \branches ->
                    getCiStatus []
                        [ Main.CiJob "master" "blue"
                        , Main.CiJob "master" "blue"
                        ]
                        |> Expect.equal Main.Passed
            , fuzz (list string) "ignore 'disabled' builds" <|
                \branches ->
                    getCiStatus []
                        [ Main.CiJob "master" "disabled"
                        , Main.CiJob "master" "blue"
                        ]
                        |> Expect.equal Main.Passed
            , fuzz (list string) "ignore 'aborted' builds" <|
                \branches ->
                    getCiStatus []
                        [ Main.CiJob "master" "aborted"
                        , Main.CiJob "master" "blue"
                        ]
                        |> Expect.equal Main.Passed
            , fuzz (list string) "filter out blacklist branches" <|
                \branches ->
                    getCiStatus ("debug" :: branches)
                        [ Main.CiJob "debug" "red"
                        , Main.CiJob "master" "blue"
                        ]
                        |> Expect.equal Main.Passed
            ]
        ]
