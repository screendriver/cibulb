port module Bluetooth exposing (..)


type alias BulbName =
    String


type alias BulbId =
    String


port connect : BulbName -> Cmd msg


port connected : (BulbId -> msg) -> Sub msg


port disconnect : () -> Cmd msg


port disconnected : (() -> msg) -> Sub msg


port error : (String -> msg) -> Sub msg
