<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
const { i18next } = useTranslation()
</script>

<template>
    <div v-show="i18next.language == 'ja'">
        <div div="login-notice">
16歳未満の立ち入りを禁止します。
        </div>
        <div class="changelog">
            <h3>更新ログ</h3>
2024/09/02: 無制限に音声配信のゲインを上げるようになりました。<br/>
2024/08/11: 新しいキャラを追加しました。<br/>
2024/07/26: 新しいステージを追加しました。<br/>
2023/12/30: 新しいキャラを追加しました。<br/>
2023/12/24: 新しいステージを追加しました。<br/>
2023/12/16: 新しいステージを追加しました。<br/>
2023/05/16: iphoneで配信が聞こえなくなったバグを修正しました。<br/>
2023/04/26: ログインの速度が上がりました。<br/>
2023/04/06: 校庭と噴水広場と楽屋でじゃんけんを出来るようになりました。<br/>
2023/03/19: ニコニコ動画モードを追加しました。<br/>
2023/03/04: キャラが瞬くようになりました。<br/>
2023/02/28: 高台とカフェ通りにアニメーションが追加されました。<br/>
2023/02/24: 通知音を鳴らす言葉が（例えば、名前音声通知がONにされた場合に）太字で表示されるようになりました。<br/>
2022/12/11: 配信者用のミュートボタンが追加されました。配信が始まると同じ部屋にいるユーザーにデスクトップ通知が出るようになりました。<br/>
2022/12/04: ダークテーマが追加されました。<br/>
2022/11/24: 新しいキャラを追加しました。<br/>
2022/10/21: 読み上げはiphoneにも使えるようになりました。<br/>
2022/08/26: 新しいステージを追加しました。ログが入力欄の上に表示させる設定を追加しました。<br/>
2022/08/19: 新しいステージを追加しました。<br/>
2022/07/30: 新しいキャラを追加しました。<br/>
2022/06/29: 音量レバーのバグを修正しました。スマホでも動画配信タブを閉じたら配信がメインページに戻るようになりました。<br/>
2022/06/27: VTuberモードを追加しました。<br/>
2022/06/26: ルーラ画面でダブルクリックでルーラ出来るようになりました。選択した配信デバイスを記憶するようにしました（再ログインしたら選択がリセットされる）。<br/>
2022/06/11: 動画を新しいタブで開くと発生してたバグを修正しました。<br/>
2022/06/10: 動画をダブルクリックすると新しいタブで開くようになった。新しいタブのほうでダブルクリックすると全画面になる。<br/>
2022/04/17: 鍵マークで特定配信を見分けられるようになった。<br/>
2022/03/31: 特定のユーザーに向けて配信できるようになった（#list画面で配信を「見せる」「見せない」ボタンを確認できる）。<br/>
2022/03/28: 非公開配信機能がなくなりました（全ての配信が非公開になりました）。キーボードに０を打ったら、ズームがリセットされる。<br/>
2022/03/13: 新しいステージを追加しました。<br/>
2022/02/27: 受信者用の音量メーターを表示/非表示する設定を追加しました。配信の音声を左右にパン出来るようになりました。<br/>
2022/02/26: 受信者用の音量メーターを追加しました。<br/>
2022/02/14: 配信者が配信を切ずに部屋を出ると発生するバグを修正しました。ハンガリー語の翻訳を追加しました。<br/>
2021/12/27: 配信再開後の自動受信のON/OFFを切り替えられるようになりました。<br/>
2021/12/27: 配信デバイスを選択できるようになった。<br/>
2021/12/23: もなちゃととコンビニ部屋にクリスマスが来ますた！<br/>
2021/12/18: 新しいステージを追加しました。<br/>
2021/11/30: もなちゃとステージを追加しました.<br/>
2021/11/29: 新しいキャラを追加しました。<br/>
2021/11/22: 新しいキャラを追加しました。<br/>
2021/10/29: 新しいキャラを追加しました。<br/>
2021/10/26: 一方あぼーん解除すれば、一方あぼーんされたユーザーからのログを見えるようになりました。一方あぼーんされたユーザーからのログの代わりにインジケーターを表示出来るようになりました。<br/>
2021/10/25: 配信パネにユーザー名も赤くなるようになった。スペイン語翻訳を追加しました。<br/>
2021/10/24: iphoneで受信できるようになったはず。<br/>
2021/10/24: インターナショナルで言語を選択できるようになりました。<br/>
2021/10/06: 特定の部屋を直接リンクできるようになりました（例：https://gikopoipoi.net/?areaid=for&roomid=yatai）。部屋のIDについてはgithubを参考にしてください。<br/>
2021/10/01: 新しいキャラを追加しました。<br/>
2021/09/14: 新しいキャラを追加しました。<br/>
2021/06/22: チェス対局が終わったらボードが消えないようになりました。<br/>
2021/06/17: 非公開（ぽいぽい以外のサイトでは見えない）配信を出来るようになりました。<br/>
2021/06/14: +/-キーを押すとズーム出来るようになりました。<br/>
2021/06/13: レイアウトを改善しました。<br/>
2021/06/12: 開発局通りと神社でチェス出来るようになりました。<br/>
2021/05/29: 新しいキャラを追加しました。<br/>
2021/05/27: コピーしたログに時刻が出る機能を設定でON/OFF出来るようにしました。<br/>
2021/05/22: ブーストをOFFにすると配信が聞こえなくなるバグを修正しました。<br/>
2021/05/15: リスナー側からの音量ブーストを追加しました（まだ実検中！）。<br/>
2021/05/11: ログをコピーした時に、書き込み時刻もコピーされるようにしました。<br/>
2021/05/10: トリップ生成を直しました。<br/>
2021/05/01: スマホのカメラを選ぶことが出来るようになりました。TTSがどうぶつ語で喋ることが出来るようになりました。<br/>
2021/04/26: UIOPキーで吹き出しを動かせるようになりました。<br/>
2021/04/25: デスクトップ通知をON/OFFするボタンを追加しました。ログイン音声通知をON/OFFする設定を追加しました。<br/>
2021/04/24: Ctrl+Aを押すとログだけを選択出来るようになりました。偽トリップを付けられるバグを修正しました。低画質モード（古い端末のために）を設定に追加しました。<br/>
2021/04/22: ステージの画質が上がりました。ログのユーザー名にアンダーラインを付けられるようになりました（設定画面でON/OFF出来ます）。<br/>
2021/04/20: ステージのサイズを変更出来るようになりました。<br/>
2021/04/19: 新しいステージを追加しました。ログのユーザー名をクリックすると、そのユーザーのログが赤くなるようになりました（選択されたユーザーが#list画面で簡単に見つけられるようになりました）。<br/>
2021/04/18: 配信者の数が見えるようになりました。名前やユーザの指定した言葉がログに出ると特別な音声通知が出せるようになりました（設定画面でONにすることが出来ます）。<br/>
2021/04/13: マウスを動かしたりキーを打ったりすると、幽霊にならなくなるようになりました。<br/>
2021/04/10: スマホで音量レバーが使いやすくなりました。<br/>
2021/04/05: スマホで、二本の指でマップをズームとドラッグを出来るようになりました。Ctrl+lでログがフォーカスされるようになりました。Ctrl+gで入力欄それともマップがフォーカスされるようになりました。<br/>
2021/04/02: HJKLキーでもキャラ移動できます。配信の音量を記憶するようにしました。#rula画面に矢印キーで部屋を選択出来るようになりました。<br/>
2021/04/01: 相互あぼーんを追加しました。<br/>
2021/03/31: 新しいキャラを追加しました。<br/>
2021/03/29: 新しいキャラを追加しました。風呂敷しょぼんの骨折が治りました。<br/>
2021/03/28: 受信ボタンを押すと、一度配信が切れてもいちいち受信押さなくてもいいようにしました。新しいキャラがを追加しました。<br/>
2021/03/22: 移動ボタンのバグを修正しました。<br/>
2021/03/21: #list画面でユーザーを選択するとそのユーザーのログが赤くなるようになりました。移動ボタンはスマホで使いやすくなりました。<br/>
2021/03/13: 受信ボタンを赤色にしました。動画のピン留めを外すと動画の位置を変えるようになりました。<br/>
2021/03/08: ページ読み込みのバグを修正しました。新しい設定を追加しました。<br/>
2021/03/07: 新しいURLに変更しました（https://gikopoipoi.net）。ログの読み上げ機能を追加しました。新しい設定を追加しました。ログのユーザー名にマウスをのせると発言時刻が表示されるようになりました。<br/>
2021/03/06: ログアウトボタンを追加しました。ブラウザ通知のオンオフを設定できるようになりました。<br/>
2021/03/03: 新しいキャラを追加しました。<br/>
2021/03/01: おもしろい歩き方ができるようになりました。<br/>
2021/02/27: 配信の高度な設定で、画面の音声を共有できるようになりました（実験的な機能の為、使えないOSやブラウザがあります）。<br/>
2021/02/23: 設定画面を追加しました。設定で、ログ入力時にEnterだけで改行できるようになりました。ページを閉じる前に確認ダイアログを出すように変更しました。<br/>
2021/02/21: #listウィンドウであぼーんできるようになりました。<br/>
2021/02/20: ダークモード（Shaddoxモード）を追加したり、ステージ（海岸・高台の階段）を追加したり、色々修正しました。<br/>
2021/02/17: 新しいキャラを追加しました。<br/>
2021/02/16: 低画質っぽいモードを追加しました。<br/>
2021/02/15: マウスホイールのスクロールでマップをズームできるようになりました。配信で画面共有できるようになりました（これでOBSとかを使わなくてもよくなった）。<br/>
2021/02/13: Shift+Enterで複数行のログを書けるようになりました。<br/>
2021/02/12: 前回使ったユーザー名とキャラを記憶するようにしました。<br/>
2021/02/11: 新しいステージを追加しました（残りは海岸と高台の階段だけ）。<br/>
2021/02/09: 新しいステージを追加しました。<br/>
2021/02/05: さらに新しいステージを追加しました。#rulaウィンドウでヘッダーをクリックするとリストを並び替えられるようになりました。<br/>
2021/02/03: 新しいステージを追加しました。動画のサイズを変更できるようになりました。<br/>
2021/02/02: 新しいステージ（BARギコ）を追加しました。スマホとの互換性を改善しました。新しいステージ（サイロ）も追加しました。<br/>
2021/02/01: 配信用サーバーを分離しました。セキュリティが向上したはずです。<br/>
2021/01/31: Shift+矢印でカメラを移動できます。WASDキーでもキャラ移動できます。<br/>
2021/01/30: 新しいステージ（吉野家）を追加しました。配信者用の音量メーターを追加しました。<br/>
2021/01/29: WebSocketの再接続に失敗するバグを修正しました。<br/>
2021/01/27: 新しいステージ（高台）を追加しました。30分何もしなかったら半透明になるようにしました。<br/>
2021/01/25: 新しいキャラを追加しました。<br/>
2021/01/24: 隠しキャラを追加しました。ブラウザ通知を追加しました。効果音の音量を調整できるようにしました。<br/>
2021/01/23: サーバー再起動してもログアウトしなくなりました。新しい配信設定を追加しました。<br/>
2021/01/23: さらに新しいキャラを追加しました。ログイン画面で人数を表示するようにしました。再接続できない不具合を修正しました。<br/>
2021/01/22: 新しいキャラを追加しました。<br/>
2021/01/20: 高画質化したり、カメラがキャラ中心になるようにしたり、色々修正しました。<br/>
2021/01/17: ブラウザを閉じたらすぐログアウトするよう修正しました。新しいステージを追加しました。<br/>
2021/01/16: #rulaウインドウを改善しました。部屋の表示ががめちゃくちゃになる不具合を修正しました（たぶん）。<br />
2021/01/14: 開発局通りでゴミ箱とﾗｼﾞｦ局入り口の小屋に入れるようになりました。<br />
2021/01/14: ログアウトできない不具合は解決したみたいです。<br />
2021/01/14: ログアウトできない不具合を調査中...<br />
2021/01/12: 「一般」と「国際」を分離しました。<br />
2021/01/11: 配信機能を改善しました。<br />
2021/01/09: #rulaコマンドを追加しました。
        </div>
    </div>
    <div v-show="i18next.language != 'ja'">
        <div div="login-notice">
You must be at least 16 years of age to enter.
        </div>
        <div class="changelog">
            <h3>Change Log</h3>
2024/09/02: Added buttons to increase the gain of audio streams with no limit.<br/>
2024/08/11: Added a new character.<br/>
2024/07/26: Added new room.<br/>
2023/12/30: Added a new character.<br/>
2023/12/24: Added new room.<br/>
2023/12/16: Added new room.<br/>
2023/05/16: Fixed bug that made streams inaudible on iphones.<br/>
2023/04/26: Improved login time.<br/>
2023/04/06: Added Rock Paper Scissors to Schoolyard, Fountain Plaza and Dressing Room.<br/>
2023/03/19: Added Niconico mode.<br/>
2023/03/04: Added blinking.<br/>
2023/02/28: Added animations in Hilltop and Cafe Vista.<br/>
2023/02/24: Words that make a notification sound play (for example, when "Username Mention Sound" is enabled) are now displayed in bold.<br/>
2022/12/11: Added a mute button for streamers. A desktop notification is now sent to all users in the room where a stream starts.<br/>
2022/12/04: Added dark theme.<br/>
2022/11/24: Added a new character.<br/>
2022/10/21: Fixed TTS on iphones.<br/>
2022/08/26: Added new room. Added an option for displaying the chat log above the input textbox.<br/>
2022/08/19: Added new room.<br/>
2022/07/30: Added a new character.<br/>
2022/06/29: Fixed bug with the volume slider. Fixed mobile bug that didn't make videos detached to a separate get reattached to the main page when closing the tab.<br/>
2022/06/27: Added vtuber mode.<br/>
2022/06/26: Can now double click to a room name in the rula popup to move to that room. The stream device popup now remembers the last selection (only works across a single login session).<br/>
2022/06/11: Fixed some bugs with detaching video streams to a separate tab.<br/>
2022/06/10: When double clicking on a video stream, it gets moved into a new tab. By double clicking on the new tab, the video gets displayed in fullscreen.<br/>
2022/04/17: Private streams are now indicated with a lock icon.<br/>
2022/03/31: It's now possible to stream only to specific users (they can be selected from the #list popup).<br/>
2022/03/28: Removed the option for making "private streams" (streams are always private, now). Can now reset the zoom by pressing 0 on the keyboard.<br/>
2022/03/13: Added new room.<br/>
2022/02/27: Added setting for showing or hiding the VU meter for listeners. Added a knob for panning stream audio left and right.<br/>
2022/02/26: Added VU meter for listeners.<br/>  
2022/02/14: Fixed the bug that appeared when a streamer left the room without stopping the stream. Added Hungarian translation.<br/>
2021/12/27: Added a setting for choosing whether to automatically play streams or not after pressing "Get stream".<br/>
2021/12/27: Made it possible to select which device to stream.<br/>
2021/12/23: Christmas came to the monachat and konbini rooms!<br/>
2021/12/18: Added new room.<br/>
2021/11/30: Added monachat room.<br/>
2021/11/29: Added a new character.<br/>
2021/11/22: Added a new character.<br/>
2021/10/29: Added a new character.<br/>
2021/10/26: When un-ignoring a user, his old messages will be visible again. Added "Show in the log an indicator in place of the messages by ignored users" setting.<br/>
2021/10/25: User names in stream slots can also become red. Added Spanish translation.<br/>
2021/10/24: Should be possible to open streams on iphone too, now.<br/>
2021/10/24: Added language preferences to _for (English, Japanese, German and Italian).<br/>
2021/10/06: Added ability to link directly to a specific area and room (ex. https://gikopoipoi.net/?areaid=for&roomid=yatai). See github for a list of room ids.<br/>
2021/10/01: Added a new character.<br/>
2021/09/14: Added a new character.<br/>
2021/06/22: The chessboard doesn't disappear anymore when a game is over.<br/>
2021/06/17: Added ability to do private streams (that won't be visible from websites outside of gikopoipoi)<br/>
2021/06/14: Added ability to zoom with the - and + keys.<br/>
2021/06/13: Improved layout.<br/>
2021/06/12: It's now possible to play chess in kanrinin street and the shrine.<br/>
2021/05/29: Added a new character.<br/>
2021/05/27: Added setting for turning the timestamps in copy-pasted logs on or off.<br/>
2021/05/22: Fixed bug that turned streams silent when disabling the volume boost.<br/>
2021/05/15: Added volume boost from the listener's side (experimental).<br/>
2021/05/11: When copying the log to the clipboard, timestamps are included as well.<br/>
2021/05/10: Fixed tripcode generation.<br/>
2021/05/01: Added option for selecting the smartphone camera. Added "animalese" TTS voice.<br/> 
2021/04/26: It's possible now to set the position of the speech bubbles with the UIOP keys.<br/>
2021/04/25: Added button for turning on and off desktop notifications. Added setting for turning on and off the login notification sound.<br/>
2021/04/24: It's now possible to press Ctrl+A to select the log (and only the log). Added "Low Quality" mode in the settings. <br/>
2021/04/22: Improved picture quality. It's now possible to make the usernames underlined.<br/>
2021/04/20: It's now possible to resize the stage area.<br/>
2021/04/19: New room. When clicking a user name in the log, the messages they wrote are highlighted in red and that user is automatically selected in the #list popup.<br/>
2021/04/18: Added streamer count. Added new setting for playing a special notification sound when the user's name or some user-defined words are mentioned.<br/>
2021/04/13: When moving the mouse or using the keyboard, if you're transparent you go back to normal.<br/>
2021/04/10: Made volume slider easier to use on mobile.<br/>
2021/04/05: On smartphones it's now possible to zoom and drag the map with two fingers. Ctrl+l focuses the log and Ctrl+g switches the focus between the input box and the map.<br/>
2021/04/02: It's now possible to move the avatar with HJKL keys. Volume settings of stream slots are now remembered. It's possible to select rooms from the #rula popup with the arrow keys.<br/>
2021/04/01: Added mutual user ignore (block)<br/>
2021/03/31: Added a new character.<br/>
2021/03/29: Added a new character. Furoshiki shobon's arm is not broken anymore.<br/>
2021/03/28: After "Get stream" is pressed, streams will be opened automatically anytime they start. Added a new character.<br/>
2021/03/22: Fixed the "move" buttons bug.<br/>
2021/03/21: Select a user on the #list popup to make his messages red in the log. "Move" buttons are now easier to use on mobile.<br/>
2021/03/13: "Get stream" button is now red. When unpinning a video, it's possible to move it around the page.<br/>
2021/03/08: New settings for text to speech and bugfixes.<br/>
2021/03/07: New URL (https://gikopoipoi.net). Text to speech. New settings. Timestamps in log when hovering on user names with the mouse.<br/>
2021/03/06: Logout button. Setting for turning browser notifications on and off.<br/>   
2021/03/03: New character.<br/>
2021/03/01: Silly walk.<br/>
2021/02/27: Added "Screen Capture Audio" to the stream advanced settings (it's an experimental feature, and doesn't work on all OS or browsers)。<br/>
2021/02/23: Added settings popup. Ask for confirmation before closing the page.<br/>
2021/02/21: Use #list to ignore other users.<br/>
2021/02/20: Dark mode. Seashore and stairway. Various bugfixes.<br/>
2021/02/17: New character.<br/>
2021/02/16: "Low quality" mode.<br/>
2021/02/15: Can zoom the map with the mouse wheel. Screen capture option when streaming video (no need to use OBS anymore).<br/>
2021/02/13: Speech bubbles (hit SHIFT+Enter for multiline messages). <br/>
2021/02/12: Remember selected user name and character.<br/>
2021/02/11: More rooms (only seashore and hilltop stairway are missing).<br/>
2021/02/09: More rooms.<br/>
2021/02/05: More rooms. Sortable room list in #rula popup.<br/>
2021/02/03: New rooms. Resizable stream screen.<br/>
2021/02/02: Bar Giko room. Improved compatibility with smart phones. Also improved silo room.<br/>
2021/02/01: Installed a dedicated server for streams. With this the whole website should become more stable.<br/>
2021/01/31: Move the camera with SHIFT + arrows. Move with WASD.<br/>
2021/01/30: Yoshinoya. VU meter for streamers.<br/>
2021/01/29: Fixed bug with WebSocket failing to reconnect.<br/>
2021/01/27: Improved hilltop. After 30 minutes, idlers become transparent.<br/>
2021/01/25: New characters.<br/>
2021/01/24: New hidden characters. Browser notifications. Slider for adjusting volume of sound effects.<br/>
2021/01/23: Users don't disconnect when the server restarts. New stream settings.<br/>
2021/01/23: More new characters. Display user count in homepage. Fix reconnection issue.<br/>
2021/01/22: New characters.<br/>
2021/01/20: Fix blurry image. The camera follows giko as it moves. Other stuff.<br/>
2021/01/17: Disconnect immediately when the browser is closed. New room.<br/>
2021/01/16: New #rula window. Fixed (hopefully) bug where you can see objects from one room in another room.<br />
2021/01/14: It's now possible to get into the trash bin and the Radio Studio Funky Boon.<br />
2021/01/14: Ghosting issue seems to be fixed.<br />
2021/01/14: Ghosting issue is under investigation...<br />
2021/01/12: Split _gen and _for。<br />
2021/01/11: Improved streaming.<br />
2021/01/09: Added #rula command.
        </div>
    </div>
</template>
