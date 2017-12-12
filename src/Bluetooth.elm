port module Bluetooth exposing (..)


type alias Bulb =
    { bulbName : String, service : String }


type alias BulbId =
    String


port connect : Bulb -> Cmd msg


port connected : (BulbId -> msg) -> Sub msg


port disconnect : () -> Cmd msg


port disconnected : (() -> msg) -> Sub msg


port error : (String -> msg) -> Sub msg


type alias WriteParams =
    { service : String
    , characteristic : String
    , value : ( Int, Int, Int )
    }


port writeValue : WriteParams -> Cmd msg


port valueWritten : (WriteParams -> msg) -> Sub msg
