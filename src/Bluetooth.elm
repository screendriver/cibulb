port module Bluetooth exposing (..)


port requestDevice : () -> Cmd msg


port error : (String -> msg) -> Sub msg
