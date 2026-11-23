<template>
    <div v-for="(streamSlot, index) in streams" v-bind:class="{'stream-is-active': streamSlot.isActive}">
        <hr v-if="index != 0" />
        <div>
            {{ $t("ui.label_stream", {index: index+1}) }}<span
                v-if="streamSlot.isActive" class="stream-title"><username-label :user-id="streamSlot.userId" :room-session="roomSession" :users="users"></username-label>
                <!-- NOTE 2: username component handles cases where the user id is missing in users, but unsure if the ideas mentioned in the note
                    are still relevant or not.
                    NOTE: Above, I'm using the null propagator in the `users[streamSlot.userId]?.name` expression for
                            this regrettable reason: when changing room, updateRoomState() does a lot of stuff, among which
                            there is the updating of this.users and this.streams. Unfortunately, there are quite a lot of
                            asynchronous operations (using await) between those two updates, which means that after this.users
                            is updated with the users of the new room, this.streams still has the stream slots of the old room,
                            but vue3 still tries to rerender the stream slots, meaning that users[streamSlot.userId] will return
                            undefined. Maybe a better solution would be to make sure that stream slots are rerendered only if 
                            this.streams is updated? I'm not sure how to do that. -->
                <span v-bind:title="$t('ui.visible_only_to_specific_users_stream')"
                        v-if="streamSlot.isVisibleOnlyToSpecificUsers"
                        class="fas fa-lock visible-only-to-specific-users-stream-icon"></span>
            </span>
            <span v-if="!streamSlot.isActive" class="stream-title">OFF</span>
        </div>
        <div :id="'video-container-' + index"
                class='video-container pinned-video'
                v-on:dblclick="onVideoDoubleClick($event, index)"
                v-show="streamSlot.withVideo
                        && ((takenStreams[index] && streamSlot.isReady)
                            || index == streamSlotIdInWhichIWantToStream)
                        && streamSlot.isAllowed">
            <button
                class="fas fa-thumbtack pin-video-button"
                v-show="takenStreams[index] || (streamSlot.isActive && index == streamSlotIdInWhichIWantToStream)"
                v-on:click="toggleVideoSlotPinStatus(index)"></button>
            <video :id="'local-video-' + index"
                v-show="streamSlot.isActive && index == streamSlotIdInWhichIWantToStream"
                v-on:click="playVideo($event)"
                v-bind:title="clientSideStreamData[index].isSeparateTab ? $t('ui.double_click_to_toggle_fullscreen') : $t('ui.double_click_to_move_to_new_tab')"
                v-bind:class="{'video-being-played': index == streamSlotIdInWhichIWantToStream}"
                autoplay muted playsinline></video>
            <video :id="'received-video-' + index"
                v-show="takenStreams[index] && index != streamSlotIdInWhichIWantToStream"
                v-on:click="playVideo($event)"
                v-bind:title="clientSideStreamData[index].isSeparateTab ? $t('ui.double_click_to_toggle_fullscreen') : $t('ui.double_click_to_move_to_new_tab')"
                v-bind:class="{'video-being-played': index != streamSlotIdInWhichIWantToStream}"
                autoplay playsinline></video>
            <img class="vtuber-character"
                v-if="streamSlot.streamIsVtuberMode"
                :src="getAvatarSpriteForUser(streamSlot.userId)"
                v-bind:class="{'jumping': streamSlot.isJumping}" />
            <div class="nico-nico-messages-container"
                    v-if="streamSlot.isNicoNicoMode">
            </div>
        </div>
        <div :id="'vu-meter-container-' + index"
                v-show="streamSlot.isActive
                        && streamSlot.withSound
                        && (index == streamSlotIdInWhichIWantToStream || (takenStreams[index] && preferences.isStreamInboundVuMeterEnabled))
                        && streamSlot.isAllowed">
            <div
                :id="'vu-meter-bar-primary-' + index"
                v-bind:class="{'inbound-vu-meter-bar': takenStreams[index], 'outbound-vu-meter-bar': index == streamSlotIdInWhichIWantToStream}"></div>
            <div
                :id="'vu-meter-bar-secondary-' + index"
                v-bind:class="{'inbound-vu-meter-bar': takenStreams[index], 'outbound-vu-meter-bar': index == streamSlotIdInWhichIWantToStream}"></div>
        </div>
        <div
            v-if="takenStreams[index]
                    && streamSlot.isReady
                    && streamSlot.withSound
                    && index != streamSlotIdInWhichIWantToStream
                    && streamSlot.isAllowed"
            class="audio-stream-controls-container"
            v-bind:class="{'listener-connected': clientSideStreamData[index].isListenerConnected}">
            <div class="audio-stream-controls-spinner">
                <img src="spinner.svg" />
            </div>
            <div class="audio-stream-controls">
                <label for="stream-volume">{{ $t("ui.volume") }}</label>
                <input type="range" :id="'volume-' + index" v-on:change="changeStreamVolume(index, $event)"
                    name="stream-volume" min="0" max="1" step="0.01" :value="preferences.slotVolume[index] ?? 1">
                <input
                    :id="'pan-knob-' + index"
                    type="range"
                    class="input-knob"
                    data-diameter="16"
                    min="-1"
                    max="1"
                    step="0.01"
                    value="0"
                    :data-bgcolor="isUiBackgroundDark ? 'black' : '#4d4d9f'"
                    :data-fgcolor="isUiBackgroundDark ? '#ff0000' : '#ffffff'"
                    v-on:input="onPanChanged(index, $event)"
                    v-on:dblclick="resetPan(index)" />
            </div>
            <div class="audio-stream-controls">
                <div>
                    <label :for="'enable-compression-' + index">{{ $t("ui.enable_compression") }}</label>
                    <input type="checkbox"
                        :id="'enable-compression-' + index"
                        v-if="inboundAudioProcessors[index]"
                        v-model="inboundAudioProcessors[index].isBoostEnabled"
                        v-on:change="onCompressionChanged(index)">
                </div>
                <div>
                    <label :for="'numeric-value-control-' + index">{{ $t("ui.gain") }}</label>
                    <numeric-value-control
                        :id="'numeric-value-control-' + index"
                        :min="0"
                        :max="Number.MAX_VALUE"
                        :default="0"
                        @value-changed="gain => onGainChanged(index, gain)"></numeric-value-control>
                </div>
            </div>
        </div>
        <div v-if="streamSlotIdInWhichIWantToStream == index">

        </div>
        <div class="stream-buttons" v-if="!streamSlot.isActive || streamSlot.isAllowed">
            <button :id="'take-stream-button-' + index"
                v-bind:class="{'red-button': streamSlot.isReady}"
                v-if="!takenStreams[index]
                        && streamSlot.userId != myUserID
                        && !wantToStream
                        && (preferences.isStreamAutoResumeEnabled || streamSlot.isReady)"
                v-on:click="wantToTakeStream(index)">
                {{ $t("ui.button_stream_take") }}
            </button>
            <button :id="'drop-stream-button-' + index"
                v-if="takenStreams[index]
                        && streamSlot.userId != myUserID
                        && !wantToStream"
                v-on:click="wantToDropStream(index)">
                {{ $t("ui.button_stream_drop") }}
            </button>
            <button :id="'start-video-streaming-button-' + index"
                v-if="!streamSlot.isActive && !wantToStream
                        && streamSlotIdInWhichIWantToStream == null"
                v-on:click="openOutboundStreamSettingsPopup(index)">
                {{ $t("ui.button_stream_start") }}
            </button>
            <button :id="'stop-streaming-button-' + index"
                v-if="streamSlotIdInWhichIWantToStream == index"
                v-on:click="stopStreaming">
                {{ $t("ui.button_stream_stop") }}
            </button>

            <!-- enable/disable feedback buttons -->
            <button
                v-if="streamSlotIdInWhichIWantToStream == index
                    && streamSlot.withSound
                    && !outboundAudioProcessor?.isFeedbackEnabled"
                v-on:click="enableFeedback"
                class="feedback-button"
                v-bind:title="$t('ui.button_stream_enable_feedback')">
                <span class="fas fa-volume-mute"></span>
            </button>
            <button
                v-if="streamSlotIdInWhichIWantToStream == index
                    && streamSlot.withSound
                    && outboundAudioProcessor?.isFeedbackEnabled"
                v-on:click="disableFeedback"
                class="feedback-button red-button"
                v-bind:title="$t('ui.button_stream_disable_feedback')">
                <span class="fas fa-volume-up"></span>
            </button>

            <!-- mute/unmute buttons-->
            <button
                v-if="streamSlotIdInWhichIWantToStream == index
                    && streamSlot.withSound
                    && !outboundAudioProcessor?.isMute"
                v-on:click="mute"
                class="mute-unmute-button"
                v-bind:title="$t('ui.button_stream_mute')">
                <span class="fas fa-microphone"></span>
            </button>
            <button
                v-if="streamSlotIdInWhichIWantToStream == index
                    && streamSlot.withSound
                    && outboundAudioProcessor?.isMute"
                v-on:click="unmute"
                class="mute-unmute-button"
                v-bind:title="$t('ui.button_stream_unmute')">
                <span class="fas fa-microphone-slash"></span>
            </button>
        </div>
        <div class="stream-buttons" v-if="streamSlotIdInWhichIWantToStream == index && streamSlot.withSound">
            <label>{{ $t("ui.voice_changer") }}</label>
            <voice-changer-control
                :id="'pitch-shift-' + index"
                :audioProcessor="outboundAudioProcessor"
                :cacca="1234">
            </voice-changer-control>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, inject, Ref, ref } from 'vue'
import { GikopoipoiPreferences, StreamSlotDto, VideoContainer } from '../../types'
import { adjustNiconicoMessagesFontSize, AudioProcessor } from '../../utils'
import { t } from 'i18next';
import { RoomSession } from '../../room-session';

const isUiBackgroundDark = inject("isUiBackgroundDark") as Ref<boolean>
const myUserID = inject("myUserID") as Ref<string> // TODO: Maybe should get this from RoomSession instead of inject

const props = defineProps<{
    preferences: GikopoipoiPreferences
    roomSession: RoomSession
}>()

// TODO: check all of these variable and make sure there are no references to them left in main.ts
const streams = ref([] as StreamSlotDto[]) // TODO: make RoomSession update the streams when they change on the server side
const clientSideStreamData = ref([] as { isListenerConnected: boolean, isSeparateTab: boolean }[])
const mediaStream = ref(null as MediaStream | null)
const streamSlotIdInWhichIWantToStream = ref(null as number | null)
const takenStreams = ref([] as boolean[]) // streams taken by me
const detachedStreamTabs = ref({} as {[slotId: number]: Window | null}) // key: slot Id
const slotIsVtuberCharacterJumping = ref({} as {[slotId: number]: boolean}) // key: slot Id / value: boolean
const inboundAudioProcessors = ref({} as {[slotId: number]: AudioProcessor}) // the key is the slot ID
const outboundAudioProcessor = ref(null as AudioProcessor | null)
const wantToStream = ref(false)

function forceUpdate()
{
    getCurrentInstance()?.proxy?.$forceUpdate()
}

async function onVideoDoubleClick(event: MouseEvent, slotId: number)
{
    const video = event.target as HTMLVideoElement;
    const videoContainer = video.parentElement as VideoContainer

    // If this video was already moved to another tab, doubleclicking on it
    // will make it fullscreen. Otherwise, move it to a new tab.
    if (clientSideStreamData.value[slotId].isSeparateTab)
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
        clientSideStreamData.value[slotId].isSeparateTab = true;
        forceUpdate() // HACK: this is to force vue to rebind the title attribute of the <video> element
        videoContainer.originalPreviousSibling = videoContainer.previousElementSibling as HTMLElement;
        const tab = open(window.origin + '/video-tab.html');
        if (!tab) return // TS quick fix
        detachedStreamTabs.value[slotId] = tab;
        const streamSlot = streams.value[slotId];
        const newTabTitle = t("ui.label_stream", {index: slotId + 1}) + " " + props.roomSession.state.users[streamSlot.userId!].name;
        tab.onload = () => {
            tab.document.title = newTabTitle;
            tab.document.body.appendChild(videoContainer);
            // listen to onunload too for mobile support, android doesn't trigger onbeforeunload
            tab.onunload = tab.onbeforeunload = () => {
                // clientSideStreamData.value[slotId].isSeparateTab could be false if the stream was dropped while the video was detached
                // to a new tab: in that case, streamDrop() forcibly reattaches the video element to the original
                // document and closes the tab. In this scenario, there's no need to attempt once more to reattach
                // the video again.
                // Checking isSeparateTab is also useful to handle correctly browsers that raise both unload 
                // and beforeunload events
                if (clientSideStreamData.value[slotId].isSeparateTab)
                {
                    clientSideStreamData.value[slotId].isSeparateTab = false;
                    forceUpdate() // HACK: this is to force vue to rebind the title attribute of the <video> element
                    if (videoContainer.originalPreviousSibling)
                        videoContainer.originalPreviousSibling.after(videoContainer);
                    videoContainer.originalPreviousSibling = null;
                    detachedStreamTabs.value[slotId] = null;

                    // Restore original width for the niconico messages container (the detached tab
                    // uses javascript to set its width equal to the one of the <video> element, but in 
                    // the main page we don't need that).
                    const niconicoMessagesContainer = videoContainer.getElementsByClassName("nico-nico-messages-container")[0] as HTMLElement
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
}

function toggleVideoSlotPinStatus(slotId: number) {
    const videoContainer = document.getElementById('video-container-' + slotId) as HTMLElement
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
        videoContainer.setAttribute("style", "")
    }
}

function playVideo(event: MouseEvent)
{
    // When moving the video element to a new tab, chromium based browsers will
    // automatically pause it and wait for a user interaction. With this function
    // it's enough to click on the video to make it play again.
    const video = event.target as HTMLVideoElement;
    video.play();
}


</script>