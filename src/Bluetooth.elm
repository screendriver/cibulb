port module Bluetooth exposing (..)


type alias DeviceId =
    String


type alias BluetoothDevice =
    { id : DeviceId
    , name : String
    }


port requestDevice : () -> Cmd msg


port device : (BluetoothDevice -> msg) -> Sub msg


port disconnect : DeviceId -> Cmd msg


port disconnected : (Bool -> msg) -> Sub msg


port error : (String -> msg) -> Sub msg
