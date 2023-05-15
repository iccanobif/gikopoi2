//localStorage.debug = '*'; // socket.io debug
localStorage.removeItem("debug");

import { io } from 'socket.io-client'
import { createApp, computed, nextTick } from 'vue'
import i18next from 'i18next'
import I18NextVue from 'i18next-vue'
import languages from './lang.ts'

import { characters, loadCharacters } from "./character.ts";
import User from "./user.ts";
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
    htmlToControlChars,
    controlCharsToHtml,
    removeControlChars,
    escapeHTML
} from "./utils.ts";
import { speak } from "./tts.ts";
import { RTCPeer, defaultIceConfig } from "./rtcpeer.ts";
import { RenderCache } from "./rendercache.ts";
import { animateObjects, animateJizou } from "./animations.ts";

import ChessboardSlot from './chessboard-slot.vue'
import JankenSlot from './janken-slot.vue'
import LoginFooter from './login-footer.vue'

import ComponentUsername from './username.vue'

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

// Handle exceptions raised by promises
window.addEventListener("unhandledrejection", ev => {
    if (ev.reason.message)
        logToServer("ERROR: " + ev.reason.message + " " + ev.reason.stack)
    else
        logToServer("ERROR: " + ev.reason)
});

const enabledListenerIconImagePromise = loadImage("enabled-listener.svg")
const disabledListenerIconImagePromise = loadImage("disabled-listener.svg")
let enabledListenerIconImage = null;
let disabledListenerIconImage = null;
// I forgot why I defined rtcPeerSlots in the window object, but I remember it was important...
window.rtcPeerSlots = [];

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

function getSiteArea(areaId)
{
    return window.siteAreas.find(area => area.id == areaId)
}

function getInitialAreaId()
{
    let areaId = null
    try
    {
        const urlSearchParams = new URLSearchParams(window.location.search);
        areaId = urlSearchParams.get("areaid")
    }
    catch
    {}
    areaId = areaId || localStorage.getItem("areaId")
    if (window.siteAreas.find(area => area.id == areaId))
        return areaId
    
    const siteArea =
        window.siteAreas.find(area => area.language != "any" && (new RegExp("^" + area.language + "\\b")).test(navigator.language))
        || window.siteAreas.find(area => area.language == "any")
    if (siteArea) return siteArea.id
    return window.siteAreas[0].id
}
const initialAreaId = getInitialAreaId()
const initialArea = getSiteArea(initialAreaId)

const initialLanguage = localStorage.getItem("language") || "en"

function getAppState()
{
    if (window.location.hostname == "gikopoi2.herokuapp.com")
        return "redirect_notice"
    else
        return "login"
}

i18next.init(
{
    ns: ['common'],
    defaultNS: 'common',
    lng: (initialArea.restrictLanguage && initialArea.language) || initialLanguage,
    fallbackLng: 'en',
    resources: languages
})

function setPageMetadata()
{
    document.title = i18next.t("ui.title")
    document.getElementsByTagName('meta')["description"].content = i18next.t("ui.subtitle")
}
setPageMetadata()

function setAppLanguage(code)
{
    i18next.changeLanguage(code, setPageMetadata)
}

const vueApp = createApp({
    components: {
        ChessboardSlot,
        JankenSlot,
        LoginFooter,
    },
    data() {
        return {
            siteAreas: window.siteAreas,
            siteAreasInfo: window.siteAreasInfo,
            
            selectedCharacter: null,
            socket: null,
            users: {},
            roomLoadId: 0,
            currentRoom: {
                id: null,
                group: "gikopoi",
                objects: [],
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
            areaId: initialAreaId,
            language: initialLanguage,
            uiBackgroundColor: null,
            isUiBackgroundDark: null,

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
            isIdleAnimationDisabled: localStorage.getItem("isIdleAnimationDisabled") == "true",
            blockWidth: BLOCK_WIDTH,
            blockHeight: BLOCK_HEIGHT,
            devicePixelRatio: null,
            canvasObjects: [],

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
            uiTheme: localStorage.getItem("uiTheme") || "gikopoi",
            showNotifications: localStorage.getItem("showNotifications") != "false",
            enableTextToSpeech: localStorage.getItem("enableTextToSpeech") == "true",
            ttsVoiceURI: localStorage.getItem("ttsVoiceURI") || "automatic",
            voiceVolume: localStorage.getItem("voiceVolume") || 100,
            availableTTSVoices: [],
            isMessageSoundEnabled: localStorage.getItem("isMessageSoundEnabled") != "false",
            isLoginSoundEnabled: localStorage.getItem("isLoginSoundEnabled") != "false",
            isNameMentionSoundEnabled: localStorage.getItem("isNameMentionSoundEnabled") == "true",
            customMentionSoundPattern: localStorage.getItem("customMentionSoundPattern") || "",
            customMentionRegexObject: null,
            usernameMentionRegexObject: null,
            isCoinSoundEnabled: localStorage.getItem("isCoinSoundEnabled") != "false",
            isStreamAutoResumeEnabled: localStorage.getItem("isStreamAutoResumeEnabled") != "false",
            isStreamInboundVuMeterEnabled: localStorage.getItem("isStreamInboundVuMeterEnabled") != "false",
            showLogAboveToolbar: localStorage.getItem("showLogAboveToolbar") == "true",
            showLogDividers: localStorage.getItem("showLogDividers") == "true",

            // streaming
            streams: [],
            clientSideStreamData: [],
            mediaStream: null,
            streamSlotIdInWhichIWantToStream: null,
            takenStreams: [], // streams taken by me
            slotVolume: JSON.parse(localStorage.getItem("slotVolume")) || {}, // key: slot Id / value: volume
            detachedStreamTabs: {}, // key: slot Id
            slotIsVtuberCharacterJumping: {}, // key: slot Id / value: boolean

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
            streamIsVtuberMode: false,
            isNicoNicoMode: false,

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
            
            appState: getAppState(),

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
            jankenState: {},

            canvasContainerResizeObserver: null,

            lastCoinTossTime: 0, // unix timestamp

            // hideStreams: false,
            // the key is the slot ID
            inboundAudioProcessors: {},
            outboundAudioProcessor: null,
        }
    },
    provide()
    {
        return {
            socket: computed(() => this.socket),
            users: computed(() => this.users),
            ignoredUserIds: computed(() => this.ignoredUserIds),
            myUserId: computed(() => this.myUserID),
            
            highlightedUserId: computed(() => this.highlightedUserId),
            highlightUser: this.highlightUser,
        }
    },
    mounted()
    {
        if (this.appState == "redirect_notice")
            return;

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

        this.devicePixelRatio = this.getDevicePixelRatio();
    },
    methods: {
        async login(ev)
        {
            try {
                // Workaround for making TTS work on iphone, since it needs to be activated on a user interaction
                if (window.speechSynthesis)
                    speechSynthesis.speak(new SpeechSynthesisUtterance(""));

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

                enabledListenerIconImage = RenderCache.Image(await enabledListenerIconImagePromise, 0.8);
                disabledListenerIconImage = RenderCache.Image(await disabledListenerIconImagePromise, 0.8);

                const die = Math.random()
                if (this.characterId === "naito" && die < 0.25)
                    this.characterId = "funkynaito"
                if (this.characterId === "dokuo" && die < 0.15)
                    this.characterId = "tabako_dokuo"

                if (this.password == "iapetus56")
                    this.characterId = "shar_naito"

                this.appState = "stage";
                this.selectedCharacter = characters[this.characterId];

                // wait next tick so that canvas-container gets rendered in the DOM
                await nextTick()

                const canvasHeight = localStorage.getItem("canvasHeight")
                if (canvasHeight)
                    document.getElementById("canvas-container").style.height = canvasHeight;

                await this.connectToServer(this.username);

                this.registerKeybindings();

                this.isLoggingIn = false;
                
                this.checkBackgroundColor()

                this.canvasContext = document.getElementById("room-canvas").getContext("2d");
                await loadCharacterImagesPromise;
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
                    alert(this.$t("msg." + e.message))
                }
                else
                {
                    alert(this.$t("msg.unknown_error"))
                }
                window.location.reload();
            }
        },
        getSVGMode()
        {
            return this.isCrispModeEnabled ? "crisp" : null;
        },
        async reloadImages()
        {
            this.loadRoomBackground();
            this.loadRoomObjects();

            await (loadCharacters(this.getSVGMode()));
            this.isRedrawRequired = true;
        },
        setLanguage(siteArea)
        {
            if (!siteArea)
                siteArea = this.getSiteArea()
            setAppLanguage((siteArea.restrictLanguage && siteArea.language) || this.language)
            document.title = this.$t("ui.title")
            document.getElementsByTagName('meta')["description"].content = this.$t("ui.subtitle")
        },
        getLangEntries()
        {
            const topEntries = ["ja", "en"]
            return Object.keys(languages)
                .sort((a, b) =>
            {
                const ta = topEntries.indexOf(a)
                const tb = topEntries.indexOf(b)
                if(ta >= 0 || tb >= 0)
                {
                    if (ta < 0) return 1
                    if (tb < 0) return -1
                    return ta < tb ? -1 : 1
                }
                
                return this.$t("lang_sort_key", { lng: a }).localeCompare(this.$t("lang_sort_key", { lng: b }))
            })
                .map((id) =>
            {
                return {id, name: this.$t("lang_name", { lng: id }), endOfTopEntries: id == topEntries[topEntries.length-1]}
            })
        },
        getSiteArea()
        {
            return this.siteAreas.find(area => area.id == this.areaId)
        },
        openDialog(text, title, buttons, cancelButtonIndex, callback)
        {
            this.dialogPopupMessage = text;
            this.dialogPopupTitle = title;
            this.dialogPopupButtons = buttons;
            this.dialogPopupButtonIndex = cancelButtonIndex;
            this.dialogPopupCallback = callback;
            this.isDialogPopupOpen = true;
        },
        closeDialog(buttonIndex)
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
        async showWarningToast(text)
        {
            this.openDialog(text,
                this.$t("ui.warning_toast_title"),
                [this.$t("ui.popup_button_ok")],
                0);
            await nextTick();
            const firstButton = document.querySelector("#dialog-popup .popup-buttons button");
            firstButton.focus();
        },
        confirm(text, okCallback, cancelCallback, button)
        {
            // button param can be an array of two strings for confirm and cancel,
            // or one string to be used for confirm
            if (button == undefined)
            {
                button = [this.$t("ui.popup_button_ok"),
                    this.$t("ui.popup_button_cancel")];
            }
            else if (!Array.isArray(button))
            {
                button = [button, this.$t("ui.popup_button_cancel")];
            }
            this.openDialog(text, null, button, 1, buttonIndex =>
            {
                if(buttonIndex == 0)
                    okCallback();
                else if (cancelCallback)
                    cancelCallback();
            });
        },
        async loadRoomBackground()
        {
            const urlMode = (!this.getSVGMode() ? "" : "." + this.getSVGMode());

            const roomLoadId = this.roomLoadId;

            const image = await loadImage(this.currentRoom.backgroundImageUrl.replace(".svg", urlMode + ".svg"))

            if (this.roomLoadId != roomLoadId) return;
            this.currentRoom.backgroundImage = RenderCache.Image(image, this.currentRoom.scale);
            this.isRedrawRequired = true;
        },
        async loadRoomObjects(mode)
        {
            const urlMode = (!this.getSVGMode() ? "" : "." + this.getSVGMode());

            const roomLoadId = this.roomLoadId;

            const promises = Object
                .values(this.currentRoom.objects)
                .map(async o => {
                    if (this.roomLoadId != roomLoadId)
                        return;
                    
                    const loadRoomImage = async (url) =>
                    {
                        return loadImage("rooms/" + this.currentRoom.id + "/" + url.replace(".svg", urlMode + ".svg"))
                    }
                    
                    const scale = o.scale ? o.scale : 1;
                    o.physicalPositionX = o.offset ? o.offset.x * scale : 0;
                    o.physicalPositionY = o.offset ? o.offset.y * scale : 0;
                    
                    // url can be either a single string or an array of strings for objects that can be animated
                    const urls = typeof o.url == "string" ? [o.url] : o.url
                    
                    const scenes = o.animation ? o.animation.scenes : []
                    
                    await Promise.all([
                        Promise.all(urls.map(url => loadRoomImage(url).then(image => RenderCache.Image(image, scale))))
                            .then(images => // loadRoomImage(o.url).then(image => { o.image = RenderCache.Image(image, scale) }),
                        {
                            o.allImages = images
                            o.image = images[0]
                        }),
                        Object.values(scenes).map(s =>
                        {
                            if (s.framesUrlPattern)
                                s.frames = Array.from({length: s.framesUrlPattern.amount},
                                    (v, i) => { return { url: s.framesUrlPattern.prefix + (i+1) + s.framesUrlPattern.suffix } })
                            return s.frames.map((f, i) =>
                                loadRoomImage(s.frames[i].url).then(image => { s.frames[i].image = RenderCache.Image(image, scale) }))
                        }).flat()
                    ])
                    this.isRedrawRequired = true;
                })
                .flat()

            await Promise.all(promises)
        },
        async updateRoomState(dto)
        {
            const roomDto = dto.currentRoom
            const usersDto = dto.connectedUsers
            const streamsDto = dto.streams

            // if (!this.hideStreams && (dto.hideStreams || localStorage.getItem("hideStreams")))
            //     logToServer(this.myUserID + " setting hideStreams to true")

            // if (dto.hideStreams)
            //     localStorage.setItem("hideStreams", "true")
            // this.hideStreams = localStorage.getItem("hideStreams") == "true";

            this.chessboardState = dto.chessboardState
            this.jankenState = dto.jankenState

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

            for (const userDto of usersDto)
            {
                const user = this.addUser(userDto);
                if(previousRoomId != this.currentRoom.id && user.message)
                    await this.displayUserMessage(user, user.message);
            }
            this.setMentionRegexObjects()

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
        async connectToServer()
        {
            const loginResponse = await postJson("/login", {
                userName: this.username,
                characterId: this.characterId,
                areaId: this.areaId,
                roomId: getSpawnRoomId(),
            });

            const loginMessage = await loginResponse.json();

            if (!loginMessage.isLoginSuccessful) throw new UserException(loginMessage.error);

            window.myUserID = this.myUserID = loginMessage.userId;
            this.myPrivateUserID = loginMessage.privateUserId;

            logToServer(new Date() + " " + this.myUserID
                + " window.EXPECTED_SERVER_VERSION: "+ window.EXPECTED_SERVER_VERSION
                + " loginMessage.appVersion: " + loginMessage.appVersion
                + " DIFFERENT: " + (window.EXPECTED_SERVER_VERSION != loginMessage.appVersion))
            if (window.EXPECTED_SERVER_VERSION != loginMessage.appVersion)
                this.pageRefreshRequired = true

            // prevent accidental page closing
            window.onbeforeunload = () => {

                if (this.appState == 'logout')
                    return null

                // Before onbeforeunload the socket has already died, so
                // i have to start it again here, in case the user
                // decides that he doesn't want to close the window.
                // UPDATE: might not be needed anymore now that we open the socket closeOnBeforeunload: false

                // this.initializeSocket();
                // if (this.mediaStream) this.stopStreaming();

                return "Are you sure?";
            }

            // Load the room state before connecting the websocket, so that all
            // code handling websocket events (and paint() events) can assume that
            // currentRoom, streams etc... are all defined.
            const response = await fetch("/areas/" + this.areaId + "/rooms/" + getSpawnRoomId(),
                                         { headers: { "Authorization": "Bearer " + this.myPrivateUserID } })
            await this.updateRoomState(await response.json())

            logToServer(new Date() + " " + this.myUserID + " User agent: " + navigator.userAgent)

            this.initializeSocket()
        },
        initializeSocket()
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
                if (this.appState != "logout")
                {
                    console.error("Socket disconnected:", reason)
                    this.connectionLost = true;
                }
            });
            this.socket.on("server-cant-log-you-in", () =>
            {
                this.connectionRefused = true;
            });

            this.socket.on("server-update-current-room-state", async (dto) =>
            {
                await this.updateRoomState(dto);
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
                let message = this.$t("msg." + messageCode);
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
                const { userId, x, y, direction, lastMovement, isInstant, shouldSpinwalk } = dto

                const user = this.users[userId];

                user.isInactive = false

                const oldX = user.logicalPositionX;
                const oldY = user.logicalPositionY;
                
                user.lastMovement = lastMovement
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
                this.showWarningToast(this.$t("msg." + reason));
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
                    r.sortName = this.$t("room." + r.id, { context: "sort_key"});
                    r.streamerCount = r.streams.length;
                    r.streams.forEach(s => s.userName = s.userName == "" ? this.$t("default_user_name") : s.userName)
                })
                this.roomList = roomList;
                this.rulaRoomGroup = "all";
                this.prepareRulaRoomList();
                this.isRulaPopupOpen = true;
                this.rulaRoomSelection = this.currentRoom.id;

                await nextTick()
                document.getElementById("rula-popup").focus()
            });

            this.socket.on("server-rtc-message", async (streamSlotId, type, msg) =>
            {
                const rtcPeer = rtcPeerSlots[streamSlotId].rtcPeer;
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

            this.socket.on("server-update-janken", (state) => {
                this.jankenState = state
            })

            this.socket.on("server-chess-win", winnerUserId => {
                const winnerUserName = this.users[winnerUserId] ? this.users[winnerUserId].name : "N/A"

                this.writeMessageToLog("SYSTEM", this.$t("msg.chess_win", {userName: winnerUserName}), null)
            })

            this.socket.on("server-chess-quit", winnerUserId => {
                const winnerUserName = this.users[winnerUserId] ? this.users[winnerUserId].name : "N/A"

                this.writeMessageToLog("SYSTEM", this.$t("msg.chess_quit", {userName: winnerUserName}), null)
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
        addUser(userDTO)
        {
            // Check that the characterId is valid (need to use hasOwnProperty() too to make sure that a characterId
            // like "toString" is not used). If not valid, default to giko
            const character = characters.hasOwnProperty(userDTO.characterId) ? characters[userDTO.characterId] : characters.giko;
            const name = userDTO.name != "" ? userDTO.name : this.$t("default_user_name");
            const newUser = new User(userDTO.id, name, character);
            newUser.moveImmediatelyToPosition(
                this.currentRoom,
                userDTO.position.x,
                userDTO.position.y,
                userDTO.direction
            );
            newUser.lastMovement = userDTO.lastMovement;
            newUser.isInactive = userDTO.isInactive;
            newUser.message = userDTO.lastRoomMessage;
            newUser.bubblePosition = userDTO.bubblePosition;
            newUser.voicePitch = userDTO.voicePitch
            newUser.isAlternateCharacter = userDTO.isAlternateCharacter

            this.users[userDTO.id] = newUser;

            return newUser;
        },
        writeMessageToLog(userName, msg, userId)
        {
            const chatLog = document.getElementById("chatLog");
            const isAtBottom = (chatLog.scrollHeight - chatLog.clientHeight) - chatLog.scrollTop < 5;

            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");

            messageDiv.dataset.userId = userId

            if (!userId && userName == "SYSTEM")
                messageDiv.classList.add("system-message")

            if (this.ignoredUserIds.has(userId))
                messageDiv.classList.add("ignored-message")

            const [displayName, tripcode] = userName.split("◆")

            const timestampSpan = document.createElement("span")
            timestampSpan.className = "message-timestamp"
            timestampSpan.innerHTML = "[" + getFormattedCurrentDate() + "]&nbsp;"

            const authorSpan = document.createElement("span");
            authorSpan.className = "message-author";
            authorSpan.title = new Date()
            authorSpan.textContent = displayName;
            authorSpan.addEventListener("click", (ev) => {
                this.highlightUser(userId, userName)
            })

            const tripcodeSpan = document.createElement("span");
            if (tripcode)
            {
                tripcodeSpan.className = "message-author";
                tripcodeSpan.title = new Date()
                tripcodeSpan.textContent = "◆" + tripcode;
                tripcodeSpan.addEventListener("click", (ev) => {
                    this.highlightUser(userId, userName)
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
                    anchor.rel = "noopener noreferrer";
                    return anchor.outerHTML;
                })
            if (userId) // Only mark mentions in user messages
                bodySpan.childNodes.forEach(node =>
                {
                    let el = node.nodeType == 3
                        ? document.createElement("span")
                        : node
                        
                    el.innerHTML = controlCharsToHtml(escapeHTML(this.markMentions(removeControlChars(node.textContent))))
                    if (node.nodeType == 3)
                        bodySpan.replaceChild(el, node)
                })
            
            messageDiv.append(timestampSpan);
            messageDiv.append(authorSpan);
            messageDiv.append(tripcodeSpan);
            messageDiv.append(document.createTextNode(this.$t("message_colon")));
            messageDiv.append(bodySpan);

            chatLog.appendChild(messageDiv);

            if (isAtBottom)
                chatLog.scrollTop = chatLog.scrollHeight -
                    chatLog.clientHeight;
        },
        async displayUserMessage(user, msg)
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
                if (this.checkIfMentioned(plainMsg))
                    document.getElementById("mention-sound").play();
                else if (this.isMessageSoundEnabled)
                    document.getElementById("message-sound").play();
            }

            if (this.enableTextToSpeech)
            {
                speak(plainMsg, this.ttsVoiceURI, this.voiceVolume, user.voicePitch)
            }

            if (user.id != this.myUserID)
                await this.displayNotification(user.name + ": " + plainMsg, this.getAvatarSpriteForUser(user.id))

            // write message to niconico style streams (if any)
            const niconicoMessageContainers = document.getElementsByClassName("nico-nico-messages-container")
            for (let i = 0; i < niconicoMessageContainers.length; i++)
                this.addNiconicoMessageToVideoContainer(niconicoMessageContainers[i], plainMsg)
            for (const i of Object.keys(this.detachedStreamTabs))
            {
                if (this.detachedStreamTabs[i])
                {
                    const container = this.detachedStreamTabs[i].document.getElementsByClassName("nico-nico-messages-container")[0]
                    this.addNiconicoMessageToVideoContainer(container, plainMsg, user.id)
                }
            }
        },
        addNiconicoMessageToVideoContainer(videoContainer, messageText, userID)
        {
            if (!videoContainer) return;
            
            const span = document.createElement("span")
            span.textContent = messageText

            // Calculate the vertical position as a crude "hash" of the userid and text of the message,
            // so that all users see messages more or less in the same place
            const top = ((userID + messageText)
                .split("")
                .map(c => c.charCodeAt(0))
                .reduce((sum, val) => sum + val) % 256) / 256
            span.style.top = top * 80 + 2 + "%"

            videoContainer.appendChild(span)
            setTimeout(() => {
                videoContainer.removeChild(span)
            }, 5200)
        },
        async displayNotification(message, icon)
        {
            if (window.Notification)
            {
                if (!this.showNotifications
                    || document.visibilityState == "visible") return;

                const permission = await requestNotificationPermission()
                if (permission != "granted") return;

                return new Notification(message,
                    {
                        icon: icon
                    })
            }

            return null
        },
        clearLog()
        {
            this.confirm(this.$t("msg.are_you_sure_you_want_to_clear_log"), () =>
            {
                document.getElementById("chatLog").innerHTML = '';
                this.showWarningToast(this.$t("msg.chat_log_cleared"));
            });
        },
        drawImage(context, image, x, y)
        {
            if (!x) x = 0;
            if (!y) y = 0;
            context.drawImage(
                image,
                Math.round(this.getCanvasScale() * x + this.canvasGlobalOffset.x),
                Math.round(this.getCanvasScale() * y + this.canvasGlobalOffset.y)
            );
        },
        getNameImage(user, withBackground)
        {
            const [displayName, tripcode] = user.name.split("◆")

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
        getBubbleImage(user)
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
        detectCanvasResize()
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
        setCanvasGlobalOffset()
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

        calculateUserPhysicalPositions(delta)
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

            function compareUserObjects(a,b)
            {
                // A highlighted user will always be on top.
                if (a.id == self.highlightedUserId)
                    return 1
                if (b.id == self.highlightedUserId)
                    return -1
                // The user that moved last will be underneath
                if (a.lastMovement < b.lastMovement)
                    return 1
                if (a.lastMovement > b.lastMovement)
                    return -1
                return a.id.localeCompare(b.id);
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
                    .sort(compareUserObjects)
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

                        if (a.type == "user" && b.type == "user")
                            return compareUserObjects(a.o, b.o)
                        
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

        paintBackground()
        {
            const context = this.canvasContext;
            if (this.currentRoom.backgroundColor)
            {
                context.fillStyle = this.currentRoom.backgroundColor;
            }
            else
            {
                context.fillStyle = "rgb(" + this.uiBackgroundColor.map(c => Math.max(Math.min(this.isUiBackgroundDark ? c+16 : c-16, 255), 0)).join(", ") + ")";
            }
            context.fillRect(0, 0, this.canvasDimensions.w, this.canvasDimensions.h);

            this.drawImage(
                context,
                this.currentRoom.backgroundImage.getImage(this.getCanvasScale())
            );
        },

        drawObjects()
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
                    
                    o.o.getCurrentImage(this.currentRoom).forEach(renderImage =>
                    {
                        this.drawImage(
                            context,
                            renderImage.getImage(this.getCanvasScale()),
                            o.o.currentPhysicalPositionX + this.blockWidth/2 - renderImage.width/2,
                            o.o.currentPhysicalPositionY - renderImage.height
                        )
                    })

                    context.restore()
                }
            }
        },

        drawUsernames()
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

        resetBubbleImages()
        {
            for (const u in this.users)
            {
                this.users[u].bubbleImage = null;
            }
            this.isRedrawRequired = true;
        },
        drawBubbles()
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
        drawPrivateStreamIcons()
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
        drawOriginLines()
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

            // y-ward lines
            for (let x = 0; x <= this.currentRoom.size.x; x++)
            {
                const startCoordinates = calculateRealCoordinates(this.currentRoom, x, 0);
                const endCoordinates = calculateRealCoordinates(this.currentRoom, x, this.currentRoom.size.y);
                context.beginPath();
                context.moveTo(co.x + this.getCanvasScale() * startCoordinates.x, 
                               co.y + this.getCanvasScale() * (startCoordinates.y - this.blockHeight / 2));
                context.lineTo(co.x + this.getCanvasScale() * endCoordinates.x, 
                               co.y + this.getCanvasScale() * (endCoordinates.y - this.blockHeight / 2));
                context.stroke();
            }

            // x-ward lines
            for (let y = 0; y <= this.currentRoom.size.y; y++)
            {
                const startCoordinates = calculateRealCoordinates(this.currentRoom, 0, y);
                const endCoordinates = calculateRealCoordinates(this.currentRoom, this.currentRoom.size.x, y);
                context.beginPath();
                context.moveTo(co.x + this.getCanvasScale() * startCoordinates.x, 
                               co.y + this.getCanvasScale() * (startCoordinates.y - this.blockHeight / 2));
                context.lineTo(co.x + this.getCanvasScale() * endCoordinates.x, 
                               co.y + this.getCanvasScale() * (endCoordinates.y - this.blockHeight / 2));
                context.stroke();
            }

        },

        drawSpecialObjects() {
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

        canvasClick(clickEvent)
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

        drawGridNumbers()
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

        paint(delta)
        {
            if (this.isLoadingRoom || !this.currentRoom.backgroundImage)
                return;
            
            this.detectCanvasResize();
            
            const now = Date.now()
            
            if (!this.isIdleAnimationDisabled)
            {
                if(animateObjects(this.canvasObjects, this.users))
                    this.isRedrawRequired = true
                
                // apply animation logic
                const furimukuJizou = this.canvasObjects.find(o => o.o.id == "moving_jizou")
                if (furimukuJizou)
                    if (animateJizou(furimukuJizou.o, this.users))
                        this.isRedrawRequired = true
            }
            
            const usersRequiringRedraw = new Set()
            for (const [userId, user] of Object.entries(this.users))
            {
                if (user.checkIfRedrawRequired()) usersRequiringRedraw.add(userId)
                
                if (!this.isIdleAnimationDisabled && user.animateBlinking(now))
                    usersRequiringRedraw.add(userId)
                
                if (this.isIdleAnimationDisabled)
                    user.resetBlinking()
            }

            if (this.isRedrawRequired
                || this.isDraggingCanvas
                || usersRequiringRedraw.size
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

        paintLoop(timestamp)
        {
            const delta = this.lastFrameTimestamp === null ? 0 : timestamp - this.lastFrameTimestamp;

            this.lastFrameTimestamp = timestamp

            this.paint(delta)

            requestAnimationFrame(this.paintLoop);
        },
        changeRoomIfSteppingOnDoor()
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
        async changeRoom(targetRoomId, targetDoorId)
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
        forcePhysicalPositionRefresh()
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
        sendNewPositionToServer(direction)
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
        sendNewBubblePositionToServer(position)
        {
            this.socket.emit("user-bubble-position", position);
        },
        sendMessageToServer()
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
                this.appState = "poop";
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
        registerKeybindings()
        {
            // Ping so that if my avatar was transparent, it turns back to normal.
            // Use debounce so that we never send more than one ping every 10 minutes
            const debouncedPing = debounceWithImmediateExecution(() => {
                if (!this.connectionLost && !this.connectionRefused && this.appState != "logout")
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
        toggleInfobox()
        {
            localStorage.setItem(
                "isInfoboxVisible",
                (this.isInfoboxVisible = !this.isInfoboxVisible)
            );
        },
        toggleUsernameBackground() {
            localStorage.setItem(
                "showUsernameBackground",
                (this.showUsernameBackground = !this.showUsernameBackground)
            );
            this.isUsernameRedrawRequired = true;
            this.isRedrawRequired = true;
        },
        handleCanvasKeydown(event)
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
        setMovementDirection(ev, direction)
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
        getPointerState(event)
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
        handleCanvasPointerDown(event)
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
        handleCanvasPointerMove(event)
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
        handleMessageInputKeydown(event)
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
        handleMessageInputKeypress(event)
        {
            if (event.key != "Enter"
                || (this.isNewlineOnShiftEnter && event.shiftKey)
                || (!this.isNewlineOnShiftEnter && !event.shiftKey))
                return;

            this.sendMessageToServer();
            event.preventDefault();
            return false;
        },
        resetZoom()
        {
            this.setCanvasScale(1);
        },
        zoomIn()
        {
            this.setCanvasScale(this.userCanvasScale + 0.1);
        },
        zoomOut()
        {
            this.setCanvasScale(this.userCanvasScale - 0.1);
        },
        handleCanvasWheel(event)
        {
            if (event.deltaY < 0)
                this.zoomIn()
            else
                this.zoomOut()

            event.preventDefault();
            return false;
        },
        setCanvasScale(canvasScale)
        {
            if(canvasScale > 3)
                canvasScale = 3;
            else if(canvasScale < 0.70)
                canvasScale = 0.70;

            this.userCanvasScale = canvasScale;
            this.isRedrawRequired = true;
        },

        getCanvasScale()
        {
            return this.userCanvasScale * this.devicePixelRatio;
        },

        getDevicePixelRatio()
        {
            if (this.isLowQualityEnabled) return 1;
            return Math.round(window.devicePixelRatio*100)/100;
        },

        setupRTCConnection(slotId)
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

            // Maybe it's better to use the connectionstatechange event and rtcPeer.conn.connectionState, 
            // which in theory are a combination of the state of the ICE agent and DTLS agent.
            rtcPeer.conn.addEventListener("iceconnectionstatechange", (ev) =>
            {
                const state = rtcPeer.conn.iceConnectionState;
                console.log("RTC Connection state", state)
                logToServer(new Date() + " " + this.myUserID + " RTC Connection state " + state)

                if (state == "connected")
                {
                    if (rtcPeerSlots[slotId])
                        rtcPeerSlots[slotId].attempts = 0;
                }
                // else if (["failed", "disconnected", "closed"].includes(state))
                else if (["failed", "closed"].includes(state))
                {
                    rtcPeer.close();
                    if (!rtcPeerSlots[slotId]) return;
                    if (rtcPeerSlots[slotId].attempts > 4)
                    {
                        terminate()
                    }
                    else
                    {
                        setTimeout(reconnect,
                            Math.max(this.takenStreams[slotId] ? 1000 : 0,
                                rtcPeerSlots[slotId].attempts * 1000));
                    }

                    rtcPeerSlots[slotId].attempts++;
                }
            });
            return rtcPeer;
        },

        async updateCurrentRoomStreams(updatedStreams)
        {
            // Compare old stream slots with updated ones, to send a notification if
            // a new stream started
            for (let slotId = 0; slotId < updatedStreams.length; slotId++)
            {
                const oldStream = this.streams[slotId];
                const newStream = updatedStreams[slotId];
                if (oldStream
                    && !oldStream.isActive
                    && newStream.isActive
                    && newStream.userId != this.myUserID)
                {
                    const streamUser = this.users[newStream.userId]
                    const message = this.$t("msg.stream_start_notification", {userName: streamUser.name})

                    const notification = await this.displayNotification(message, this.getAvatarSpriteForUser(newStream.userId))

                    if (notification)
                        notification.addEventListener("click", (event) => {
                            this.wantToTakeStream(slotId);
                            window.focus();
                        })
                }
            }

            // If I'm a streamer and the server just forcefully killed my stream (for example, because of a server restart), stop streaming
            if (this.mediaStream && !updatedStreams.find(s => s.userId == this.myUserID))
                this.stopStreaming();

            this.takenStreams = updatedStreams.map((s, slotId) => {
                return !!this.takenStreams[slotId]
            });

            // update rtcPeerSlots (keep the ones that were already established, drop the ones for streams that were just stopped by the streamer)
            const newRtcPeerSlotsList = [];
            for (let slotId = 0; slotId < updatedStreams.length; slotId++)
            {
                if (!rtcPeerSlots[slotId])
                    newRtcPeerSlotsList.push(null)
                else if (this.takenStreams[slotId] || this.streamSlotIdInWhichIWantToStream == slotId)
                    newRtcPeerSlotsList.push(rtcPeerSlots[slotId])
                else
                {
                    await this.dropStream(slotId);
                    newRtcPeerSlotsList.push(null)
                }
            }
            rtcPeerSlots = newRtcPeerSlotsList;

            this.clientSideStreamData = updatedStreams.map((s, slotId) => {
                if (this.clientSideStreamData[slotId])
                    return this.clientSideStreamData[slotId];
                else
                    return { isListenerConnected: false, isSeparateTab: false };
            })

            this.streams = updatedStreams;

            this.streamSlotIdInWhichIWantToStream = null;

            for (const slotId in updatedStreams)
            {
                const stream = updatedStreams[slotId];
                if (stream.isActive)
                    if (stream.userId == this.myUserID)
                        this.streamSlotIdInWhichIWantToStream = slotId;
                if (this.takenStreams[slotId])
                    if (!stream.isActive || !stream.isReady || !stream.isAllowed)
                        await this.dropStream(slotId);
                    else
                        this.takeStream(slotId);

                $( "#video-container-" + slotId ).resizable({
                    aspectRatio: true,
                    resize: adjustNiconicoMessagesFontSize
                })

                if (this.slotVolume[slotId] === undefined)
                    this.slotVolume[slotId] = 1
            }
        },

        async showDeviceSelectionPopup()
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
                if (videoDevices.length == 1)
                    this.selectedVideoDeviceId = videoDevices[0].id

                // If a previously selected device isn't available anymore, clear the selection.
                // This also handles scenarios where, for example, a previous stream used a video device
                // while this new stream is only audio: in that case videoDevices will be an empty list
                // and this.selectedVideoDeviceId will be correctly set to null.
                if (!audioDevices.find(d => d.id == this.selectedAudioDeviceId))
                    this.selectedAudioDeviceId = null;
                if (!videoDevices.find(d => d.id == this.selectedVideoDeviceId))
                    this.selectedVideoDeviceId = null;

                if (this.deviceList.length)
                    this.isDeviceSelectionOpen = true
                else
                    this.wantToStartStreaming()
            }
            catch (err)
            {
                console.error(err)
                this.showWarningToast(this.$t("msg.error_obtaining_media"));
                this.mediaStream = false;
                this.waitingForDevicePermission = false;
                this.isStreamPopupOpen = true;
            }
        },

        cancelDeviceSelection()
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

        async wantToStartStreaming()
        {
            try
            {
                // TO TEST:
                // - video only (camera)
                // - video only (screen sharing)
                // - sound only
                // - video + sound (camera)
                // - video + sound (screen sharing)
                // - video + sound (screen sharing + desktop audio)

                const withVideo = this.streamMode != "sound";
                const withSound = this.streamMode != "video";

                // Validate device selection
                if ((withVideo && !this.selectedVideoDeviceId && !this.streamScreenCapture)
                    || (withSound && !this.selectedAudioDeviceId && !this.streamScreenCaptureAudio))
                {
                    this.showWarningToast(this.$t("msg.error_didnt_select_device"));
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

                this.mediaStream = new MediaStream()
                // Populate this.mediaStream (video)
                if (withVideo)
                {
                    const videoTrack = withScreenCapture
                        ? screenMedia.getVideoTracks()[0]
                        : userMedia.getVideoTracks()[0];

                    if (videoTrack)
                        this.mediaStream.addTrack(videoTrack)
                }
                // Populate this.mediaStream (audio)
                if (withSound)
                {
                    const audioStream = withScreenCaptureAudio
                        ? screenMedia
                        : userMedia;

                    this.outboundAudioProcessor = new AudioProcessor(audioStream, 1, false, (level) => {
                        const vuMeterBarPrimary = document.getElementById("vu-meter-bar-primary-" + this.streamSlotIdInWhichIWantToStream)
                        const vuMeterBarSecondary = document.getElementById("vu-meter-bar-secondary-" + this.streamSlotIdInWhichIWantToStream)

                        vuMeterBarSecondary.style.width = vuMeterBarPrimary.style.width
                        vuMeterBarPrimary.style.width = level * 100 + "%"

                        if (level > 0.2)
                            this.streams[this.streamSlotIdInWhichIWantToStream].isJumping = true
                        else
                            setTimeout(() => {
                                const stream = this.streams[this.streamSlotIdInWhichIWantToStream]
                                // handle the case where before this 100 ms delay the stream was closed
                                if (stream)
                                    stream.isJumping = false
                            }, 100)
                    });

                    const audioTrack = this.outboundAudioProcessor.destination.stream.getAudioTracks()[0]

                    this.mediaStream.addTrack(audioTrack)
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

                // Handle errors
                if (withVideo)
                {
                    if (!this.mediaStream.getVideoTracks().length)
                    {
                        // Close audio tracks
                        for (const track of this.mediaStream.getTracks()) track.stop();
                        throw new UserException("error_obtaining_video");
                    }
                }
                if (withSound)
                {
                    if (!this.mediaStream.getAudioTracks().length)
                    {
                        // Close video tracks
                        for (const track of this.mediaStream.getTracks()) track.stop();
                        throw new UserException("error_obtaining_audio");
                    }
                }

                this.socket.emit("user-want-to-stream", {
                    streamSlotId: this.streamSlotIdInWhichIWantToStream,
                    withVideo: withVideo,
                    withSound: withSound,
                    isVisibleOnlyToSpecificUsers: this.streamTarget == "specific_users",
                    streamIsVtuberMode: withVideo && this.streamIsVtuberMode,
                    isNicoNicoMode: withVideo && this.isNicoNicoMode,
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
                    this.showWarningToast(this.$t("msg." + e.message));
                }
                else
                {
                    this.showWarningToast(this.$t("msg.error_obtaining_media"));
                }
                this.wantToStream = false;
                this.mediaStream = false;
                this.streamSlotIdInWhichIWantToStream = null;
                this.waitingForDevicePermission = false;
            }
        },
        setupRtcPeerSlot(slotId)
        {
            if (!rtcPeerSlots[slotId]) rtcPeerSlots[slotId] = {
                attempts: 0
            }
            rtcPeerSlots[slotId].rtcPeer = this.setupRTCConnection(slotId)
            return rtcPeerSlots[slotId]
        },
        async startStreaming()
        {
            const slotId = this.streamSlotIdInWhichIWantToStream;
            const rtcPeer = this.setupRtcPeerSlot(slotId).rtcPeer;

            this.takenStreams[slotId] = false
            this.mediaStream
                .getTracks()
                .forEach((track) =>
                    rtcPeer.conn.addTrack(track, this.mediaStream)
                );

            document.getElementById("local-video-" + slotId).srcObject = this.mediaStream;
        },
        async stopStreaming()
        {
            // Note that when streaming audio, the audio track in this.mediaStream is the
            // output of the outboundAudioProcessor. The "raw" input track is stopped
            // by outboundAudioProcessor.dispose()
            for (const track of this.mediaStream.getTracks()) track.stop()

            if (this.outboundAudioProcessor)
            {
                await this.outboundAudioProcessor.dispose()
                this.outboundAudioProcessor = null
            }

            const streamSlotId = this.streamSlotIdInWhichIWantToStream;

            this.reattachVideoFromOtherTabIfDetached(streamSlotId);

            document.getElementById("local-video-" + streamSlotId).srcObject = this.mediaStream = null;

            this.socket.emit("user-want-to-stop-stream");

            this.allowedListenerIDs = new Set()

            if (this.vuMeterTimer)
                clearInterval(this.vuMeterTimer)

            this.streamSlotIdInWhichIWantToStream = null;

            if (rtcPeerSlots[streamSlotId])
            {
                rtcPeerSlots[streamSlotId].rtcPeer.close()
                rtcPeerSlots[streamSlotId] = null;
            }

            // On small screens, displaying the <video> element seems to cause a reflow in a way that
            // makes the canvas completely gray, so i force a redraw. Also needed to hide private stream icons.
            this.isRedrawRequired = true;
        },
        wantToTakeStream(streamSlotId)
        {
            if (!window.RTCPeerConnection)
            {
                this.showWarningToast(this.$t("msg.no_webrtc"));
                return;
            }
            this.takenStreams[streamSlotId] = true

            if (streamSlotId in this.streams && this.streams[streamSlotId].isReady)
                this.takeStream(streamSlotId);
        },
        takeStream(streamSlotId)
        {
            if (rtcPeerSlots[streamSlotId]) return // no need to attempt again to take this stream

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
                        // if (this.hideStreams)
                        //     return;

                        this.clientSideStreamData[streamSlotId].isListenerConnected = true

                        const stream = event.streams[0]
                        videoElement.srcObject = stream;
                        
                        $( "#video-container-" + streamSlotId ).resizable({
                            aspectRatio: true,
                            resize: adjustNiconicoMessagesFontSize
                        })

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
                            // Turns out that on iphones, HTMLMediaElement.prototype.volume is read only and we have to use "muted".
                            // Maybe the muted property works on all browsers, but to be on the safe side, I'll both set muted to true and volume to 0
                            videoElement.muted = true
                            this.inboundAudioProcessors[streamSlotId] = new AudioProcessor(stream, this.slotVolume[streamSlotId], true, (level) => {
                                const vuMeterBarPrimary = document.getElementById("vu-meter-bar-primary-" + streamSlotId)
                                const vuMeterBarSecondary = document.getElementById("vu-meter-bar-secondary-" + streamSlotId)
        
                                vuMeterBarSecondary.style.width = vuMeterBarPrimary.style.width
                                vuMeterBarPrimary.style.width = level * 100 + "%"
                                
                                if (level > 0.2)
                                    this.streams[streamSlotId].isJumping = true
                                else
                                    setTimeout(() => {this.streams[streamSlotId].isJumping = false}, 100)
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
        async dropStream(streamSlotId)
        {
            if(!rtcPeerSlots[streamSlotId]) return;
            rtcPeerSlots[streamSlotId].rtcPeer.close()
            rtcPeerSlots[streamSlotId] = null;
            
            if (!this.isStreamAutoResumeEnabled)
                this.takenStreams[streamSlotId] = false

            this.clientSideStreamData[streamSlotId].isListenerConnected = false

            this.reattachVideoFromOtherTabIfDetached(streamSlotId);
            
            this.socket.emit("user-want-to-drop-stream", streamSlotId);

            if (this.inboundAudioProcessors[streamSlotId])
            {
                await this.inboundAudioProcessors[streamSlotId].dispose()
                delete this.inboundAudioProcessors[streamSlotId]
            }
        },
        async wantToDropStream(streamSlotId)
        {
            this.takenStreams[streamSlotId] = false
            await this.dropStream(streamSlotId);
        },
        rula(roomId)
        {
            if (!roomId) return;
            this.canvasManualOffset = { x: 0, y: 0 };
            this.changeRoom(roomId);
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        closeRulaPopup()
        {
            this.isRulaPopupOpen = false;
            this.rulaRoomSelection = null;
        },
        openUserListPopup()
        {
            if (this.getUserListForListPopup().length == 0)
            {
                this.showWarningToast(this.$t("msg.no_other_users_in_this_room"));
            }
            else
            {
                this.isUserListPopupOpen = true;
                if (this.highlightedUserId)
                {
                    nextTick(() => {
                        const element = document.getElementById("user-list-element-" + this.highlightedUserId)
                        if (element) element.scrollIntoView({ block: "nearest" })
                    })
                }
            }
        },
        closeUserListPopup()
        {
            this.isUserListPopupOpen = false;
        },
        openPreferencesPopup()
        {
            this.isPreferencesPopupOpen = true;
        },
        closePreferencesPopup()
        {
            this.isPreferencesPopupOpen = false;
        },
        ignoreUser(userId)
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
        unignoreUser(userId)
        {
            this.ignoredUserIds.delete(userId)

            for (const messageElement of document.getElementsByClassName("message"))
            {
                if (messageElement.dataset.userId == userId)
                    messageElement.classList.remove("ignored-message")
            }

            this.isRedrawRequired = true
            // Redraw usernames too because it's possible that a user was highlighted, then ignored,
            // then unhighlighted, and then unignored. In that case, its name would appear red even if
            // it's not highlighted anymore
            this.isUsernameRedrawRequired = true
            this.$forceUpdate() // HACK: the v-if for the ignore and unignore buttons doesn't get automatically re-evaluated
        },
        blockUser(userId)
        {
            this.confirm(this.$t("msg.are_you_sure_you_want_to_block"), () =>
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
        prepareRulaRoomList()
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
                    sort = a[key].localeCompare(b[key], this.$i18next.language);
                else if(key == "streamers")
                    sort = b[key].length - a[key].length;
                else
                    sort = b[key] - a[key];
                return sort * direction;
            })
        },
        openStreamPopup(streamSlotId)
        {
            if (!window.RTCPeerConnection)
            {
                this.showWarningToast(this.$t("msg.no_webrtc"));
                return;
            }

            this.streamSlotIdInWhichIWantToStream = streamSlotId;
            this.wantToStream = true;

            this.isStreamPopupOpen = true;
        },
        closeStreamPopup()
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
        changeStreamVolume(streamSlotId)
        {
            const volumeSlider = document.getElementById("volume-" + streamSlotId);

            this.inboundAudioProcessors[streamSlotId].setVolume(volumeSlider.value)

            this.slotVolume[streamSlotId] = volumeSlider.value;
            localStorage.setItem("slotVolume", JSON.stringify(this.slotVolume))
        },
        changeSoundEffectVolume(newVolume)
        {
            debouncedLogSoundVolume(this.myUserID, newVolume)
            this.soundEffectVolume = newVolume

            this.updateAudioElementsVolume()
            document.getElementById("message-sound").play()
            localStorage.setItem(this.areaId + "soundEffectVolume", this.soundEffectVolume);
        },
        updateAudioElementsVolume()
        {
            for (const elementId of ["message-sound", "login-sound", "mention-sound"])
            {
                const el = document.getElementById(elementId)
                el.volume = this.soundEffectVolume
            }
        },
        requestRoomList()
        {
            // Socket could be null if the user clicks on the #list button
            // very quickly after login and before initializing the socket
            if (this.socket)
                this.socket.emit("user-room-list");
        },
        selectRoomForRula(roomId)
        {
            this.rulaRoomSelection = roomId;
        },
        showPasswordInput()
        {
            this.passwordInputVisible = true;
        },
        checkBackgroundColor()
        {
            this.uiBackgroundColor = getComputedStyle(this.$refs["page-container"]).getPropertyValue("background-color").match(/\d+/g).slice(0, 3).map(c => parseInt(c));
            this.isUiBackgroundDark = Math.round(this.uiBackgroundColor.reduce((p, c) => p + c) / this.uiBackgroundColor.length) <= 127
        },
        async handleUiTheme()
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

            this.storeSet("uiTheme");
            
            // Need to wait for the next tick so that knobElement.refresh() is called
            // with uiTheme already updated to its new value.
            await nextTick()
            this.checkBackgroundColor();
            for (const knobElement of document.getElementsByClassName("input-knob"))
            {
                knobElement.refresh()
            }
            this.isRedrawRequired = true
        },
        toggleCoinSound()
        {
            this.storeSet('isCoinSoundEnabled');
        },
        handleLanguageChange()
        {
            this.storeSet('language');
            this.setLanguage();
        },
        storeSet(itemName, value)
        {
            if (value != undefined) this[itemName] = value;
            localStorage.setItem(itemName, this[itemName]);
        },
        handleBubbleOpacity()
        {
            this.storeSet("bubbleOpacity");
            this.resetBubbleImages();
        },
        async logout()
        {
            this.confirm(this.$t("msg.are_you_sure_you_want_to_logout"), () =>
            {
                logToServer(new Date() + " " + this.myUserID + " Logging out")
                if (this.canvasContainerResizeObserver)
                    this.canvasContainerResizeObserver.disconnect()

                if (this.streamSlotIdInWhichIWantToStream != null)
                    this.stopStreaming()

                this.appState = "logout";

                this.socket.close()

                for (let i = 0; i < this.takenStreams.length; i++)
                    if (this.takenStreams[i])
                        this.wantToDropStream(i)

                window.onbeforeunload = null
            });
        },
        async handleShowNotifications()
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
        setMentionRegexObjects()
        {
            function wordsToRegexObject(words)
            {
                return new RegExp(
                    "("
                    + words
                        .map(word => word.trim().toLowerCase())
                        .filter(word => word)
                        .map(word => word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')) // Escapes regex special chars
                        .join("|")
                    + ")", "ig")
            }
            
            const customMentionSoundPattern = this.customMentionSoundPattern.trim();
            
            if (customMentionSoundPattern)
            {
                const match = customMentionSoundPattern.match(/^\/(.*)\/([a-z]*)$/)
                this.customMentionRegexObject = match
                    ? new RegExp(match[1], match[2].includes("g") ? match[2] : match[2] + "g")
                    : wordsToRegexObject(customMentionSoundPattern.split(','))
            }
            else
            {
                this.customMentionRegexObject = null
            }
            
            this.usernameMentionRegexObject = null
            if (!(this.myUserID in this.users) || !this.isNameMentionSoundEnabled) return
            this.usernameMentionRegexObject = wordsToRegexObject(
                this.users[this.myUserID].name.split("◆"))
        },
        markMentions(msg)
        {
            function regexReplace(stringArray, regex, replacement)
            {
                // function could be used later for other formatting things.
                // skips arrays within the array, and puts replaced parts of the
                // string into their own subarrays to mark which ones have been done to avoid double matching.
                // this prevents overlapping of mention <span>s and matching html that was inserted
                if (!regex) return stringArray
                return stringArray.map(s =>
                {
                    if (typeof s != "string") return [s]
                    
                    const rs = []
                    let match = null
                    while (match = regex.exec(s))
                    {
                        if (match[0] == "") break
                        if (match.index > 0)
                            rs.push(s.slice(0, match.index))
                        rs.push([
                            typeof replacement == "string"
                            ? replacement
                            : replacement(match[0])])
                        s = s.slice(regex.lastIndex)
                        regex.lastIndex = 0
                    }
                    if (s)
                        rs.push(s)
                    return rs
                }).flat()
            }
            function replacementFunction(word)
            {
                return htmlToControlChars("<span class='message-mention'>" + word + "</span>")
            }
            msg = [msg]
            msg = regexReplace(msg, this.customMentionRegexObject, replacementFunction)
            msg = regexReplace(msg, this.usernameMentionRegexObject, replacementFunction)
            return msg.flat().join("")
        },
        checkIfMentioned(msg)
        {
            function test(ro, s)
            {
                if (!ro) return false
                const isMatch = ro.test(s)
                ro.lastIndex = 0
                return isMatch
            }
            return test(this.customMentionRegexObject, msg)
                || test(this.usernameMentionRegexObject, msg)
        },
        handleLowQualityEnabled()
        {
            this.storeSet('isLowQualityEnabled');
            this.isRedrawRequired = true
        },
        handleCrispModeEnabled()
        {
            this.storeSet('isCrispModeEnabled');
            this.reloadImages()
        },
        handleIdleAnimationDisabled()
        {
            this.storeSet('isIdleAnimationDisabled');
            this.isRedrawRequired = true
        },
        handleNameMentionSoundEnabled()
        {
            this.storeSet('isNameMentionSoundEnabled')
            this.setMentionRegexObjects()
        },
        handleCustomMentionSoundPattern()
        {
            this.storeSet('customMentionSoundPattern')
            this.setMentionRegexObjects()
        },
        handleEnableTextToSpeech()
        {
            if (window.speechSynthesis)
                speechSynthesis.cancel()
            this.storeSet('enableTextToSpeech')
        },
        changeVoice() {
            speak(this.$t("test"), this.ttsVoiceURI, this.voiceVolume)
            this.storeSet('ttsVoiceURI')
        },
        // I think this getVoices() function isn't called anywhere, might be okay to remove
        getVoices() {
            if (!window.speechSynthesis)
                return []
            return speechSynthesis.getVoices()
        },
        changeVoiceVolume(newValue) {
            this.voiceVolume = newValue
            this.storeSet('voiceVolume')
            debouncedSpeakTest(this.ttsVoiceURI, this.voiceVolume)
        },
        toggleVideoSlotPinStatus(slotId) {
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
        highlightUser(userId, userName)
        {
            const highlightedUserStyle = document.getElementById("highlighted-user-style")

            if (this.highlightedUserId == userId)
            {
                this.highlightedUserId = null
                this.highlightedUserName = null
                highlightedUserStyle.textContent = ''
            }
            else
            {
                this.highlightedUserId = userId
                this.highlightedUserName = userName
                // Need to add a rule for .message-author too to override shaddox mode's color
                highlightedUserStyle.textContent = '.message[data-user-id="' + userId +'"] {color:red} .message[data-user-id="' + userId +'"] .message-author {color:red}'
            }

            this.isUsernameRedrawRequired = true;
            this.isRedrawRequired = true;

            // Update the canvas objects list so that highlighted users are always displayed on top
            // relative to the other users in the same tile.
            this.updateCanvasObjects();
        },
        getUserListForListPopup()
        {
            const output = Object.values(this.users)
                .filter(u => u.id != this.myUserID)
                .sort((a, b) => a.name.localeCompare(b.name))
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
        handleRulaPopupKeydown(event)
        {
            const previousIndex = this.preparedRoomList.findIndex(r => r.id == this.rulaRoomSelection)

            switch (event.code)
            {
                case "ArrowDown":
                case "KeyJ":
                case "KeyS":
                    this.rulaRoomSelection = this.preparedRoomList[(previousIndex + 1) % this.preparedRoomList.length].id
                    document.getElementById("room-tr-" + this.rulaRoomSelection).scrollIntoView({ block: "nearest"})
                    break;
                case "ArrowUp":
                case "KeyK":
                case "KeyW":
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
        handlechatLogKeydown(ev) {
            // hitting ctrl+a when the log is focused selects only the text in the log
            if (ev.code == "KeyA" && ev.ctrlKey)
            {
                ev.preventDefault()
                const chatLog = document.getElementById("chatLog")
                document.getSelection().setBaseAndExtent(chatLog, 0, chatLog.nextSibling, 0);
            }
        },
        toggleDesktopNotifications() {
            this.showNotifications = !this.showNotifications
            this.handleShowNotifications()
        },
        onCompressionChanged(streamSlotID)
        {
            this.inboundAudioProcessors[streamSlotID].onCompressionChanged()
        },
        onPanChanged(streamSlotID, event)
        {
            const value = event.target.value
            this.inboundAudioProcessors[streamSlotID].setPan(value)
        },
        resetPan(streamSlotID)
        {
            const panKnobElement = document.getElementById("pan-knob-" + streamSlotID);
            panKnobElement.value = 0;
            this.inboundAudioProcessors[streamSlotID].setPan(0);
        },
        mute()
        {
            this.outboundAudioProcessor.mute()
        },
        unmute()
        {
            this.outboundAudioProcessor.unmute()
        },
        isStreaming()
        {
            // Not correct, because streamSlotIdInWhichIWantToStream is different from null also when
            // the stream settings popup is open but the stream hasn't started yet
            return this.streamSlotIdInWhichIWantToStream != null
        },
        giveStreamToUser(userID)
        {
            this.allowedListenerIDs.add(userID)
            this.$forceUpdate()
            this.socket.emit("user-update-allowed-listener-ids", [...this.allowedListenerIDs]);
            this.isRedrawRequired = true;
        },
        revokeStreamToUser(userID)
        {
            this.allowedListenerIDs.delete(userID)
            this.$forceUpdate()
            this.socket.emit("user-update-allowed-listener-ids", [...this.allowedListenerIDs]);
            this.isRedrawRequired = true;
        },
        playVideo(event)
        {
            // When moving the video element to a new tab, chromium based browsers will
            // automatically pause it and wait for a user interaction. With this function
            // it's enough to click on the video to make it play again.
            const video = event.target;
            video.play();
        },
        async onVideoDoubleClick(event, slotId)
        {
            const video = event.target;
            const videoContainer = video.parentElement
            const stream = this.streams[slotId];

            // If this video was already moved to another tab, doubleclicking on it
            // will make it fullscreen. Otherwise, move it to a new tab.
            if (this.clientSideStreamData[slotId].isSeparateTab)
            {
                if (videoContainer.ownerDocument.fullscreenElement)
                {
                    await videoContainer.ownerDocument.exitFullscreen()
                }
                else if (videoContainer.requestFullscreen) // requestFullscreen() not available on safari, try webkitRequestFullscreen() one day
                {
                    await videoContainer.requestFullscreen();
                }
            }
            else
            {
                // On chromium based browser, for other people's streams, the video
                // might automatically when it gets moved to another tab and need a user interaction
                // before it can be started again... Make sure to test for that everytime a change is made to this code.
                this.clientSideStreamData[slotId].isSeparateTab = true;
                this.$forceUpdate() // HACK: this is to force vue to rebind the title attribute of the <video> element
                videoContainer.originalPreviousSibling = videoContainer.previousElementSibling;
                const tab = open(window.origin + '/video-tab.html');
                this.detachedStreamTabs[slotId] = tab;
                const streamSlot = this.streams[slotId];
                const newTabTitle = this.$t("ui.label_stream", {index: slotId + 1}) + " " + this.users[streamSlot.userId].name;
                tab.onload = () => {
                    tab.document.title = newTabTitle;
                    tab.document.body.appendChild(videoContainer);
                    // listen to onunload too for mobile support, android doesn't trigger onbeforeunload
                    tab.onunload = tab.onbeforeunload = () => {
                        // this.clientSideStreamData[slotId].isSeparateTab could be false if the stream was dropped while the video was detached
                        // to a new tab: in that case, streamDrop() forcibly reattaches the video element to the original
                        // document and closes the tab. In this scenario, there's no need to attempt once more to reattach
                        // the video again.
                        // Checking isSeparateTab is also useful to handle correctly browsers that raise both unload 
                        // and beforeunload events
                        if (this.clientSideStreamData[slotId].isSeparateTab)
                        {
                            this.clientSideStreamData[slotId].isSeparateTab = false;
                            this.$forceUpdate() // HACK: this is to force vue to rebind the title attribute of the <video> element
                            videoContainer.originalPreviousSibling.after(videoContainer);
                            videoContainer.originalPreviousSibling = null;
                            this.detachedStreamTabs[slotId] = null;

                            // Restore original width for the niconico messages container (the detached tab
                            // uses javascript to set its width equal to the one of the <video> element, but in 
                            // the main page we don't need that).
                            const niconicoMessagesContainer = videoContainer.getElementsByClassName("nico-nico-messages-container")[0]
                            if (niconicoMessagesContainer)
                            {
                                niconicoMessagesContainer.style.width = "100%"
                                adjustNiconicoMessagesFontSize()
                            }
                        }
                    };
                    tab.postMessage("adjust-niconico-stuff")
                }
            }
        },
        reattachVideoFromOtherTabIfDetached(slotId)
        {
            if (this.detachedStreamTabs[slotId])
            {
                const videoContainer = this.detachedStreamTabs[slotId].document.getElementById("video-container-" + slotId);
                const stream = this.streams[slotId];

                this.clientSideStreamData[slotId].isSeparateTab = false;
                videoContainer.originalPreviousSibling.after(videoContainer);
                videoContainer.originalPreviousSibling = null;
                this.detachedStreamTabs[slotId].close();
                this.detachedStreamTabs[slotId] = null;
            }
        },
        getAvatarSpriteForUser(userId)
        {
            const user = this.users[userId]
            if (!user)
            {
                // I'm handling this case to fix a crash when a user that's streaming with vtuber mode on
                // blocks another user. It would be better if vue didn't call getAvatarSpriteForUser() in
                // the first place, but for some reason in the <img> element that refers to this function,
                // :src seems to be evaluated before v-if? Maybe I'm missing something.
                return ""
            }
            const character = user.character
            return "characters/" + character.characterName + "/front-standing." + character.format
        },
    },
});

vueApp.config.unwrapInjectedRef = true // No longer required after Vue 3.3
vueApp.component("username", ComponentUsername)

vueApp.use(I18NextVue, { i18next })

vueApp.mount("#vue-app")
window.vueApp = vueApp

const debouncedSpeakTest = debounceWithDelayedExecution((ttsVoiceURI, voiceVolume) => {
    if (window.speechSynthesis)
    {
        speechSynthesis.cancel()
        speak(i18next.t("test"), ttsVoiceURI, voiceVolume)
    }
}, 150)

const debouncedLogSoundVolume = debounceWithDelayedExecution((myUserID, volume) => {
    logToServer(myUserID + " SFX volume: " + volume)
}, 150)

// TODO: handle cases where the geometry of the <video> element changes during the stream,
//       can be done with a ResizeObserver, maybe
function adjustNiconicoMessagesFontSize()
{
    const videoElements = document.getElementsByClassName("video-being-played")
    for (const videoElement of videoElements)
    {
        const width = (videoElement.videoWidth / videoElement.videoHeight) * videoElement.clientHeight
        const fontsize = Math.round(width / 15)
        const niconicoMessagesContainer = videoElement.parentElement.getElementsByClassName("nico-nico-messages-container")[0]
        if (niconicoMessagesContainer)
            niconicoMessagesContainer.style.fontSize = fontsize + "px"
    }
}
