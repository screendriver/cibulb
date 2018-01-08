port module Notification exposing (..)


type alias Options =
    { title : String
    , body : String
    , renotify : Bool
    , tag : String
    }


port showNotification : Options -> Cmd msg
