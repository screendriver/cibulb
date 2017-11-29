port module Bluetooth exposing (..)


type alias BluetoothDevice =
    { id : String
    , name : String
    }


port requestDevice : () -> Cmd msg


port device : (BluetoothDevice -> msg) -> Sub msg


port error : (String -> msg) -> Sub msg
