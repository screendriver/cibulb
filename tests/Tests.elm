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
        ]
