streamRequest: {
    roomId // unnecessary, the server already knows in which room this user is
    streamSlotId
    withVideo
    withSound
}

streamInfo: {
    userId
    roomId
    streamSlotId
    withVideo
    withSound
}

-> = from client to server
<- = from server to client

    -> user-want-to-stream(streamRequest)

    <- server-ok-to-stream()
    <- server-not-ok-to-stream(reason: string)

    <- server-stream-started(streamInfo)

    -> user-want-to-stop-stream() // no need to specify which stream, let's assume each user can open at most one stream
    <- server-stream-stopped({ streamSlotId: number })

TODO:
    - OK when a streamer changes room, automatically stop his stream
    - OK if a room has an empty "streams" array, hide the "start streaming" button
    - OK when someone joins a room where a stream is ongoing, have the server send a server-stream-started message
    - when a non streamer changes room, close the previous room's stream        
    - ability to mute/hide streams (and save bandwidth)