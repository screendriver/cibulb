port module Bluetooth exposing (..)


type alias DeviceName =
    String


type alias BluetoothDevice =
    { id : String
    , name : String
    }


port requestDevice : DeviceName -> Cmd msg


port paired : (BluetoothDevice -> msg) -> Sub msg


port disconnect : () -> Cmd msg


port disconnected : (() -> msg) -> Sub msg


port error : (String -> msg) -> Sub msg
