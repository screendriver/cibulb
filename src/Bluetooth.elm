port module Bluetooth exposing (..)


type alias DeviceId =
    String


type alias BluetoothDevice =
    { id : DeviceId
    , name : String
    }


port requestDevice : () -> Cmd msg


port paired : (BluetoothDevice -> msg) -> Sub msg


port disconnect : DeviceId -> Cmd msg


port disconnected : (() -> msg) -> Sub msg


port error : (String -> msg) -> Sub msg
