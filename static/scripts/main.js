//localStorage.debug = '*'; // socket.io debug
localStorage.removeItem("debug");

import { characters, loadCharacters } from "./character.js";
import User from "./user.js";
import {
    loadImage,
    calculateRealCoordinates,
    postJson,
    BLOCK_WIDTH,
    BLOCK_HEIGHT,
    logToServer,
    safeDecodeURI,
    debounceWithDelayedExecution,
    debounceWithImmediateExecution,
    urlRegex,
    AudioProcessor,
    getFormattedCurrentDate,
    requestNotificationPermission,
    getDeviceList,
    getClickCoordinatesWithinCanvas,
} from "./utils.js";
import messages from "./lang.js";
import { speak } from "./tts.js";
import { RTCPeer, defaultIceConfig } from "./rtcpeer.js";
import { RenderCache } from "./rendercache.js";

// I define myUserID here outside of the vue.js component to make it
// visible to console.error
window.myUserID = null;

const originalConsoleError = console.error
console.error = function() {
    let allArgs = myUserID + " ERROR " + new Date()
    for (let i = 0; i < arguments.length; i++)
    {
        const arg = arguments[i]

        // If this argument is an exception, stringify it
        const msg = arg && arg.message
            ? arg.message + " " + arg.stack
            : arg

        allArgs += " " + msg
    }
    originalConsoleError(new Date(), ...arguments)
    logToServer(allArgs)
}

window.onerror = function(message, source, lineno, colno, error) {
    console.error(error || (message + " " + source + ":" + lineno + ":" + colno))
    // When the function returns true, this prevents the firing of the default event handler.
    return true
}

const enabledListenerIconImagePromise = loadImage("enabled-listener.svg")
const disabledListenerIconImagePromise = loadImage("disabled-listener.svg")
let enabledListenerIconImage = null;
let disabledListenerIconImage = null;

function UserException(message) {
    this.message = message;
}

let loadCharacterImagesPromise = null

function getSpawnRoomId()
{
    try
    {
        const urlSearchParams = new URLSearchParams(window.location.search);
        return urlSearchParams.get("roomid") || "admin_st"
    }
    catch
    {
        return "admin_st"
    }
}

function getDefaultAreaId()
{
    try
    {
        const urlSearchParams = new URLSearchParams(window.location.search);
        return urlSearchParams.get("areaid") || localStorage.getItem("areaId") || "gen"
    }
    catch
    {
        return localStorage.getItem("areaId") || "gen"
    }
}

const i18n = new VueI18n({
    locale: "ja",
    fallbackLocale: "en",
    messages,
});

window.vueApp = new Vue({
    i18n,
    el: "#vue-app",
    data: {
        selectedCharacter: null,
        socket: null,
        users: {},
        roomLoadId: 0,
        currentRoom: {
            id: null,
            group: "gikopoi",
            objects: [],
            hasChessboard: false,
            specialObjects: [],
        },
        myUserID: null,
        myPrivateUserID: null,
        isWaitingForServerResponseOnMovement: false,
        justSpawnedToThisRoom: true,
        isLoadingRoom: false,
        requestedRoomChange: false,
        isInfoboxVisible: localStorage.getItem("isInfoboxVisible") == "true",
        soundEffectVolume: 0,
        characterId: localStorage.getItem("characterId") || "giko",
        isLoggingIn: false,
        areaId: getDefaultAreaId(), // 'gen' or 'for'
        language: localStorage.getItem("language") || "en",

        // canvas
        canvasContext: null,
        isRedrawRequired: false,
        isUsernameRedrawRequired: false,
        isDraggingCanvas: false,
        canvasPointerStartState: null,
        canvasDragStartOffset: null,
        canvasManualOffset: { x: 0, y: 0 },
        canvasGlobalOffset: { x: 0, y: 0 },
        canvasDimensions: { w: 0, h: 0 },
        userCanvasScale: 1,
        userCanvasScaleStart: null,
        isLowQualityEnabled: localStorage.getItem("isLowQualityEnabled") == "true",
        isCrispModeEnabled: localStorage.getItem("isCrispModeEnabled") == "true",
        blockWidth: BLOCK_WIDTH,
        blockHeight: BLOCK_HEIGHT,
        devicePixelRatio: null,

        // rula stuff
        isRulaPopupOpen: false,
        roomList: [],
        preparedRoomList: [],
        rulaRoomGroup: "all",
        rulaRoomListSortKey: localStorage.getItem("rulaRoomListSortKey") || "sortName",
        rulaRoomListSortDirection: localStorage.getItem("rulaRoomListSortDirection") || 1,
        rulaRoomSelection: null,

        // user list stuff
        isUserListPopupOpen: false,
        ignoredUserIds: new Set(),

        // preferences stuff
        isPreferencesPopupOpen: false,
        showUsernameBackground: localStorage.getItem("showUsernameBackground") != "false",
        isNewlineOnShiftEnter: localStorage.getItem("isNewlineOnShiftEnter") != "false",
        bubbleOpacity: localStorage.getItem("bubbleOpacity") || 100,
        isCommandSectionVisible: localStorage.getItem("isCommandSectionVisible") != "false",
        isMoveSectionVisible: localStorage.getItem("isMoveSectionVisible") != "false",
        isBubbleSectionVisible: localStorage.getItem("isBubbleSectionVisible") != "false",
        isLogoutButtonVisible: localStorage.getItem("isLogoutButtonVisible") != "false",
        isDarkMode: localStorage.getItem("isDarkMode") == "true",
        showNotifications: localStorage.getItem("showNotifications") != "false",
        enableTextToSpeech: localStorage.getItem("enableTextToSpeech") == "true",
        ttsVoiceURI: localStorage.getItem("ttsVoiceURI") || "automatic",
        voiceVolume: localStorage.getItem("voiceVolume") || 100,
        availableTTSVoices: [],
        isMessageSoundEnabled: localStorage.getItem("isMessageSoundEnabled") != "false",
        isLoginSoundEnabled: localStorage.getItem("isLoginSoundEnabled") != "false",
        isNameMentionSoundEnabled: localStorage.getItem("isNameMentionSoundEnabled") == "true",
        customMentionSoundPattern: localStorage.getItem("customMentionSoundPattern") || "",
        isCoinSoundEnabled: localStorage.getItem("isCoinSoundEnabled") != "false",
        mentionSoundFunction: null,
        isStreamAutoResumeEnabled: localStorage.getItem("isStreamAutoResumeEnabled") != "false",
        isStreamInboundVuMeterEnabled: localStorage.getItem("isStreamInboundVuMeterEnabled") != "false",

        // streaming
        streams: [],
        clientSideStreamData: [],
        mediaStream: null,
        streamSlotIdInWhichIWantToStream: null,
        rtcPeerSlots: [],
        takenStreams: [], // streams taken by me
        slotVolume: JSON.parse(localStorage.getItem("slotVolume")) || {}, // key: slot Id / value: volume

        // stream settings
        isStreamPopupOpen: false,
        streamMode: localStorage.getItem("streamMode") || "video_sound",
        displayAdvancedStreamSettings: localStorage.getItem("displayAdvancedStreamSettings") == "true",
        streamEchoCancellation: localStorage.getItem("streamEchoCancellation") == "true",
        streamNoiseSuppression: localStorage.getItem("streamNoiseSuppression") == "true",
        streamAutoGain: localStorage.getItem("streamAutoGain") == "true",
        streamScreenCapture: localStorage.getItem("streamScreenCapture") == "true",
        streamScreenCaptureAudio: localStorage.getItem("streamScreenCaptureAudio") == "true",
        streamTarget: "all_room",
        allowedListenerIDs: new Set(),

        // Device selection popup
        isDeviceSelectionOpen: false,
        deviceList: [],
        selectedAudioDeviceId: null,
        selectedVideoDeviceId: null,
        waitingForDevicePermission: false,
        
        // Dialog Popup
        dialogPopupMessage: '',
        dialogPopupTitle: '',
        dialogPopupButtons: [],
        dialogPopupCallback: null,
        dialogPopupButtonIndex: null,
        isDialogPopupOpen: false,
        
        loggedIn: false,
        loggedOut: false,
        isPoop: false,

        enableGridNumbers: false,
        username: localStorage.getItem("username") || "",

        // Possibly redundant data:
        serverStats: {
            userCount: 0,
            streamCount: 0,
        },
        wantToStream: false,
        connectionLost: false,
        connectionRefused: false,

        pageRefreshRequired: false,
        passwordInputVisible: false,
        password: "",

        allCharacters: Object.values(characters),

        vuMeterTimer: null,
        highlightedUserId: null,
        highlightedUserName: null,
        movementDirection: null,
        underlinedUsernames: localStorage.getItem("underlinedUsernames") == "true",
        timestampsInCopiedLog: localStorage.getItem("timestampsInCopiedLog") != "false",
        showIgnoreIndicatorInLog: localStorage.getItem("showIgnoreIndicatorInLog") == "true",
        notificationPermissionsGranted: false,
        lastFrameTimestamp: null,
        chessboardState: {},

        canvasContainerResizeObserver: null,

        lastCoinTossTime: 0, // unix timestamp

        hideStreams: false,
        // the key is the slot ID
        inboundAudioProcessors: {},
        outboundAudioProcessor: null,
    },
    mounted: function ()
    {
        console.log("%c(,,ﾟДﾟ)",
            "background-color: white; color: black; font-weight: bold; padding: 4px 6px; font-size: 50px",);

        window.addEventListener("keydown", (ev) =>
        {
            if (ev.shiftKey && ev.ctrlKey && ev.code == "Digit9")
                this.passwordInputVisible = true
            if (ev.shiftKey && ev.ctrlKey && ev.code == "Digit8")
            {
                this.enableGridNumbers = !this.enableGridNumbers
                this.isRedrawRequired = true
            }
            if (ev.code == "Escape")
            {
                // Only close the listed popups if there is no dialog popup open in front of it.
                // So the dialog popup and other popup behind don't all disappear at the same time.
                if (this.closeDialog() === null)
                {
                    this.closeRulaPopup()
                    this.closeUserListPopup()
                    this.closeStreamPopup()
                    this.closePreferencesPopup()
                    this.cancelDeviceSelection()
                }
            }
            if (ev.code == "KeyG" && ev.ctrlKey)
            {
                ev.preventDefault()
                document.getElementById("input-textbox").focus()
                return
            }
            if (ev.code == "KeyL" && ev.ctrlKey)
            {
                ev.preventDefault()
                document.getElementById("chatLog").focus()
                return
            }
        })

        // Listening to this event from document because the user could stop pressing the movement button after
        // having moved the mouse outside of it, so "mouseup" would be fired on god knows what element other than
        // the button.
        document.addEventListener("mouseup", () => this.setMovementDirection(null))

        if (this.areaId == "gen")
            this.setLanguage("ja")
        else
            this.setLanguage(this.language)

        loadCharacterImagesPromise = loadCharacters(this.isCrispModeEnabled);

        const charSelect = document.getElementById("character-selection")
        const charactersSelected = charSelect.getElementsByClassName("character-selected")
        if (charactersSelected.length)
            charactersSelected[0].scrollIntoView({block: "nearest"})

        document.getElementById("username-textbox").focus()

        if (window.speechSynthesis)
        {
            this.availableTTSVoices = speechSynthesis.getVoices()
            if (speechSynthesis.addEventListener)
            {
                speechSynthesis.addEventListener("voiceschanged", () => {
                    this.availableTTSVoices = speechSynthesis.getVoices()
                })
            }
        }

        this.setMentionSoundFunction()

        this.devicePixelRatio = this.getDevicePixelRatio();
    },
    methods: {
        login: async function (ev)
        {
            try {
                ev.preventDefault();
                this.isLoggingIn = true;

                // This is to make sure that the browser doesn't attempt to show the
                // "autocomplete" drop down list when pressing the arrow keys on the keyboard,
                // even when the textbox isn't visibile anymore (dunno why this happens, a firefox bug maybe).
                document.getElementById("username-textbox").blur()

                localStorage.setItem("username", this.username)
                localStorage.setItem("characterId", this.characterId)
                localStorage.setItem("areaId", this.areaId)

                window.addEventListener("resize", () =>
                {
                    this.isRedrawRequired = true;
                })

                await loadCharacterImagesPromise;
                enabledListenerIconImage = RenderCache.Image(await enabledListenerIconImagePromise, 0.8);
                disabledListenerIconImage = RenderCache.Image(await disabledListenerIconImagePromise, 0.8);

                const die = Math.random()
                if (this.characterId === "naito" && die < 0.25)
                    this.characterId = "funkynaito"
                if (this.characterId === "dokuo" && die < 0.15)
                    this.characterId = "tabako_dokuo"

                if (this.password == "iapetus56")
                    this.characterId = "shar_naito"

                this.loggedIn = true;
                this.selectedCharacter = characters[this.characterId];

                // wait next tick so that canvas-container gets rendered in the DOM
                await Vue.nextTick()

                const canvasHeight = localStorage.getItem("canvasHeight")
                if (canvasHeight)
                    document.getElementById("canvas-container").style.height = canvasHeight;

                await this.connectToServer(this.username);

                this.registerKeybindings();

                this.isLoggingIn = false;

                this.canvasContext = document.getElementById("room-canvas").getContext("2d");
                this.paintLoop();

                this.soundEffectVolume = localStorage.getItem(this.areaId + "soundEffectVolume") || 0

                this.updateAudioElementsVolume()

                if (window.Notification)
                {
                    if (Notification.permission == "granted")
                        this.notificationPermissionsGranted = true
                    else if (this.showNotifications)
                    {
                        const permission = await requestNotificationPermission()

                        this.notificationPermissionsGranted = permission == "granted"
                    }
                }

                $( "#sound-effect-volume" ).slider({
                    orientation: "vertical",
                    range: "min",
                    min: 0,
                    max: 1,
                    step: 0.01,
                    value: this.soundEffectVolume,
                    slide: ( event, ui ) => {
                        this.changeSoundEffectVolume(ui.value);
                    }
                });
                $( "#voice-volume" ).slider({
                    orientation: "vertical",
                    range: "min",
                    min: 0,
                    max: 100,
                    step: 1,
                    value: this.voiceVolume,
                    slide: ( event, ui ) => {
                        this.changeVoiceVolume(ui.value);
                    }
                });

                $( "#main-section" ).resizable({
                    handles: "e"
                })

                const VP8 = await isWebrtcReceiveCodecSupported(WebrtcCodec.VP8);
                const VP9 = await isWebrtcReceiveCodecSupported(WebrtcCodec.VP9);
                const H264 = await isWebrtcReceiveCodecSupported(WebrtcCodec.H264);
                const OPUS = await isWebrtcReceiveCodecSupported(WebrtcCodec.OPUS);
                const ISAC = await isWebrtcReceiveCodecSupported(WebrtcCodec.ISAC);

                logToServer(this.myUserID + " RECEIVE CODECS: VP8: " + VP8 + " VP9: " + VP9 + " H264: " + H264 + " OPUS: " + OPUS + " ISAC: " + ISAC)
            }
            catch (e)
            {
                console.error(e)
                if (e instanceof UserException)
                {
                    alert(i18n.t("msg." + e.message))
                }
                else
                {
                    alert(i18n.t("msg.unknown_error"))
                }
                window.location.reload();
            }
        },
        getSVGMode: function ()
        {
            return this.isCrispModeEnabled ? "crisp" : null;
        },
        reloadImages: async function ()
        {
            this.loadRoomBackground();
            this.loadRoomObjects();

            await (loadCharacters(this.getSVGMode()));
            this.isRedrawRequired = true;
        },
        setLanguage: function (code)
        {
            i18n.locale = code;
        },
        getLangCodes: function()
        {
            return Object.keys(i18n.messages);
        },
        openDialog: function (text, title, buttons, cancelButtonIndex, callback)
        {
            this.dialogPopupMessage = text;
            this.dialogPopupTitle = title;
            this.dialogPopupButtons = buttons;
            this.dialogPopupButtonIndex = cancelButtonIndex;
            this.dialogPopupCallback = callback;
            this.isDialogPopupOpen = true;
        },
        closeDialog: function (buttonIndex)
        {
            if (!this.isDialogPopupOpen) return null;
            if (!(buttonIndex >= 0))
            {
                if (this.dialogPopupButtonIndex >= 0)
                    buttonIndex = this.dialogPopupButtonIndex;
                else
                    return false;
            }
            
            this.isDialogPopupOpen = false;
            if (this.dialogPopupCallback)
            {
                this.dialogPopupCallback(buttonIndex);
                this.dialogPopupCallback = null;
            }
            return true;
        },
        showWarningToast: function (text)
        {
            this.openDialog(text,
                i18n.t("ui.warning_toast_title"),
                [i18n.t("ui.popup_button_ok")],
                0);
        },
        confirm: function (text, okCallback, cancelCallback, button)
        {
            // button param can be an array of two strings for confirm and cancel,
            // or one string to be used for confirm
            if (button == undefined)
            {
                button = [i18n.t("ui.popup_button_ok"),
                    i18n.t("ui.popup_button_cancel")];
            }
            else if (!Array.isArray(button))
            {
                button = [button, i18n.t("ui.popup_button_cancel")];
            }
            this.openDialog(text, null, button, 1, buttonIndex =>
            {
                if(buttonIndex == 0)
                    okCallback();
                else if (cancelCallback)
                    cancelCallback();
            });
        },
        loadRoomBackground: async function ()
        {
            const urlMode = (!this.getSVGMode() ? "" : "." + this.getSVGMode());

            const roomLoadId = this.roomLoadId;

            const image = await loadImage(this.currentRoom.backgroundImageUrl.replace(".svg", urlMode + ".svg"))

            if (this.roomLoadId != roomLoadId) return;
            this.currentRoom.backgroundImage = RenderCache.Image(image, this.currentRoom.scale);
            this.isRedrawRequired = true;
        },
        loadRoomObjects: async function (mode)
        {
            const urlMode = (!this.getSVGMode() ? "" : "." + this.getSVGMode());

            const roomLoadId = this.roomLoadId;

            await Promise.all(Object.values(this.currentRoom.objects).map(o =>
                loadImage("rooms/" + this.currentRoom.id + "/" + o.url.replace(".svg", urlMode + ".svg"))
                    .then((image) =>
                    {
                        const scale = o.scale ? o.scale : 1;
                        if (this.roomLoadId != roomLoadId) return;
                        o.image = RenderCache.Image(image, scale);

                        o.physicalPositionX = o.offset ? o.offset.x * scale : 0
                        o.physicalPositionY = o.offset ? o.offset.y * scale : 0
                        this.isRedrawRequired = true;
                    })
            ))
        },
        updateRoomState: async function (dto)
        {
            const roomDto = dto.currentRoom
            const usersDto = dto.connectedUsers
            const streamsDto = dto.streams

            if (!this.hideStreams && (dto.hideStreams || localStorage.getItem("hideStreams")))
                logToServer(this.myUserID + " setting hideStreams to true")

            if (dto.hideStreams)
                localStorage.setItem("hideStreams", "true")
            this.hideStreams = localStorage.getItem("hideStreams") == "true";

            this.chessboardState = dto.chessboardState

            this.isLoadingRoom = true;
            this.roomLoadId = this.roomLoadId + 1;

            if (this.currentRoom.needsFixedCamera)
                this.canvasManualOffset = { x: 0, y: 0 }

            const previousRoomId = this.currentRoom && this.currentRoom.id
            this.currentRoom = roomDto;

            if (this.currentRoom.id === 'jinja') {
                this.currentRoom.specialObjects[1].value = dto.coinCounter;
            }

            this.users = {};

            for (const u of usersDto)
            {
                this.addUser(u);
                if(previousRoomId != this.currentRoom.id && this.users[u.id].message)
                    this.displayUserMessage(u, this.users[u.id].message);
            }

            this.loadRoomBackground();
            this.loadRoomObjects();

            this.blockWidth = this.currentRoom.blockWidth ? this.currentRoom.blockWidth : BLOCK_WIDTH;
            this.blockHeight = this.currentRoom.blockHeight ? this.currentRoom.blockHeight : BLOCK_HEIGHT;

            // stream stuff
            await this.updateCurrentRoomStreams(streamsDto);

            // Force update of user coordinates using the current room's logics (origin coordinates, etc)
            this.forcePhysicalPositionRefresh();

            document.getElementById("room-canvas").focus();
            this.justSpawnedToThisRoom = true;
            this.isLoadingRoom = false;
            this.requestedRoomChange = false;
        },
        connectToServer: async function ()
        {
            const loginResponse = await postJson("/login", {
                userName: this.username,
                characterId: this.characterId,
                areaId: this.areaId,
                roomId: getSpawnRoomId(),
            });

            const loginMessage = await loginResponse.json();

            if (!loginMessage.isLoginSuccessful) throw new UserException(loginMessage.error);

            myUserID = this.myUserID = loginMessage.userId;
            this.myPrivateUserID = loginMessage.privateUserId;

            logToServer(new Date() + " " + this.myUserID
                + " window.EXPECTED_SERVER_VERSION: "+ window.EXPECTED_SERVER_VERSION
                + " loginMessage.appVersion: " + loginMessage.appVersion
                + " DIFFERENT: " + (window.EXPECTED_SERVER_VERSION != loginMessage.appVersion))
            if (window.EXPECTED_SERVER_VERSION != loginMessage.appVersion)
                this.pageRefreshRequired = true

            // prevent accidental page closing
            window.onbeforeunload = () => {

                if (this.loggedOut)
                    return null

                // Before onbeforeunload the socket has already died, so
                // i have to start it again here, in case the user
                // decides that he doesn't want to close the window.
                // UPDATE: might not be needed anymore now that we open the socket closeOnBeforeunload: false

                // this.initializeSocket();
                // if (this.mediaStream) this.stopStreaming();

                return "Are you sure?";
            }

            // load the room state before connecting the websocket, so that all
            // code handling websocket events (and paint() events) can assume that
            // currentRoom, streams etc... are all defined

            const response = await fetch("/areas/" + this.areaId + "/rooms/" + getSpawnRoomId())
            this.updateRoomState(await response.json())

            logToServer(new Date() + " " + this.myUserID + " User agent: " + navigator.userAgent)

            this.initializeSocket()
        },
        initializeSocket: function()
        {
            this.socket = io({
                extraHeaders: {"private-user-id": this.myPrivateUserID},
                closeOnBeforeunload: false,
            });

            const immanentizeConnection = async () =>
            {
                // it can happen that the user is pressing the arrow keys while the
                // socket is down, in which case the server will never answer to the
                // user-move event, and isWaitingForServerResponseOnMovement will never
                // be reset. So, just in case, I reset it at every socket reconnection.
                this.isWaitingForServerResponseOnMovement = false

                this.connectionLost = false;

                // Check if there's a new version
                const response = await fetch("/version");
                if (!response.ok)
                    throw new Error(response)
                const newVersion = await response.json();
                if (newVersion > window.EXPECTED_SERVER_VERSION)
                    this.pageRefreshRequired = true
            }

            this.socket.on("connect", immanentizeConnection);
            this.socket.on("reconnect", immanentizeConnection);

            this.socket.on('connect_error', (error) => {
                console.error(error)
                logToServer(new Date() + " " + this.myUserID + " connect_error: " + error)
            });

            this.socket.on("disconnect", (reason) =>
            {
                if (!this.loggedOut)
                {
                    console.error("Socket disconnected:", reason)
                    this.connectionLost = true;
                }
            });
            this.socket.on("server-cant-log-you-in", () =>
            {
                this.connectionRefused = true;
            });

            this.socket.on("server-update-current-room-state", (dto) =>
            {
                this.updateRoomState(dto);
            });

            this.socket.on("server-msg", (userId, msg) =>
            {
                const user = this.users[userId]
                if (user)
                {
                    user.isInactive = false;
                    this.displayUserMessage(user, msg);
                }
                else
                {
                    console.error("Received message", msg, "from user", userId)
                }
            });

            this.socket.on("server-system-message", (messageCode, extra) =>
            {
                let message = i18n.t("msg." + messageCode);
                if (messageCode == "flood_warning")
                    message += extra;
                
                this.writeMessageToLog("SYSTEM", message, null)
            });

            this.socket.on("server-stats", (serverStats) =>
            {
                this.serverStats = serverStats;
            });

            this.socket.on("server-move", (dto) =>
            {
                const { userId, x, y, direction, isInstant, shouldSpinwalk } = dto

                const user = this.users[userId];

                user.isInactive = false

                const oldX = user.logicalPositionX;
                const oldY = user.logicalPositionY;

                if (isInstant)
                    user.moveImmediatelyToPosition(this.currentRoom, x, y, direction);
                else user.moveToPosition(x, y, direction);

                if (userId == this.myUserID)
                {
                    this.isWaitingForServerResponseOnMovement = false;
                    if (oldX != x || oldY != y) this.justSpawnedToThisRoom = false;
                }
                if (shouldSpinwalk)
                    user.makeSpin()
                this.updateCanvasObjects();
            });

            this.socket.on("server-bubble-position", (userId, position) =>
            {
                const user = this.users[userId];

                user.isInactive = false
                user.bubblePosition = position;
                user.bubbleImage = null;
                this.isRedrawRequired = true;
            });

            this.socket.on("server-reject-movement",
                () => (this.isWaitingForServerResponseOnMovement = false)
            );

            this.socket.on("server-user-joined-room", async (user) =>
            {
                if (this.isLoginSoundEnabled && this.soundEffectVolume > 0)
                    document.getElementById("login-sound").play();
                this.addUser(user);
                this.updateCanvasObjects();
                this.isRedrawRequired = true;
            });

            this.socket.on("server-user-left-room", (userId) =>
            {
                if (userId != this.myUserID) delete this.users[userId];
                this.updateCanvasObjects();
                this.isRedrawRequired = true;
            });

            this.socket.on("server-user-inactive", (userId) =>
            {
                if (!this.users[userId])
                {
                    logToServer(this.myUserID + " Received server-user-inactive for non-existing user " + userId)
                    return
                }

                this.users[userId].isInactive = true;
                this.isRedrawRequired = true;
            });

            this.socket.on("server-user-active", (userId) =>
            {
                if (!this.users[userId])
                {
                    logToServer(this.myUserID + " Received server-user-active for non-existing user " + userId)
                    return
                }

                this.users[userId].isInactive = false;
                this.isRedrawRequired = true;
            });

            this.socket.on("server-not-ok-to-stream", (reason) =>
            {
                this.wantToStream = false;
                this.stopStreaming();
                this.showWarningToast(i18n.t("msg." + reason));
            });
            this.socket.on("server-not-ok-to-take-stream", (streamSlotId) =>
            {
                this.wantToDropStream(streamSlotId);
            });
            this.socket.on("server-ok-to-stream", () =>
            {
                this.wantToStream = false;
                this.startStreaming();
            });
            this.socket.on("server-update-current-room-streams", async (streams) =>
            {
                await this.updateCurrentRoomStreams(streams);
            });

            this.socket.on("server-room-list", async (roomList) =>
            {
                roomList.forEach(r => {
                    r.sortName = i18n.t("room." + r.id, {reading: true});
                    r.streamerCount = r.streams.length;
                    r.streamerDisplayNames = r.streams.map(s => this.toDisplayName(s.userName))
                })
                this.roomList = roomList;
                this.rulaRoomGroup = "all";
                this.prepareRulaRoomList()
                this.isRulaPopupOpen = true;

                await Vue.nextTick()
                document.getElementById("rula-popup").focus()
            });

            this.socket.on("server-rtc-message", async (streamSlotId, type, msg) =>
            {
                console.log("server-rtc-message", streamSlotId, type, msg);
                const rtcPeer = this.rtcPeerSlots[streamSlotId].rtcPeer;
                if (rtcPeer === null) return;
                if(type == "offer")
                {
                    rtcPeer.acceptOffer(msg);
                }
                else if(type == "answer")
                {
                    // msg = msg.replace(/\r\n.*candidate.*udp.*\r\n/g, "\r\n");
                    // console.log(msg)
                    rtcPeer.acceptAnswer(msg);
                }
                else if(type == "candidate")
                {
                    rtcPeer.addCandidate(msg);
                }
            });

            this.socket.on("server-character-changed", (userId, characterId, isAlternateCharacter) => {
                this.users[userId].character = characters[characterId]
                this.users[userId].isAlternateCharacter = isAlternateCharacter
                this.isRedrawRequired = true
            })

            this.socket.on("server-update-chessboard", (state) => {
                this.chessboardState = state
            })

            this.socket.on("server-chess-win", winnerUserId => {
                const winnerUserName = this.toDisplayName(this.users[winnerUserId] ? this.users[winnerUserId].name : "N/A")

                this.writeMessageToLog("SYSTEM", i18n.t("msg.chess_win").replace("@USER_NAME@", winnerUserName), null)
            })

            this.socket.on("server-chess-quit", winnerUserId => {
                const winnerUserName = this.toDisplayName(this.users[winnerUserId] ? this.users[winnerUserId].name : "N/A")

                this.writeMessageToLog("SYSTEM", i18n.t("msg.chess_quit").replace("@USER_NAME@", winnerUserName), null)
            })
            this.socket.on("special-events:server-add-shrine-coin", donationBoxValue => {
                this.currentRoom.specialObjects[1].value = donationBoxValue;
                this.lastCoinTossTime = Date.now();
                this.isRedrawRequired = true;
                if (this.soundEffectVolume > 0 && this.isCoinSoundEnabled) {
                    document.getElementById("ka-ching-sound").play();
                }
                setTimeout(() => {
                    this.isRedrawRequired = true;
                }, 1200)
            })
        },
        addUser: function (userDTO)
        {
            const newUser = new User(characters[userDTO.characterId], userDTO.name);
            newUser.moveImmediatelyToPosition(
                this.currentRoom,
                userDTO.position.x,
                userDTO.position.y,
                userDTO.direction
            );
            newUser.isInactive = userDTO.isInactive;
            newUser.message = userDTO.lastRoomMessage;
            newUser.bubblePosition = userDTO.bubblePosition;
            newUser.id = userDTO.id;
            newUser.voicePitch = userDTO.voicePitch
            newUser.isAlternateCharacter = userDTO.isAlternateCharacter

            this.users[userDTO.id] = newUser;
        },
        writeMessageToLog: function(userName, msg, userId)
        {
            const chatLog = document.getElementById("chatLog");
            const isAtBottom = (chatLog.scrollHeight - chatLog.clientHeight) - chatLog.scrollTop < 5;

            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");

            messageDiv.dataset.userId = userId
            if (userId && userId == this.highlightedUserId)
                messageDiv.classList.add("highlighted-message")

            if (!userId && userName == "SYSTEM")
                messageDiv.classList.add("system-message")

            if (this.ignoredUserIds.has(userId))
                messageDiv.classList.add("ignored-message")

            const [displayName, tripcode] = this.toDisplayName(userName).split("◆")

            const timestampSpan = document.createElement("span")
            timestampSpan.className = "message-timestamp"
            timestampSpan.innerHTML = "[" + getFormattedCurrentDate() + "]&nbsp;"

            const authorSpan = document.createElement("span");
            authorSpan.className = "message-author";
            authorSpan.title = new Date()
            authorSpan.textContent = displayName;
            authorSpan.addEventListener("click", (ev) => {
                this.highlightUser(userId, this.toDisplayName(userName))
            })

            const tripcodeSpan = document.createElement("span");
            if (tripcode)
            {
                tripcodeSpan.className = "message-author";
                tripcodeSpan.title = new Date()
                tripcodeSpan.textContent = "◆" + tripcode;
                tripcodeSpan.addEventListener("click", (ev) => {
                    this.highlightUser(userId, this.toDisplayName(userName))
                })
            }

            const bodySpan = document.createElement("span");
            bodySpan.className = "message-body";
            bodySpan.textContent = msg;
            bodySpan.innerHTML = bodySpan.innerHTML
                .replace(urlRegex, (htmlUrl, prefix) =>
                {
                    const anchor = document.createElement('a');
                    anchor.target = '_blank';
                    anchor.setAttribute('tabindex', '-1');
                    anchor.innerHTML = htmlUrl;
                    const url = anchor.textContent;
                    anchor.href = (prefix == 'www.' ? 'http://' + url : url);
                    anchor.textContent = safeDecodeURI(url);
                    return anchor.outerHTML;
                });

            messageDiv.append(timestampSpan);
            messageDiv.append(authorSpan);
            messageDiv.append(tripcodeSpan);
            messageDiv.append(document.createTextNode(i18n.t("message_colon")));
            messageDiv.append(bodySpan);

            chatLog.appendChild(messageDiv);

            if (isAtBottom)
                chatLog.scrollTop = chatLog.scrollHeight -
                    chatLog.clientHeight;
        },
        displayUserMessage: async function (user, msg)
        {
            const isIgnored = this.ignoredUserIds.has(user.id);

            const plainMsg = msg.replace(urlRegex, s => safeDecodeURI(s));

            user.message = plainMsg;
            if(user.lastMessage != user.message)
            {
                user.bubbleImage = null;
                if (!isIgnored)
                    this.isRedrawRequired = true;
                user.lastMessage = user.message;
            }

            if(!user.message) return;

            this.writeMessageToLog(user.name, msg, user.id)

            if (isIgnored) return;

            if (this.soundEffectVolume > 0)
            {
                if (this.mentionSoundFunction &&
                    this.mentionSoundFunction(plainMsg))
                    document.getElementById("mention-sound").play();
                else if (this.isMessageSoundEnabled)
                    document.getElementById("message-sound").play();
            }

            if (this.enableTextToSpeech)
            {
                speak(plainMsg, this.ttsVoiceURI, this.voiceVolume, user.voicePitch)
            }

            if (window.Notification)
            {
                if (!this.showNotifications
                    || document.visibilityState == "visible"
                    || user.id == this.myUserID) return;

                const permission = await requestNotificationPermission()
                if (permission != "granted") return;

                const character = user.character
                new Notification(this.toDisplayName(user.name) + ": " + plainMsg,
                    {
                        icon: "characters/" + character.characterName + "/front-standing." + character.format
                    })
            }
        },
        toDisplayName: function (name)
        {
            if (name == "")
                return i18n.t("default_user_name");
            return name;
        },
        clearLog: function ()
        {
            this.confirm(i18n.t("msg.are_you_sure_you_want_to_clear_log"), () =>
            {
                document.getElementById("chatLog").innerHTML = '';
                this.showWarningToast(i18n.t("msg.chat_log_cleared"));
            });
        },
        drawImage: function (context, image, x, y)
        {
            if (!x) x = 0;
            if (!y) y = 0;
            context.drawImage(
                image,
                Math.round(this.getCanvasScale() * x + this.canvasGlobalOffset.x),
                Math.round(this.getCanvasScale() * y + this.canvasGlobalOffset.y)
            );
        },
        getNameImage: function(user, withBackground)
        {
            const [displayName, tripcode] = this.toDisplayName(user.name).split("◆")

            const lineHeight = 13
            const height = lineHeight * (tripcode && displayName ? 2 : 1) + 3;

            const fontPrefix = "bold ";
            const fontSuffix = "px Arial, Helvetica, sans-serif";

            const highlightedUserId = this.highlightedUserId;

            return new RenderCache(function(canvas, scale)
            {
                const context = canvas.getContext('2d');
                context.font = fontPrefix + lineHeight + fontSuffix;

                const width = Math.max(
                    displayName ? Math.ceil(context.measureText(displayName).width) : 0,
                    tripcode ? Math.ceil(context.measureText("◆" + tripcode).width) : 0,
                ) + 5;

                canvas.width = width * scale;
                canvas.height = height * scale;

                // transparent background
                if (withBackground)
                {
                    context.globalAlpha = 0.5
                    context.fillStyle = 'white';
                    context.fillRect(0, 0, canvas.width, canvas.height)
                    context.globalAlpha = 1
                }

                // text
                const scaledLineHeight = lineHeight * scale;
                context.font = fontPrefix + scaledLineHeight + fontSuffix;
                context.textBaseline = "middle";
                context.textAlign = "center"
                context.fillStyle = user.id == highlightedUserId ? "red" : "blue";

                if (tripcode && displayName)
                {
                    // I don't quite understand why 0.25 works but 0.333 doesn't
                    context.fillText(displayName, canvas.width/2, canvas.height * 0.25 + 1 * scale);
                    context.fillText("◆" + tripcode, canvas.width/2, canvas.height*2/3 + 1 * scale);
                }
                else
                {
                    context.fillText(displayName ? displayName : "◆" + tripcode, canvas.width/2, canvas.height/2 + 1 * scale);
                }

                return [width, height];
            });
        },
        getBubbleImage: function(user)
        {
            const maxLineWidth = 250;
            const lineHeight = 15;
            const fontHeight = 13;
            const fontSuffix = "px IPAMonaPGothic,'IPA モナー Pゴシック',Monapo,Mona,'MS PGothic','ＭＳ Ｐゴシック',submona,sans-serif";

            const boxArrowOffset = 5;
            const boxMargin = 6;
            const boxPadding = [5, 3];

            let messageLines = user.message.split(/\r\n|\n\r|\n|\r/);
            let preparedLines = null;
            let textWidth = null;

            const arrowCorner = [
                ["down", "left"].includes(user.bubblePosition),
                ["up", "left"].includes(user.bubblePosition)];

            return new RenderCache((canvas, scale) =>
            {
                const context = canvas.getContext('2d');
                context.font = fontHeight + fontSuffix;

                if (preparedLines === null)
                {
                    preparedLines = [];
                    textWidth = 0;

                    while (messageLines.length && preparedLines.length < 5)
                    {
                        const line = messageLines.shift()
                        let lastPreparedLine = "";
                        let lastLineWidth = 0;
                        for (let i=0; i<line.length; i++)
                        {
                            const preparedLine = line.substring(0, i+1);
                            const lineWidth = context.measureText(preparedLine).width
                            if (lineWidth > maxLineWidth)
                            {
                                if (i == 0)
                                {
                                    lastPreparedLine = preparedLine;
                                    lastLineWidth = maxLineWidth;
                                }
                                break;
                            }
                            lastPreparedLine = preparedLine;
                            lastLineWidth = lineWidth;
                        }
                        preparedLines.push(lastPreparedLine)
                        if (line.length > lastPreparedLine.length)
                            messageLines.unshift(line.substring(lastPreparedLine.length))
                        textWidth = Math.max(textWidth, lastLineWidth);
                    }
                    messageLines = null;
                }

                const boxWidth = textWidth + 2 * boxPadding[0];
                const boxHeight = preparedLines.length * lineHeight + 2 * boxPadding[1];


                const sLineHeight = lineHeight * scale
                const sFontHeight = fontHeight * scale;

                const sBoxArrowOffset = boxArrowOffset * scale;
                const sBoxMargin = boxMargin * scale;
                const sBoxPadding = [boxPadding[0] * scale, boxPadding[1] * scale];

                const sBoxWidth = boxWidth * scale
                const sBoxHeight = boxHeight * scale

                canvas.width = sBoxWidth + sBoxMargin;
                canvas.height = sBoxHeight + sBoxMargin;

                context.fillStyle = 'rgba(255, 255, 255, ' + (this.bubbleOpacity/100) +　')';

                context.beginPath();

                // arrow
                context.moveTo(
                    (arrowCorner[0] ? sBoxWidth : sBoxMargin),
                    (arrowCorner[1] ? sBoxHeight - sBoxArrowOffset : sBoxMargin + sBoxArrowOffset));
                context.lineTo(
                    arrowCorner[0] * canvas.width,
                    arrowCorner[1] * canvas.height);
                context.lineTo(
                    (arrowCorner[0] ? sBoxWidth - sBoxArrowOffset : sBoxMargin + sBoxArrowOffset),
                    (arrowCorner[1] ? sBoxHeight : sBoxMargin));

                // bubble corners
                context.lineTo(
                    (arrowCorner[0] ? 0 : sBoxWidth + sBoxMargin),
                    (arrowCorner[1] ? sBoxHeight : sBoxMargin));
                context.lineTo(
                    (arrowCorner[0] ? 0 : sBoxWidth + sBoxMargin),
                    (arrowCorner[1] ? 0 : sBoxHeight + sBoxMargin));
                context.lineTo(
                    (arrowCorner[0] ? sBoxWidth : sBoxMargin),
                    (arrowCorner[1] ? 0 : sBoxHeight + sBoxMargin));

                context.closePath();
                context.fill();

                context.font = sFontHeight + fontSuffix;
                context.textBaseline = "middle";
                context.textAlign = "left"
                context.fillStyle = "black";

                for (let i=0; i<preparedLines.length; i++)
                {
                    context.fillText(preparedLines[i],
                        !arrowCorner[0] * sBoxMargin + sBoxPadding[0],
                        !arrowCorner[1] * sBoxMargin + sBoxPadding[1] + (i*sLineHeight) + (sLineHeight/2));
                }

                return [boxWidth + boxMargin, boxHeight + boxMargin]
            });
        },
        detectCanvasResize: function ()
        {
            const devicePixelRatio = this.getDevicePixelRatio();

            const offsetWidth = this.canvasContext.canvas.offsetWidth * devicePixelRatio;
            const offsetHeight = this.canvasContext.canvas.offsetHeight * devicePixelRatio

            if (this.canvasDimensions.w != offsetWidth ||
                this.canvasDimensions.h != offsetHeight ||
                this.devicePixelRatio != devicePixelRatio)
            {
                this.canvasDimensions.w = offsetWidth;
                this.canvasDimensions.h = offsetHeight;

                this.canvasContext.canvas.width = this.canvasDimensions.w;
                this.canvasContext.canvas.height = this.canvasDimensions.h;

                this.devicePixelRatio = devicePixelRatio
            }
        },
        setCanvasGlobalOffset: function ()
        {
            if (this.currentRoom.needsFixedCamera)
            {
                const fixedCameraOffset = this.currentRoom.backgroundOffset ||
                    { x: 0, y: 0 };
                this.canvasGlobalOffset.x = this.getCanvasScale() * -fixedCameraOffset.x
                this.canvasGlobalOffset.y = this.getCanvasScale() * -fixedCameraOffset.y
                return;
            }

            const userOffset = { x: 0, y: 0 };
            if (this.myUserID in this.users)
            {
                const user = this.users[this.myUserID]

                userOffset.x -= this.getCanvasScale() * (user.currentPhysicalPositionX + this.blockWidth/2) - this.canvasDimensions.w / 2,
                    userOffset.y -= this.getCanvasScale() * (user.currentPhysicalPositionY - 60) - this.canvasDimensions.h / 2
            }

            const manualOffset = {
                x: this.userCanvasScale * this.canvasManualOffset.x,
                y: this.userCanvasScale * this.canvasManualOffset.y
            }

            const canvasOffset = {
                x: manualOffset.x + userOffset.x,
                y: manualOffset.y + userOffset.y
            };

            const backgroundImage = this.currentRoom.backgroundImage.getImage(this.getCanvasScale())

            const bcDiff =
                {
                    w: backgroundImage.width - this.canvasDimensions.w,
                    h: backgroundImage.height - this.canvasDimensions.h
                }

            const margin = (this.currentRoom.isBackgroundImageOffsetEdge ?
                {w: 0, h: 0} : this.canvasDimensions);

            let isAtEdge = false;

            if (canvasOffset.x > margin.w)
            {isAtEdge = true; manualOffset.x = margin.w - userOffset.x}
            else if(canvasOffset.x < -margin.w - bcDiff.w)
            {isAtEdge = true; manualOffset.x = -margin.w - (bcDiff.w + userOffset.x)}

            if (canvasOffset.y > margin.h)
            {isAtEdge = true; manualOffset.y = margin.h - userOffset.y}
            else if(canvasOffset.y < -margin.h - bcDiff.h)
            {isAtEdge = true; manualOffset.y = -margin.h - (bcDiff.h + userOffset.y)}

            if (isAtEdge)
            {
                canvasOffset.x = manualOffset.x + userOffset.x
                canvasOffset.y = manualOffset.y + userOffset.y
                this.isCanvasPointerDown = false;
            }

            this.canvasGlobalOffset.x = canvasOffset.x;
            this.canvasGlobalOffset.y = canvasOffset.y;
        },

        calculateUserPhysicalPositions: function (delta)
        {
            for (const id in this.users)
            {
                this.users[id].calculatePhysicalPosition(this.currentRoom, delta);
            }
        },

        updateCanvasObjects: (() =>
        {
            let self;

            function scanCanvasObjects (canvasObjects, objectsByPosition,
                                        fromX, toX, fromY, toY)
            {
                const width = (toX-fromX)+1;
                const height = (toY-fromY)+1;

                const diagonals = width+height-1;

                for (let d=0; d<=diagonals; d++)
                {
                    let vx = d<width ? d : width-1;
                    let vy = d<width ? 0 : d-width;
                    while (vx >= 0 && vy < height)
                    {
                        const x = vx + fromX;
                        const y = toY - vy;

                        vx--;
                        vy++;

                        const key = x + "," + y;
                        if (!(key in objectsByPosition)) continue;

                        const cell = objectsByPosition[key];
                        if (cell.isDone) continue;

                        // scan for background objects to push
                        // before pushing the current objects
                        const widthOfObjects = cell.objects.reduce((w, o) =>
                            (o.o.width > 1 ? Math.max(w, o.o.width) : w), 1);
                        if (widthOfObjects > 1)
                            scanCanvasObjects(canvasObjects, objectsByPosition,
                                x+1, (x+1)+(widthOfObjects-2), y+1, toY);

                        const heightOfObjects = cell.objects.reduce((w, o) =>
                            (o.o.height > 1 ? Math.max(w, o.o.height) : w), 1);
                        if (heightOfObjects > 1)
                            scanCanvasObjects(canvasObjects, objectsByPosition,
                                fromX, x-1, (y-1)-(heightOfObjects-2), y-1);

                        canvasObjects.push(...cell.objects);

                        cell.isDone = true;
                    }
                }
            }

            function addObject (o, objectsByPosition)
            {
                const key = o.x + "," + o.y;
                if (key in objectsByPosition)
                {
                    objectsByPosition[key].objects.push(o);
                }
                else
                {
                    objectsByPosition[key] =
                        {
                            objects: [o],
                            isDone: false
                        };
                }
            }

            function getObjectsByDiagonalScanSort()
            {
                const objectsByPosition = {};

                self.currentRoom.objects.forEach(o => addObject({
                    o,
                    type: "room-object",
                    x: o.x,
                    y: o.y
                }, objectsByPosition));

                Object.values(self.users)
                    .sort((a, b) => {
                        if (a.id == self.highlightedUserId)
                            return 1
                        if (b.id == self.highlightedUserId)
                            return -1
                        return a.id.localeCompare(b.id);
                    })
                    .forEach(o => addObject({
                        o,
                        type: "user",
                        x: o.logicalPositionX,
                        y: o.logicalPositionY
                    }, objectsByPosition));

                const canvasObjects = [];
                scanCanvasObjects(canvasObjects, objectsByPosition,
                    0, self.currentRoom.size.x, -1, self.currentRoom.size.y-1);
                // x to room size.x and y from -1 to allow for foreground objects

                return canvasObjects;
            }

            function getObjectsByPrioritySort()
            {
                return [].concat(
                    self.currentRoom.objects
                        .map(o => ({
                            o,
                            type: "room-object",
                        })),
                    Object.values(self.users).map(o => ({
                        o,
                        type: "user",
                    })),
                )
                    .sort((a, b) =>
                    {
                        const calculatePriority = (o) => o.type == "room-object"
                            ? o.o.x + 1 + (self.currentRoom.size.y - o.o.y)
                            : o.o.logicalPositionX + 1 + (self.currentRoom.size.y - o.o.logicalPositionY)

                        const aPriority = calculatePriority(a)
                        const bPriority = calculatePriority(b)

                        if (aPriority < bPriority) return -1;
                        if (aPriority > bPriority) return 1;

                        // If it's two users in the same spot, put the highlighted one on top.
                        if (a.type == "user" && b.type == "user")
                        {
                            if (a.o.id == self.highlightedUserId)
                                return 1
                            if (b.o.id == self.highlightedUserId)
                                return -1
                            return a.o.id.localeCompare(b.o.id);
                        }
                        
                        return 0
                    });
            }

            return function ()
            {
                self = this;

                if (this.currentRoom.objectRenderSortMethod == "diagonal_scan")
                {
                    this.canvasObjects = getObjectsByDiagonalScanSort();
                }
                else
                {
                    this.canvasObjects = getObjectsByPrioritySort();
                }
            };
        })(),

        paintBackground: function ()
        {
            const context = this.canvasContext;

            if (this.currentRoom.backgroundColor)
                context.fillStyle = this.currentRoom.backgroundColor;
            else
                context.fillStyle = this.isDarkMode ? "#354F52" : "#b0b0b0";
            context.fillRect(0, 0, this.canvasDimensions.w, this.canvasDimensions.h);

            this.drawImage(
                context,
                this.currentRoom.backgroundImage.getImage(this.getCanvasScale())
            );
        },

        drawObjects: function ()
        {
            const context = this.canvasContext;

            for (const o of this.canvasObjects)
            {
                if (o.type == "room-object")
                {
                    if (!o.o.image) continue;

                    this.drawImage(
                        context,
                        o.o.image.getImage(this.getCanvasScale()),
                        o.o.physicalPositionX,
                        o.o.physicalPositionY
                    );
                } // o.type == "user"
                else
                {
                    // Don't draw ignored users
                    if (this.ignoredUserIds.has(o.o.id)) continue

                    context.save();

                    if (o.o.isInactive)
                        context.globalAlpha = 0.5

                    const renderImage = o.o.getCurrentImage(this.currentRoom);
                    this.drawImage(
                        context,
                        renderImage.getImage(this.getCanvasScale()),
                        o.o.currentPhysicalPositionX + this.blockWidth/2 - renderImage.width/2,
                        o.o.currentPhysicalPositionY - renderImage.height
                    );

                    context.restore()
                }
            }
        },

        drawUsernames: function ()
        {
            for (const o of this.canvasObjects.filter(o => o.type == "user" && !this.ignoredUserIds.has(o.o.id)))
            {
                if (o.o.nameImage == null || this.isUsernameRedrawRequired)
                    o.o.nameImage = this.getNameImage(o.o, this.showUsernameBackground);

                const image = o.o.nameImage.getImage(this.getCanvasScale())

                this.drawImage(
                    this.canvasContext,
                    image,
                    o.o.currentPhysicalPositionX + this.blockWidth/2 - o.o.nameImage.width/2,
                    o.o.currentPhysicalPositionY - 120
                );
            }
            if (this.isUsernameRedrawRequired)
                this.isUsernameRedrawRequired = false;
        },

        resetBubbleImages: function ()
        {
            for (const u in this.users)
            {
                this.users[u].bubbleImage = null;
            }
            this.isRedrawRequired = true;
        },
        drawBubbles: function()
        {
            for (const o of this.canvasObjects.filter(o => o.type == "user" && !this.ignoredUserIds.has(o.o.id)))
            {
                const user = o.o;

                if (!user.message) continue;

                if (user.bubbleImage == null)
                    user.bubbleImage = this.getBubbleImage(user)

                const image = user.bubbleImage.getImage(this.getCanvasScale())

                const pos = [
                    ["up", "right"].includes(user.bubblePosition),
                    ["down", "right"].includes(user.bubblePosition)];

                this.drawImage(
                    this.canvasContext,
                    image,
                    user.currentPhysicalPositionX + this.blockWidth/2
                    + (pos[0] ? 21 : -21 - user.bubbleImage.width),
                    user.currentPhysicalPositionY
                    - (pos[1] ? 62 : 70 + user.bubbleImage.height)
                );
            }
        },
        drawPrivateStreamIcons: function ()
        {
            // these icons are visible only the streamers who chose "specific_users" as stream target.
            if (!this.isStreaming() || this.streamTarget == "all_room")
                return

            const users = this.canvasObjects
                .filter(o => o.type == "user"
                             && !this.ignoredUserIds.has(o.o.id)
                             && o.o.id != myUserID)
                .map(o => o.o)

            for (const o of users)
            {
                const image = (this.allowedListenerIDs.has(o.id) ? enabledListenerIconImage : disabledListenerIconImage)
                    .getImage(this.getCanvasScale());

                this.drawImage(
                    this.canvasContext,
                    image,
                    o.currentPhysicalPositionX + 60,
                    o.currentPhysicalPositionY - 100
                );
            }
        },
        drawOriginLines: function ()
        {
            const context = this.canvasContext;

            context.strokeStyle = "#ff0000";

            const co = this.canvasGlobalOffset;

            context.beginPath();
            context.moveTo(co.x+11, co.y-1);
            context.lineTo(co.x-1, co.y-1);
            context.lineTo(co.x-1, co.y+10);
            context.stroke();

            const origin = calculateRealCoordinates(this.currentRoom, 0, 0)

            const cr_x = co.x + origin.x * this.getCanvasScale();
            const cr_y = co.y + origin.y * this.getCanvasScale();

            context.beginPath();
            context.rect(cr_x - 1,
                cr_y + 1,
                (this.blockWidth + 2) * this.getCanvasScale(),
                (-this.blockHeight - 2) * this.getCanvasScale());
            context.stroke();

            const cc_x = co.x + this.currentRoom.originCoordinates.x * this.getCanvasScale();
            const cc_y = co.y + this.currentRoom.originCoordinates.y * this.getCanvasScale();

            context.strokeStyle = "#0000ff";

            context.beginPath();
            context.moveTo(co.x-1, co.y);
            context.lineTo(cc_x, co.y);
            context.lineTo(cc_x, cc_y);
            context.stroke();
        },

        drawSpecialObjects: function () {
            if (this.currentRoom.id === 'jinja') {
                if (Date.now() - this.lastCoinTossTime < 1000)
                {
                    const context = this.canvasContext;
                    context.font = "bold 16px Arial, Helvetica, sans-serif";
                    context.textBaseline = "bottom";
                    context.textAlign = "right";
                    context.fillStyle = "yellow";
                    
                    //draw and redraw the coin donation box
                    const specialObjectShrineText = this.currentRoom.specialObjects.find(o => o.name == "donation-text");
                    const specialObjectDonationBox = this.currentRoom.specialObjects.find(o => o.name == "donation-box");
                    
                    const realTextCoordinates = calculateRealCoordinates(this.currentRoom, specialObjectShrineText.x, specialObjectShrineText.y);
                    
                    context.fillText(
                        "¥" + specialObjectDonationBox.value,
                        (realTextCoordinates.x * this.getCanvasScale()) + this.canvasGlobalOffset.x,
                        (realTextCoordinates.y * this.getCanvasScale()) + this.canvasGlobalOffset.y
                    );
                }
            }
        },

        canvasClick: function(clickEvent)
        {
            if (this.currentRoom.id === 'jinja') {
                const specialObjectDonationBox = this.currentRoom.specialObjects.find(o => o.name == "donation-box");
                const realDonationBoxCoordinates = calculateRealCoordinates(this.currentRoom, specialObjectDonationBox.x, specialObjectDonationBox.y)

                realDonationBoxCoordinates.x = (realDonationBoxCoordinates.x * this.getCanvasScale()) + this.canvasGlobalOffset.x;
                realDonationBoxCoordinates.y = (realDonationBoxCoordinates.y * this.getCanvasScale()) + this.canvasGlobalOffset.y;
                
                const mouseCursor = getClickCoordinatesWithinCanvas(document.getElementById("room-canvas"), clickEvent, this.devicePixelRatio)

                //add some margin of error for the event area
                if (
                    mouseCursor.x >= realDonationBoxCoordinates.x - 20 * this.getCanvasScale() &&
                    mouseCursor.x <= realDonationBoxCoordinates.x + this.blockWidth * this.getCanvasScale() &&
                    mouseCursor.y >= realDonationBoxCoordinates.y - this.blockHeight * this.getCanvasScale() - 20 * this.getCanvasScale() &&
                    mouseCursor.y <= realDonationBoxCoordinates.y
                ) {
                    this.socket.emit("special-events:client-add-shrine-coin");
                }
            }
        },

        drawGridNumbers: function ()
        {
            const context = this.canvasContext;

            context.font = "bold 13px Arial, Helvetica, sans-serif";
            context.textBaseline = "bottom";
            context.textAlign = "center";

            for (let x = 0; x < this.currentRoom.size.x; x++)
                for (let y = 0; y < this.currentRoom.size.y; y++)
                {
                    context.fillStyle = "#0000ff";
                    if (Object.values(this.currentRoom.doors).find(d => d.x == x && d.y == y))
                        context.fillStyle = "#00cc00";
                    if (this.currentRoom.blocked.find(b => b.x == x && b.y == y))
                        context.fillStyle = "#ff0000";
                    if (this.currentRoom.sit.find(b => b.x == x && b.y == y))
                        context.fillStyle = "yellow";
                    const realCoord = calculateRealCoordinates(
                        this.currentRoom,
                        x,
                        y
                    );
                    context.fillText(
                        x + "," + y,
                        this.getCanvasScale() * (realCoord.x + this.blockWidth/2) + this.canvasGlobalOffset.x,
                        this.getCanvasScale() * (realCoord.y - this.blockHeight/3) + this.canvasGlobalOffset.y
                    );
                }
        },

        paint: function (delta)
        {
            if (this.isLoadingRoom || !this.currentRoom.backgroundImage)
                return;

            this.detectCanvasResize();

            const usersRequiringRedraw = [];
            for (const [userId, user] of Object.entries(this.users))
                if (user.checkIfRedrawRequired()) usersRequiringRedraw.push(userId);

            if (this.isRedrawRequired
                || this.isDraggingCanvas
                || usersRequiringRedraw.length
                || this.enableGridNumbers)
            {
                this.calculateUserPhysicalPositions(delta);
                this.setCanvasGlobalOffset();
                this.paintBackground();
                this.drawObjects();
                this.drawUsernames();
                this.drawPrivateStreamIcons();
                this.drawBubbles();
                this.drawSpecialObjects();
                if (this.enableGridNumbers)
                {
                    this.drawOriginLines();
                    this.drawGridNumbers();
                }
                this.isRedrawRequired = false;
            }

            this.changeRoomIfSteppingOnDoor();
        },

        paintLoop: function (timestamp)
        {
            const delta = this.lastFrameTimestamp === null ? 0 : timestamp - this.lastFrameTimestamp;

            this.lastFrameTimestamp = timestamp

            this.paint(delta)

            requestAnimationFrame(this.paintLoop);
        },
        changeRoomIfSteppingOnDoor: function ()
        {
            if (this.justSpawnedToThisRoom) return;
            if (this.isWaitingForServerResponseOnMovement) return;
            if (this.requestedRoomChange) return;

            const currentUser = this.users[this.myUserID];

            if (currentUser.isWalking) return;

            const door = Object.values(this.currentRoom.doors).find(
                (d) =>
                    d.target !== null &&
                    d.x == currentUser.logicalPositionX &&
                    d.y == currentUser.logicalPositionY
            );

            if (!door) return;

            const { roomId, doorId } = door.target;

            this.changeRoom(roomId, doorId);
        },
        changeRoom: async function (targetRoomId, targetDoorId)
        {
            if (this.mediaStream) this.stopStreaming();
            for (let i = 0; i < this.takenStreams.length; i++)
            {
                await this.dropStream(i)
                // when going to a new room, all streams must be off by default
                this.takenStreams[i] = false
            }

            if (window.speechSynthesis)
                speechSynthesis.cancel();
            this.requestedRoomChange = true;
            this.socket.emit("user-change-room", { targetRoomId, targetDoorId });
        },
        forcePhysicalPositionRefresh: function ()
        {
            for (const u of Object.values(this.users))
                u.moveImmediatelyToPosition(
                    this.currentRoom,
                    u.logicalPositionX,
                    u.logicalPositionY,
                    u.direction
                );
            this.updateCanvasObjects();
            this.isRedrawRequired = true;
        },
        sendNewPositionToServer: function (direction)
        {
            if (
                this.isLoadingRoom ||
                this.isWaitingForServerResponseOnMovement ||
                (this.users[this.myUserID] && this.users[this.myUserID].isWalking)
            )
                return;

            this.isWaitingForServerResponseOnMovement = true;
            this.socket.emit("user-move", direction);
        },
        sendNewBubblePositionToServer: function (position)
        {
            this.socket.emit("user-bubble-position", position);
        },
        sendMessageToServer: function ()
        {
            const inputTextbox = document.getElementById("input-textbox");

            let message = inputTextbox.value.substr(0, 500);
            
            // Whitespace becomes an empty string (to clear bubbles)
            if (!message.match(/[^\s]/g))
            {
                message = ""
            }
            
            if (message.match(/sageru/gi))
            {
                this.isPoop = true
                return
            }

            if (message.trim() == "#rula" || message.trim() == "#ﾙｰﾗ")
                this.requestRoomList();
            else if (message.trim() == '#ﾘｽﾄ' || message.trim() == '#list')
                this.openUserListPopup();
            else
            {
                // If the user has already cleared their bubble, avoid sending any more empty messages.
                if (message || this.users[this.myUserID].message)
                    this.socket.emit("user-msg", message);
            }
            inputTextbox.value = "";
            inputTextbox.focus()
        },
        registerKeybindings: function ()
        {
            // Ping so that if my avatar was transparent, it turns back to normal.
            // Use debounce so that we never send more than one ping every 10 minutes
            const debouncedPing = debounceWithImmediateExecution(() => {
                if (!this.connectionLost && !this.connectionRefused && !this.loggedOut)
                {
                    this.socket.emit("user-ping");
                }
            }, 10 * 60 * 1000)

            window.addEventListener("focus", () => {
                debouncedPing()
            });

            window.addEventListener("mousemove", () => {
                debouncedPing()
            });

            window.addEventListener("keydown", () => {
                debouncedPing()
            });

            const pointerEnd = (e) =>
            {
                this.isDraggingCanvas = false;
                this.isCanvasPointerDown = false;
            }

            window.addEventListener('mouseup', pointerEnd);
            window.addEventListener('touchend', pointerEnd);
            window.addEventListener('touchcancel', pointerEnd);

            setInterval(() => {
                if (this.movementDirection)
                {
                    this.sendNewPositionToServer(this.movementDirection)
                }
            }, 100)

            if (window.ResizeObserver)
            {
                this.canvasContainerResizeObserver = new ResizeObserver((mutationsList, observer) =>
                {
                    this.isRedrawRequired = true

                    const canvasContainer = document.getElementById("canvas-container")
                    if (!canvasContainer)
                        return
                    const height = canvasContainer.style.height

                    localStorage.setItem("canvasHeight", height);
                    this.paint(0)
                });
                this.canvasContainerResizeObserver.observe(document.getElementById("canvas-container"));
            }
        },
        toggleInfobox: function ()
        {
            localStorage.setItem(
                "isInfoboxVisible",
                (this.isInfoboxVisible = !this.isInfoboxVisible)
            );
        },
        toggleUsernameBackground: function () {
            localStorage.setItem(
                "showUsernameBackground",
                (this.showUsernameBackground = !this.showUsernameBackground)
            );
            this.isUsernameRedrawRequired = true;
            this.isRedrawRequired = true;
        },
        handleCanvasKeydown: function (event)
        {
            if (event.code == "KeyG" && event.ctrlKey)
            {
                // Stop propagation to avoid triggering the handler on the window object
                // (which would always focus the input-textbox)
                event.stopPropagation()
                event.preventDefault()
                document.getElementById("input-textbox").focus()
                return
            }

            if (event.shiftKey && !event.altKey && !event.ctrlKey)
            {
                // Move camera
                switch (event.code)
                {
                    case "ArrowLeft":
                    case "KeyA":
                    case "KeyH":
                        event.preventDefault()
                        this.canvasManualOffset.x += 10 / this.getCanvasScale()
                        this.isRedrawRequired = true
                        break;
                    case "ArrowRight":
                    case "KeyD":
                    case "KeyL":
                        event.preventDefault()
                        this.canvasManualOffset.x -= 10 / this.getCanvasScale()
                        this.isRedrawRequired = true
                        break;
                    case "ArrowUp":
                    case "KeyW":
                    case "KeyK":
                        event.preventDefault()
                        this.canvasManualOffset.y += 10 / this.getCanvasScale()
                        this.isRedrawRequired = true
                        break;
                    case "ArrowDown":
                    case "KeyS":
                    case "KeyJ":
                        event.preventDefault()
                        this.canvasManualOffset.y -= 10 / this.getCanvasScale()
                        this.isRedrawRequired = true
                        break;
                }
            }
            if (!event.shiftKey && !event.altKey && !event.ctrlKey)
            {
                // Move avatar
                switch (event.code)
                {
                    case "ArrowLeft":
                    case "KeyA":
                    case "KeyH":
                        event.preventDefault()
                        this.sendNewPositionToServer("left");
                        break;
                    case "ArrowRight":
                    case "KeyD":
                    case "KeyL":
                        event.preventDefault()
                        this.sendNewPositionToServer("right");
                        break;
                    case "ArrowUp":
                    case "KeyW":
                    case "KeyK":
                        event.preventDefault()
                        this.sendNewPositionToServer("up");
                        break;
                    case "ArrowDown":
                    case "KeyS":
                    case "KeyJ":
                        event.preventDefault()
                        this.sendNewPositionToServer("down");
                        break;
                    case "KeyU":
                        event.preventDefault()
                        this.sendNewBubblePositionToServer('left')
                        break;
                    case "KeyI":
                        event.preventDefault()
                        this.sendNewBubblePositionToServer('down')
                        break;
                    case "KeyO":
                        event.preventDefault()
                        this.sendNewBubblePositionToServer('up')
                        break;
                    case "KeyP":
                        event.preventDefault()
                        this.sendNewBubblePositionToServer('right')
                        break;
                    case "Equal":
                    case "NumpadAdd":
                        this.zoomIn()
                        break;
                    case "Minus":
                    case "NumpadSubtract":
                        this.zoomOut()
                        break;
                    case "Digit0":
                    case "Numpad0":
                        this.resetZoom()
                        break;
                }
            }
        },
        setMovementDirection: function(ev, direction)
        {
            // this preventDefault() is a workaround needed for iOS: longpress on a button selects it as text (and the "user-select: none" css
            // doesn't work since it just prevents the button from being selected and selects the next selectable element instead...)
            if (ev)
                ev.preventDefault();

            this.movementDirection = direction

            // Debounce needed because sometimes this function is called by by the event mousedown, sometimes
            // by touchstart but sometimes both, and in the latter case I don't want to call this.sendNewPositionToServer() twice.
            if (this.lastSetMovementDirectionTime || Date.now() - this.lastSetMovementDirectionTime > 200)
            {
                this.lastSetMovementDirectionTime = Date.now()
                if (this.movementDirection)
                    this.sendNewPositionToServer(this.movementDirection)
            }
        },
        getPointerState: function (event)
        {
            if ("targetTouches" in event)
            {
                if (event.targetTouches.length != 2)
                    return null;
                const ts = event.targetTouches;
                return {
                    dist: Math.sqrt(
                        Math.pow(ts[0].screenX - ts[1].screenX, 2) +
                        Math.pow(ts[0].screenY - ts[1].screenY, 2)),
                    pos: {
                        x: Math.round((ts[0].screenX + ts[1].screenX)/2),
                        y: Math.round((ts[0].screenY + ts[1].screenY)/2)
                    }
                }
            }
            else
            {
                return {
                    dist: null,
                    pos: {
                        x: event.screenX,
                        y: event.screenY
                    }
                }
            }
        },
        handleCanvasPointerDown: function (event)
        {
            const state = this.getPointerState(event);
            if (!state) return;

            this.isCanvasPointerDown = true;
            this.canvasDragStartOffset = { x: this.canvasManualOffset.x, y: this.canvasManualOffset.y };
            this.canvasPointerStartState = state;
            this.userCanvasScaleStart = null;

            event.preventDefault();
            event.target.focus()
        },
        handleCanvasPointerMove: function (event)
        {
            if (!this.isCanvasPointerDown) return;

            const state = this.getPointerState(event);
            if (!state) return;

            const dragOffset = {
                x: -(this.canvasPointerStartState.pos.x - state.pos.x),
                y: -(this.canvasPointerStartState.pos.y - state.pos.y)
            };

            if (state.dist)
            {
                const distDiff = this.canvasPointerStartState.dist - state.dist;

                if (!this.userCanvasScaleStart && Math.abs(distDiff) > 40)
                    this.userCanvasScaleStart = this.userCanvasScale;

                if (this.userCanvasScaleStart)
                    this.setCanvasScale(this.userCanvasScaleStart - Math.round(distDiff/20)/10);
            }

            if (!this.isDraggingCanvas &&
                (Math.sqrt(Math.pow(dragOffset.x, 2) + Math.pow(dragOffset.y, 2)) > 4))
            {
                this.isDraggingCanvas = true;
            }

            if (this.isDraggingCanvas)
            {
                this.canvasManualOffset.x = this.canvasDragStartOffset.x + dragOffset.x / this.userCanvasScale
                this.canvasManualOffset.y = this.canvasDragStartOffset.y + dragOffset.y / this.userCanvasScale;
            }

            event.preventDefault();
        },
        handleMessageInputKeydown: function (event)
        {
            if (event.code == "KeyG" && event.ctrlKey)
            {
                // Stop propagation to avoid triggering the handler on the window object
                // (which would always focus the input-textbox)
                event.stopPropagation();
                event.preventDefault();
                document.getElementById("room-canvas").focus()
                return
            }
        },
        handleMessageInputKeypress: function (event)
        {
            if (event.key != "Enter"
                || (this.isNewlineOnShiftEnter && event.shiftKey)
                || (!this.isNewlineOnShiftEnter && !event.shiftKey))
                return;

            this.sendMessageToServer();
            event.preventDefault();
            return false;
        },
        resetZoom: function ()
        {
            this.setCanvasScale(1);
        },
        zoomIn: function ()
        {
            this.setCanvasScale(this.userCanvasScale + 0.1);
        },
        zoomOut: function ()
        {
            this.setCanvasScale(this.userCanvasScale - 0.1);
        },
        handleCanvasWheel: function (event)
        {
            if (event.deltaY < 0)
                this.zoomIn()
            else
                this.zoomOut()

            event.preventDefault();
            return false;
        },
        setCanvasScale: function (canvasScale)
        {
            if(canvasScale > 3)
                canvasScale = 3;
            else if(canvasScale < 0.70)
                canvasScale = 0.70;

            this.userCanvasScale = canvasScale;
            this.isRedrawRequired = true;
        },

        getCanvasScale: function ()
        {
            return this.userCanvasScale * this.devicePixelRatio;
        },

        getDevicePixelRatio: function ()
        {
            if (this.isLowQualityEnabled) return 1;
            return Math.round(window.devicePixelRatio*100)/100;
        },

        setupRTCConnection: function (slotId)
        {
            const rtcPeer = new RTCPeer(defaultIceConfig, (type, msg) =>
            {
                // TODO figure out if keeping this line causes issues.
                // More privacy with candidates not being sent.
                if(type == "candidate") return;
                this.socket.emit("user-rtc-message", {
                    streamSlotId: slotId, type, msg})
            });

            const reconnect = async () =>
            {
                if (slotId == this.streamSlotIdInWhichIWantToStream)
                {
                    logToServer(new Date() + " " + this.myUserID + " Attempting to restart stream")
                    this.startStreaming()
                }
                else if (this.takenStreams[slotId])
                {
                    logToServer(new Date() + " " + this.myUserID + " Attempting to retake stream")
                    await this.dropStream(slotId)
                    this.takeStream(slotId)
                }
                else
                {
                    logToServer(new Date() + " " + this.myUserID + " Stream connection closed")
                }
            };

            const terminate = () =>
            {
                if (slotId == this.streamSlotIdInWhichIWantToStream)
                    this.stopStreaming()
                else if (this.takenStreams[slotId])
                    this.wantToDropStream(slotId)
            };

            rtcPeer.open();
            rtcPeer.conn.addEventListener("icecandidateerror", (ev) =>
            {
                console.error("icecandidateerror", ev, ev.errorCode, ev.errorText, ev.address, ev.url, ev.port)
            })

            rtcPeer.conn.addEventListener("iceconnectionstatechange", (ev) =>
            {
                const state = rtcPeer.conn.iceConnectionState;
                console.log("RTC Connection state", state)
                logToServer(new Date() + " " + this.myUserID + " RTC Connection state " + state)

                if (state == "connected")
                {
                    if (this.rtcPeerSlots[slotId])
                        this.rtcPeerSlots[slotId].attempts = 0;
                }
                // else if (["failed", "disconnected", "closed"].includes(state))
                else if (["failed", "closed"].includes(state))
                {
                    rtcPeer.close();
                    if (!this.rtcPeerSlots[slotId]) return;
                    if (this.rtcPeerSlots[slotId].attempts > 4)
                    {
                        terminate()
                    }
                    else
                    {
                        setTimeout(reconnect,
                            Math.max(this.takenStreams[slotId] ? 1000 : 0,
                                this.rtcPeerSlots[slotId].attempts * 1000));
                    }

                    this.rtcPeerSlots[slotId].attempts++;
                }
            });
            return rtcPeer;
        },

        updateCurrentRoomStreams: async function (streams)
        {
            if (this.hideStreams)
                streams = []

            // If I'm a streamer and the server just forcefully killed my stream (for example, because of a server restart), stop streaming
            if (this.mediaStream && !streams.find(s => s.userId == this.myUserID))
                this.stopStreaming();

            this.takenStreams = streams.map((s, slotId) => {
                return !!this.takenStreams[slotId]
            });

            // update this.rtcPeerSlots (keep the ones that were already established, drop the ones for streams that were just stopped by the streamer)
            const newRtcPeerSlotsList = [];
            for (let slotId = 0; slotId < streams.length; slotId++)
            {
                if (!this.rtcPeerSlots[slotId])
                    newRtcPeerSlotsList.push(null)
                else if (this.takenStreams[slotId] || this.streamSlotIdInWhichIWantToStream == slotId)
                    newRtcPeerSlotsList.push(this.rtcPeerSlots[slotId])
                else
                {
                    await this.dropStream(slotId);
                    newRtcPeerSlotsList.push(null)
                }
            }
            console.log(newRtcPeerSlotsList);
            this.rtcPeerSlots = newRtcPeerSlotsList;

            this.clientSideStreamData = streams.map((s, slotId) => {
                if (this.clientSideStreamData[slotId])
                    return this.clientSideStreamData[slotId];
                else
                    return { isListenerConnected: false };
            })

            this.streams = streams;

            this.streamSlotIdInWhichIWantToStream = null;

            for (const slotId in streams)
            {
                const stream = streams[slotId];
                if (stream.isActive)
                {
                    if (stream.userId == this.myUserID)
                    {
                        this.streamSlotIdInWhichIWantToStream = slotId;
                    }
                }
                if (this.takenStreams[slotId])
                {
                    if (!stream.isActive || !stream.isReady || !stream.isAllowed)
                        await this.dropStream(slotId);
                    else
                        this.takeStream(slotId);
                }

                $( "#video-container-" + slotId ).resizable({aspectRatio: true})

                if (this.slotVolume[slotId] === undefined)
                    this.slotVolume[slotId] = 1
            }
        },

        showDeviceSelectionPopup: async function ()
        {
            this.isStreamPopupOpen = false;
            try
            {
                const withVideo = this.streamMode != "sound" && !this.streamScreenCapture;
                const withSound = this.streamMode == "sound"
                    || (this.streamMode == "video_sound" && !(this.streamScreenCapture && this.streamScreenCaptureAudio));

                this.waitingForDevicePermission = true
                this.deviceList = await getDeviceList(withSound, withVideo)
                this.waitingForDevicePermission = false

                // Automatically select device if there is only one of its kind
                const audioDevices = this.deviceList.filter(d => d.type == "audioinput")
                const videoDevices = this.deviceList.filter(d => d.type == "videoinput")

                if (audioDevices.length == 1)
                    this.selectedAudioDeviceId = audioDevices[0].id
                else
                    this.selectedAudioDeviceId = null

                if (videoDevices.length == 1)
                    this.selectedVideoDeviceId = videoDevices[0].id
                else
                    this.selectedVideoDeviceId = null

                if (this.deviceList.length)
                {
                    this.isDeviceSelectionOpen = true
                }
                else
                {
                    this.wantToStartStreaming()
                }
            }
            catch (err)
            {
                console.error(err)
                this.showWarningToast(i18n.t("msg.error_obtaining_media"));
                this.mediaStream = false;
                this.waitingForDevicePermission = false;
                this.isStreamPopupOpen = true;
            }
        },

        cancelDeviceSelection: function()
        {
            if (!this.isDeviceSelectionOpen)
                return

            // If there's a native device selection popup open, let's keep the poipoi device selection
            // open and disabled, so that the user is forced to either give permissions or deny them.
            if (this.waitingForDevicePermission)
                return

            this.isDeviceSelectionOpen = false
            this.isStreamPopupOpen = true
        },

        wantToStartStreaming: async function ()
        {
            try
            {
                const withVideo = this.streamMode != "sound";
                const withSound = this.streamMode != "video";

                // Validate device selection
                if ((withVideo && !this.selectedVideoDeviceId && !this.streamScreenCapture)
                    || (withSound && !this.selectedAudioDeviceId && !this.streamScreenCaptureAudio))
                {
                    this.showWarningToast(i18n.t("msg.error_didnt_select_device"));
                    return;
                }

                const withScreenCapture = this.streamScreenCapture && withVideo
                const withScreenCaptureAudio = this.streamScreenCaptureAudio && withScreenCapture && withSound

                const audioConstraints = {
                    echoCancellation: this.streamEchoCancellation,
                    noiseSuppression: this.streamNoiseSuppression,
                    autoGainControl: this.streamAutoGain,
                    deviceId: withScreenCaptureAudio ? undefined : { exact: this.selectedAudioDeviceId },
                }

                let userMediaPromise = null
                if ((withSound && !withScreenCaptureAudio) || !withScreenCapture)
                    userMediaPromise = navigator.mediaDevices.getUserMedia(
                        {
                            video: (!withVideo || withScreenCapture) ? undefined : {
                                deviceId: { exact: this.selectedVideoDeviceId },
                            },
                            audio: !withSound ? undefined : audioConstraints
                        }
                    );

                let screenMediaPromise = null
                if (withScreenCapture)
                    screenMediaPromise = navigator.mediaDevices.getDisplayMedia(
                        {
                            video: true,
                            audio: !withScreenCaptureAudio ? undefined : audioConstraints
                        });

                this.waitingForDevicePermission = true

                // I need to use Promise.allSettled() because the browser needs to be convinced that both getDisplayMedia()
                // and getUserMedia() were initiated by a user action.
                const promiseResults = await Promise.allSettled([userMediaPromise, screenMediaPromise])

                this.waitingForDevicePermission = false

                // Gotta make sure both popups are closed (the device selection popup might be skipped if there's only one device to select)
                this.isDeviceSelectionOpen = false;
                this.isStreamPopupOpen = false;

                if (promiseResults.find(r => r.status == "rejected"))
                {
                    // Close the devices that were successfully opened
                    for (const mediaStream of promiseResults)
                    {
                        // I don't know why, but sometimes mediaStream.value is null even if the promise is fulfilled
                        if (mediaStream.status == "fulfilled" && mediaStream.value)
                        {
                            for (const track of mediaStream.value.getTracks())
                                track.stop();
                        }
                    }

                    throw new Error(promiseResults.find(r => r.status == "rejected").reason)
                }

                const userMedia = promiseResults[0].value
                const screenMedia = promiseResults[1].value

                // Populate this.mediaStream
                if (!withScreenCapture)
                    this.mediaStream = userMedia
                else
                {
                    this.mediaStream = screenMedia
                    if (withSound && !withScreenCaptureAudio)
                    {
                        const audioTrack = userMedia.getAudioTracks()[0]
                        this.mediaStream.addTrack(audioTrack)
                    }
                }

                // Log supported codecs
                try {
                    const VP8 = await isWebrtcPublishCodecSupported(this.mediaStream, WebrtcCodec.VP8);
                    const VP9 = await isWebrtcPublishCodecSupported(this.mediaStream, WebrtcCodec.VP9);
                    const H264 = await isWebrtcPublishCodecSupported(this.mediaStream, WebrtcCodec.H264);
                    const OPUS = await isWebrtcPublishCodecSupported(this.mediaStream, WebrtcCodec.OPUS);
                    const ISAC = await isWebrtcPublishCodecSupported(this.mediaStream, WebrtcCodec.ISAC);

                    if (withVideo)
                        logToServer(this.myUserID + " PUBLISH VIDEO CODECS: VP8: " + VP8 + " VP9: " + VP9 + " H264: " + H264)
                    if (withSound)
                        logToServer(this.myUserID + " PUBLISH SOUND CODECS: OPUS: " + OPUS + " ISAC: " + ISAC)
                }
                catch (exc)
                {
                    console.error(exc)
                }

                if (withVideo)
                {
                    if (!this.mediaStream.getVideoTracks().length)
                        throw new UserException("error_obtaining_video");
                }

                if (withSound)
                {
                    if (!this.mediaStream.getAudioTracks().length)
                        throw new UserException("error_obtaining_audio");

                    this.outboundAudioProcessor = new AudioProcessor(this.mediaStream, 0, (level) => {
                        const vuMeterBarPrimary = document.getElementById("vu-meter-bar-primary-" + this.streamSlotIdInWhichIWantToStream)
                        const vuMeterBarSecondary = document.getElementById("vu-meter-bar-secondary-" + this.streamSlotIdInWhichIWantToStream)

                        vuMeterBarSecondary.style.width = vuMeterBarPrimary.style.width
                        vuMeterBarPrimary.style.width = level * 100 + "%"
                    });
                }

                this.socket.emit("user-want-to-stream", {
                    streamSlotId: this.streamSlotIdInWhichIWantToStream,
                    withVideo: withVideo,
                    withSound: withSound,
                    isVisibleOnlyToSpecificUsers: this.streamTarget == "specific_users",
                    info: []
                        .concat(this.mediaStream.getAudioTracks().map(t => ({
                            constraints: t.getConstraints && t.getConstraints(),
                            settings: t.getSettings && t.getSettings(),
                            capabilities: t.getCapabilities && t.getCapabilities(),
                        })))
                        .concat(this.mediaStream.getVideoTracks().map(t => ({
                            constraints: t.getConstraints && t.getConstraints(),
                            settings: t.getSettings && t.getSettings(),
                            capabilities: t.getCapabilities && t.getCapabilities(),
                        })))
                });

                // On small screens, displaying the <video> element seems to cause a reflow in a way that
                // makes the canvas completely gray, so i force a redraw. Also needed to draw private stream icons.
                this.isRedrawRequired = true;
            } catch (e)
            {
                console.error(e)
                if (e instanceof UserException)
                {
                    this.showWarningToast(i18n.t("msg." + e.message));
                }
                else
                {
                    this.showWarningToast(i18n.t("msg.error_obtaining_media"));
                }
                this.wantToStream = false;
                this.mediaStream = false;
                this.streamSlotIdInWhichIWantToStream = null;
                this.waitingForDevicePermission = false;
            }
        },
        setupRtcPeerSlot: function(slotId)
        {
            if (!this.rtcPeerSlots[slotId]) this.rtcPeerSlots[slotId] = {
                attempts: 0
            }
            this.rtcPeerSlots[slotId].rtcPeer = this.setupRTCConnection(slotId)
            return this.rtcPeerSlots[slotId]
        },
        startStreaming: async function ()
        {
            const slotId = this.streamSlotIdInWhichIWantToStream;
            const rtcPeer = this.setupRtcPeerSlot(slotId).rtcPeer;

            Vue.set(this.takenStreams, slotId, false);
            this.mediaStream
                .getTracks()
                .forEach((track) =>
                    rtcPeer.conn.addTrack(track, this.mediaStream)
                );

            document.getElementById("local-video-" + slotId).srcObject = this.mediaStream;
        },
        stopStreaming: async function ()
        {
            for (const track of this.mediaStream.getTracks()) track.stop();

            const streamSlotId = this.streamSlotIdInWhichIWantToStream;

            document.getElementById("local-video-" + streamSlotId).srcObject = this.mediaStream = null;

            this.socket.emit("user-want-to-stop-stream");

            if (this.outboundAudioProcessor)
            {
                await this.outboundAudioProcessor.dispose()
                this.outboundAudioProcessor = null
            }

            this.allowedListenerIDs = new Set()

            if (this.vuMeterTimer)
                clearInterval(this.vuMeterTimer)

            this.streamSlotIdInWhichIWantToStream = null;

            if (this.rtcPeerSlots[streamSlotId])
            {
                this.rtcPeerSlots[streamSlotId].rtcPeer.close()
                this.rtcPeerSlots[streamSlotId] = null;
            }

            // On small screens, displaying the <video> element seems to cause a reflow in a way that
            // makes the canvas completely gray, so i force a redraw. Also needed to hide private stream icons.
            this.isRedrawRequired = true;
        },
        wantToTakeStream: function (streamSlotId)
        {
            if (!window.RTCPeerConnection)
            {
                this.showWarningToast(i18n.t("msg.no_webrtc"));
                return;
            }
            Vue.set(this.takenStreams, streamSlotId, true);

            if (streamSlotId in this.streams && this.streams[streamSlotId].isReady)
                this.takeStream(streamSlotId);
        },
        takeStream: function (streamSlotId)
        {
            if (this.rtcPeerSlots[streamSlotId]) return // no need to attempt again to take this stream

            const rtcPeer = this.setupRtcPeerSlot(streamSlotId).rtcPeer;

            // Iphones should just fucking disappear from the face of the earth.
            // It's important that this "videoElement.play()" is executed in the same tick as a user
            // interaction event, otherwise iphones will refuse to play the media.
            // This is why videoElement.play() is ran before the "track" event of the rtcPeer's connection.
            const videoElement = document.getElementById("received-video-" + streamSlotId)
            videoElement.play();

            rtcPeer.conn.addEventListener(
                "track",
                async (event) =>
                {
                    try
                    {
           
                        if (this.hideStreams)
                            return;

                        this.clientSideStreamData[streamSlotId].isListenerConnected = true

                        const stream = event.streams[0]
                        videoElement.srcObject = stream;

                        $( "#video-container-" + streamSlotId ).resizable({aspectRatio: true})

                        if (this.inboundAudioProcessors[streamSlotId])
                        {
                            await this.inboundAudioProcessors[streamSlotId].dispose()
                            delete this.inboundAudioProcessors[streamSlotId]
                        }

                        if (this.streams[streamSlotId].withSound)
                        {
                            // Disable sound from the video element so that we let sound be handled
                            // only by the AudioProcessor
                            videoElement.volume = 0
                            this.inboundAudioProcessors[streamSlotId] = new AudioProcessor(stream, this.slotVolume[streamSlotId], (level) => {
                                const vuMeterBarPrimary = document.getElementById("vu-meter-bar-primary-" + streamSlotId)
                                const vuMeterBarSecondary = document.getElementById("vu-meter-bar-secondary-" + streamSlotId)
        
                                vuMeterBarSecondary.style.width = vuMeterBarPrimary.style.width
                                vuMeterBarPrimary.style.width = level * 100 + "%"
                            })
                        }
                    }
                    catch (exc)
                    {
                        console.error(exc)
                    }
                },
                { once: true }
            );
            this.socket.emit("user-want-to-take-stream", streamSlotId);
        },
        dropStream: async function (streamSlotId)
        {
            if(!this.rtcPeerSlots[streamSlotId]) return;
            this.rtcPeerSlots[streamSlotId].rtcPeer.close()
            this.rtcPeerSlots[streamSlotId] = null;
            
            if (!this.isStreamAutoResumeEnabled)
                Vue.set(this.takenStreams, streamSlotId, false);

            this.clientSideStreamData[streamSlotId].isListenerConnected = false
            
            this.socket.emit("user-want-to-drop-stream", streamSlotId);

            if (this.inboundAudioProcessors[streamSlotId])
            {
                await this.inboundAudioProcessors[streamSlotId].dispose()
                delete this.inboundAudioProcessors[streamSlotId]
            }
        },
        wantToDropStream: async function (streamSlotId)
        {
            Vue.set(this.takenStreams, streamSlotId, false);
            await this.dropStream(streamSlotId);
        },
        rula: function (roomId)
        {
            if (!roomId) return;
            this.canvasManualOffset = { x: 0, y: 0 };
            this.changeRoom(roomId);
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        closeRulaPopup: function ()
        {
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        openUserListPopup: function ()
        {
            if (this.getUserListForListPopup().length == 0)
            {
                this.showWarningToast(i18n.t("msg.no_other_users_in_this_room"));
            }
            else
            {
                this.isUserListPopupOpen = true;
                if (this.highlightedUserId)
                {
                    Vue.nextTick(() => {
                        const element = document.getElementById("user-list-element-" + this.highlightedUserId)
                        if (element) element.scrollIntoView({ block: "nearest" })
                    })
                }
            }
        },
        closeUserListPopup: function ()
        {
            this.isUserListPopupOpen = false;
        },
        openPreferencesPopup: function ()
        {
            this.isPreferencesPopupOpen = true;
        },
        closePreferencesPopup: function ()
        {
            this.isPreferencesPopupOpen = false;
        },
        ignoreUser: function(userId)
        {
            this.ignoredUserIds.add(userId)

            for (const messageElement of document.getElementsByClassName("message"))
            {
                if (messageElement.dataset.userId == userId)
                    messageElement.classList.add("ignored-message")
            }

            this.isRedrawRequired = true
            this.$forceUpdate() // HACK: the v-if for the ignore and unignore buttons doesn't get automatically re-evaluated
        },
        unignoreUser: function(userId)
        {
            this.ignoredUserIds.delete(userId)

            for (const messageElement of document.getElementsByClassName("message"))
            {
                if (messageElement.dataset.userId == userId)
                    messageElement.classList.remove("ignored-message")
            }

            this.isRedrawRequired = true
            this.$forceUpdate() // HACK: the v-if for the ignore and unignore buttons doesn't get automatically re-evaluated
        },
        blockUser: function(userId)
        {
            this.confirm(i18n.t("msg.are_you_sure_you_want_to_block"), () =>
            {
                this.socket.emit("user-block", userId);
            });
        },
        setRulaRoomListSortKey(key)
        {
            if (this.rulaRoomListSortKey != key)
                this.rulaRoomListSortDirection = 1;
            else
                this.rulaRoomListSortDirection *= -1;

            this.rulaRoomListSortKey = key
            
            localStorage.setItem("rulaRoomListSortKey", this.rulaRoomListSortKey)

            localStorage.setItem("rulaRoomListSortDirection", this.rulaRoomListSortDirection)

            this.prepareRulaRoomList();
        },
        prepareRulaRoomList: function ()
        {
            const key = this.rulaRoomListSortKey;
            const direction = this.rulaRoomListSortDirection;

            if (this.rulaRoomGroup === "all")
                this.preparedRoomList = [...this.roomList];
            else
                this.preparedRoomList = this.roomList.filter(r => r.group == this.rulaRoomGroup);

            this.preparedRoomList.sort((a, b) =>
            {
                let sort;
                if (key == "sortName")
                    sort = a[key].localeCompare(b[key], i18n.locale);
                else if(key == "streamers")
                    sort = b[key].length - a[key].length;
                else
                    sort = b[key] - a[key];
                return sort * direction;
            })


        },
        openStreamPopup: function (streamSlotId)
        {
            if (!window.RTCPeerConnection)
            {
                this.showWarningToast(i18n.t("msg.no_webrtc"));
                return;
            }

            this.streamSlotIdInWhichIWantToStream = streamSlotId;
            this.wantToStream = true;

            this.isStreamPopupOpen = true;
        },
        closeStreamPopup: function ()
        {
            if (!this.isStreamPopupOpen)
                return

            // If there's a native device selection popup open, let's keep the poipoi device selection
            // open and disabled, so that the user is forced to either give permissions or deny them.
            if (this.waitingForDevicePermission)
                return

            this.isStreamPopupOpen = false;
            this.wantToStream = false;
            this.streamSlotIdInWhichIWantToStream = null;
        },
        changeStreamVolume: function (streamSlotId)
        {
            const volumeSlider = document.getElementById("volume-" + streamSlotId);

            this.inboundAudioProcessors[streamSlotId].setVolume(volumeSlider.value)

            this.slotVolume[streamSlotId] = volumeSlider.value;
            localStorage.setItem("slotVolume", JSON.stringify(this.slotVolume))
        },
        changeSoundEffectVolume: function (newVolume)
        {
            debouncedLogSoundVolume(this.myUserID, newVolume)
            this.soundEffectVolume = newVolume

            this.updateAudioElementsVolume()
            document.getElementById("message-sound").play()
            localStorage.setItem(this.areaId + "soundEffectVolume", this.soundEffectVolume);
        },
        updateAudioElementsVolume: function ()
        {
            for (const elementId of ["message-sound", "login-sound", "mention-sound"])
            {
                const el = document.getElementById(elementId)
                el.volume = this.soundEffectVolume
            }
        },
        requestRoomList: function ()
        {
            // Socket could be null if the user clicks on the #list button
            // very quickly after login and before initializing the socket
            if (this.socket)
                this.socket.emit("user-room-list");
        },
        selectRoomForRula: function (roomId)
        {
            this.rulaRoomSelection = roomId;
        },
        showPasswordInput: function ()
        {
            this.passwordInputVisible = true;
        },
        handleDarkMode: async function ()
        {
            this.isRedrawRequired = true
            
            const chatLog = document.getElementById("chatLog");
            if (chatLog.lastChild)
            {
                const observer = new ResizeObserver((mutationsList, observer) =>
                {
                    chatLog.lastChild.scrollIntoView({ block: "end" })
                    observer.unobserve(chatLog.lastChild);
                });
                observer.observe(chatLog.lastChild);
            }

            this.storeSet("isDarkMode");

            // Need to wait for the next tick so that knobElement.refresh() is called
            // with isDarkMode already updated to its new value.
            await Vue.nextTick()
            for (const knobElement of document.getElementsByClassName("input-knob"))
            {
                knobElement.refresh()
            }
        },
        toggleCoinSound: function ()
        {
            this.storeSet('isCoinSoundEnabled');
        },
        handleLanguageChange: function ()
        {
            this.storeSet('language');
            this.setLanguage(this.language);
        },
        storeSet: function (itemName, value)
        {
            if (value != undefined) this[itemName] = value;
            localStorage.setItem(itemName, this[itemName]);
        },
        handleBubbleOpacity: function ()
        {
            this.storeSet("bubbleOpacity");
            this.resetBubbleImages();
        },
        logout: async function ()
        {
            this.confirm(i18n.t("msg.are_you_sure_you_want_to_logout"), () =>
            {
                logToServer(new Date() + " " + this.myUserID + " Logging out")
                if (this.canvasContainerResizeObserver)
                    this.canvasContainerResizeObserver.disconnect()

                if (this.streamSlotIdInWhichIWantToStream != null)
                    this.stopStreaming()

                this.loggedIn = false
                this.loggedOut = true

                this.socket.close()

                for (let i = 0; i < this.takenStreams.length; i++)
                    if (this.takenStreams[i])
                        this.wantToDropStream(i)

                window.onbeforeunload = null
            });
        },
        handleShowNotifications: async function ()
        {
            if (!window.Notification)
            {
                this.notificationPermissionsGranted = false
                return
            }
            if (this.showNotifications)
            {
                const permission = await requestNotificationPermission()
                this.notificationPermissionsGranted = permission == "granted"
            }
            this.storeSet("showNotifications")
        },
        setMentionSoundFunction: function ()
        {
            this.customMentionSoundPattern =
                this.customMentionSoundPattern.trim();
            const match = this.customMentionSoundPattern
                .match(/^\/(.*)\/([a-z]*)$/);

            const re_object = match
                ? new RegExp(match[1], match[2])
                : null;
            let words = match
                ? []
                : this.customMentionSoundPattern.split(',')
                    .map(word => word.trim().toLowerCase()).filter(word => word);

            this.mentionSoundFunction = (msg) =>
            {
                if (re_object)
                {
                    const res = re_object.test(msg)
                    re_object.lastIndex = 0;
                    if (res) return true;
                }
                const lmsg = msg.toLowerCase()
                if (this.isNameMentionSoundEnabled && this.users[this.myUserID])
                {
                    const name = this.toDisplayName(this.users[this.myUserID].name).trim().toLowerCase();
                    if (name.split("◆").some(word => word && lmsg.includes(word))) return true;
                }

                return words.some(word => lmsg.includes(word));
            };
        },
        handleLowQualityEnabled: function ()
        {
            this.storeSet('isLowQualityEnabled');
            this.isRedrawRequired = true
        },
        handleCrispModeEnabled: function ()
        {
            this.storeSet('isCrispModeEnabled');
            this.reloadImages()
        },
        handleNameMentionSoundEnabled: function ()
        {
            this.storeSet('isNameMentionSoundEnabled');
            this.setMentionSoundFunction();
        },
        handleCustomMentionSoundPattern: function ()
        {
            this.storeSet('customMentionSoundPattern');
            this.setMentionSoundFunction();
        },
        handleEnableTextToSpeech: function ()
        {
            if (window.speechSynthesis)
                speechSynthesis.cancel()
            this.storeSet('enableTextToSpeech')
        },
        changeVoice: function () {
            speak(i18n.t("test"), this.ttsVoiceURI, this.voiceVolume)
            this.storeSet('ttsVoiceURI')
        },
        // I think this getVoices() function isn't called anywhere, might be okay to remove
        getVoices: function () {
            if (!window.speechSynthesis)
                return []
            return speechSynthesis.getVoices()
        },
        changeVoiceVolume: function(newValue) {
            this.voiceVolume = newValue
            this.storeSet('voiceVolume')
            debouncedSpeakTest(this.ttsVoiceURI, this.voiceVolume)
        },
        toggleVideoSlotPinStatus: function(slotId) {
            const videoContainer = document.getElementById('video-container-' + slotId)
            videoContainer.classList.toggle("pinned-video")
            videoContainer.classList.toggle("unpinned-video")

            if (videoContainer.classList.contains("unpinned-video"))
            {
                $(videoContainer).draggable()
            }
            else
            {
                $(videoContainer).draggable("destroy")
                // Reset 'top' and 'left' styles to snap the container back to its original position
                videoContainer.style = ""
            }
        },
        highlightUser: function(userId, userName)
        {
            if (this.highlightedUserId == userId)
            {
                this.highlightedUserId = null
                this.highlightedUserName = null
            }
            else
            {
                this.highlightedUserId = userId
                this.highlightedUserName = userName
            }

            this.isUsernameRedrawRequired = true;
            this.isRedrawRequired = true;

            for (const messageElement of document.getElementsByClassName("message"))
            {
                if (messageElement.dataset.userId == this.highlightedUserId)
                    messageElement.classList.add("highlighted-message")
                else
                    messageElement.classList.remove("highlighted-message")
            }

            // Update the canvas objects list so that highlighted users are always displayed on top
            // relative to the other users in the same tile.
            this.updateCanvasObjects();
        },
        getUserListForListPopup: function ()
        {
            const output = Object.values(this.users)
                .filter(u => u.id != this.myUserID)
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    isInRoom: true,
                    isInactive: u.isInactive,
                }))
            // Add highlighted users that are not in the room anymore
            if (this.highlightedUserId && !this.users[this.highlightedUserId])
                output.unshift({
                    id: this.highlightedUserId,
                    name: this.highlightedUserName,
                    isInRoom: false,
                    isInactive: false,
                })

            return output
        },
        handleRulaPopupKeydown: function(event)
        {
            const previousIndex = this.preparedRoomList.findIndex(r => r.id == this.rulaRoomSelection)

            switch (event.code)
            {
                case "ArrowDown":
                case "KeyJ":
                    this.rulaRoomSelection = this.preparedRoomList[(previousIndex + 1) % this.preparedRoomList.length].id
                    document.getElementById("room-tr-" + this.rulaRoomSelection).scrollIntoView({ block: "nearest"})
                    break;
                case "ArrowUp":
                case "KeyK":
                    if (previousIndex <= 0)
                        this.rulaRoomSelection = this.preparedRoomList[this.preparedRoomList.length - 1].id
                    else
                        this.rulaRoomSelection = this.preparedRoomList[previousIndex - 1].id
                    document.getElementById("room-tr-" + this.rulaRoomSelection).scrollIntoView({ block: "nearest"})
                    break;
                case "Enter":
                    this.rula(this.rulaRoomSelection)
                    break;
            }
        },
        handlechatLogKeydown: function(ev) {
            // hitting ctrl+a when the log is focused selects only the text in the log
            if (ev.code == "KeyA" && ev.ctrlKey)
            {
                ev.preventDefault()
                const chatLog = document.getElementById("chatLog")
                document.getSelection().setBaseAndExtent(chatLog, 0, chatLog.nextSibling, 0);
            }
        },
        toggleDesktopNotifications: function() {
            this.showNotifications = !this.showNotifications
            this.handleShowNotifications()
        },
        onCompressionChanged: function(streamSlotID)
        {
            this.inboundAudioProcessors[streamSlotID].onCompressionChanged()
        },
        onPanChanged: function(streamSlotID, event)
        {
            const value = event.target.value
            this.inboundAudioProcessors[streamSlotID].setPan(value)
        },
        resetPan: function(streamSlotID)
        {
            const panKnobElement = document.getElementById("pan-knob-" + streamSlotID);
            panKnobElement.value = 0;
            this.inboundAudioProcessors[streamSlotID].setPan(0);
        },
        isStreaming: function()
        {
            // Not correct, because streamSlotIdInWhichIWantToStream is different from null also when
            // the stream settings popup is open but the stream hasn't started yet
            return this.streamSlotIdInWhichIWantToStream != null
        },
        giveStreamToUser: function(userID)
        {
            this.allowedListenerIDs.add(userID)
            this.$forceUpdate()
            this.socket.emit("user-update-allowed-listener-ids", [...this.allowedListenerIDs]);
            this.isRedrawRequired = true;
        },
        revokeStreamToUser: function(userID)
        {
            this.allowedListenerIDs.delete(userID)
            this.$forceUpdate()
            this.socket.emit("user-update-allowed-listener-ids", [...this.allowedListenerIDs]);
            this.isRedrawRequired = true;
        },
    },
});

const debouncedSpeakTest = debounceWithDelayedExecution((ttsVoiceURI, voiceVolume) => {
    if (window.speechSynthesis)
    {
        speechSynthesis.cancel()
        speak(i18n.t("test"), ttsVoiceURI, voiceVolume)
    }
}, 150)

const debouncedLogSoundVolume = debounceWithDelayedExecution((myUserID, volume) => {
    logToServer(myUserID + " SFX volume: " + volume)
}, 150)

