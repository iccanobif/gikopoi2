client error -NotAllowedError -icecandidateerror -"Socket disconnected" -NotFoundError -"Cannot read property 'style' of null" -connect_error


WEBRTC:
    https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling
    https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
    https://ikasekai.hatenablog.com/
    https://www.wowza.com/blog/low-latency-hls-vs-webrtc

- sound notifications when someone writes
- text messages get sent very slowly while streaming
- to fix: tab is not visible => some user moves => tab is visible again => that user starts floating, slowly reaching its new position
- implement a new room, in order to make all the needed infrastructure for building
  all the rooms
  - the server should remember which room each user is in.
- better login page (and maybe login mechanism, query string parameters might not be a great idea)
- improve layout and graphics (responsive: <canvas> could be set to 80% of the viewport's height and the log to 20%, for example)
- allow more than one stream at the same time
- limit streams to the room they're made in
- sound only streams
- REFACTOR REFACTOR REFACTOR
- don't get the context from the DOM every damn time


STUFF TO ADD TO DOCUMENTATION:
- "logical" position and "physical" position
- how to make graphical assets:
    rules for making assets:
        everything has a width of 160

            ／＼
 LEFT  y↗ ／    ＼  UP
        ／        ＼
      ／            ＼
      ＼            ／
 DOWN   ＼        ／  RIGHT
       x↘ ＼    ／
            ＼／