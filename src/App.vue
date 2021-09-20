<template>
    <div v-cloak v-bind:class="{'dark-mode': isDarkMode}">
        <div id="login-page" v-if="!loggedIn && !loggedOut && !isPoop">
            <header>
                <div>
                    <h1><a href="/">{{ $t("ui.title") }}</a></h1>
                    <h2>{{ $t("ui.subtitle") }}</h2>
                </div>
            </header>
            <form id="login-form">

                <input v-if="passwordInputVisible" type="text" v-model="password" />
                <div id="area-selection">
                    <label for="gen-selection"><input type="radio" id="gen-selection" value="gen" v-model="areaId"
                            v-on:click="setLanguage('ja')" :disabled="isLoggingIn">
                        一般 (_gen) [{{ $t("ui.login_user_count") }}{{userStatsForHomepage.userCountGen}}
                        {{ $t("ui.login_streamer_count") }}{{userStatsForHomepage.streamerCountGen}}]</label>
                    <label for="for-selection"><input type="radio" id="for-selection" value="for" v-model="areaId"
                            v-on:click="setLanguage('en')" :disabled="isLoggingIn">
                        International (_for) [{{ $t("ui.login_user_count") }}{{userStatsForHomepage.userCountFor}}
                        {{ $t("ui.login_streamer_count") }}{{userStatsForHomepage.streamerCountFor}}]</label>
                </div>
                <div>
                    <label>{{ $t("ui.label_username") }}</label>
                    <input id="username-textbox" type="text" v-model="username" maxlength="20" :disabled="isLoggingIn" />
                </div>
                <div id="character-selection">
                    <label v-for="character in allCharacters" :for="character.characterName + '-selection'"
                        v-show="!character.isHidden" v-bind:key="character.characterName">
                        <template v-if="character.isHidden">
                            This is a secret, please don't tell anyone. これは秘密です、誰にも言わないでください。
                        </template>
                        <input type="radio" :id="character.characterName + '-selection'" :disabled="isLoggingIn"
                            :value="character.characterName" v-model="characterId">
                        <img :src="'characters/' + character.characterName + '/front-standing.' + character.format"
                            v-bind:class="{'character-selected': character.characterName == characterId}"/>
                    </label>
                </div>
                <button type="button" id="login-button" v-on:click="login" :disabled="isLoggingIn">Login</button>
            </form>
            <div id="login-footer" translate="no" class="notranslate" v-html="loginFooterContent">
            </div>
        </div>
        <div id="stage" v-if="loggedIn && !isPoop">
            <h2 class="big-red-alert" v-if="connectionLost && !connectionRefused">
                {{ $t("msg.connection_lost") }}
            </h2>
            <h2 class="big-red-alert" v-if="pageRefreshRequired">
                {{ $t("msg.page_refresh_required") }}
            </h2>
            <h2 v-if="connectionRefused">
                {{ $t("msg.connection_refused") }}
            </h2>
            <div id="main-section">
                <div id="canvas-container" v-if="!connectionRefused">
                    <canvas id="room-canvas" tabindex="1" v-on:keydown="handleCanvasKeydown($event)"
                        v-on:mousedown="handleCanvasPointerDown($event)"
                        v-on:mousemove="handleCanvasPointerMove($event)"
                        v-on:touchstart="handleCanvasPointerDown($event)"
                        v-on:touchmove="handleCanvasPointerMove($event)"
                        v-on:wheel="handleCanvasWheel($event)"
                        ></canvas>
                    <div id="infobox-container">
                        <div id="infobox" v-show="isInfoboxVisible">
                            <div id="infobox-area" class="infobox-line">
                                <div class="infobox-title">{{ $t("ui.infobox_label_area") }}</div>
                                <div class="infobox-value">{{ $t("ui.infobox_value_area") }}</div>
                            </div>
                            <div id="infobox-roomname" class="infobox-line">
                                <div class="infobox-title">{{ $t("ui.infobox_label_room") }}</div>
                                <div class="infobox-value">{{ currentRoom.id && $t("room."+currentRoom.id) }}</div>
                            </div>
                            <div id="infobox-username" class="infobox-line">
                                <div class="infobox-title">{{ $t("ui.infobox_label_user_name") }}</div>
                                <div class="infobox-value">{{ myUserID && users && users[myUserID] ? toDisplayName(users[myUserID].name) :
                                    '-' }}</div>
                            </div>
                            <div id="infobox-usercount" class="infobox-line">
                                <div class="infobox-title">{{ $t("ui.infobox_label_user_count") }}</div>
                                <div class="infobox-value">{{ serverStats.userCount }}</div>
                            </div>
                            <div id="infobox-streamcount" class="infobox-line">
                                <div class="infobox-title">{{ $t("ui.infobox_label_stream_count") }}</div>
                                <div class="infobox-value">{{ serverStats.streamCount }}</div>
                            </div>
                        </div>
                        <button id="infobox-button" class="canvas-button-top-right" v-on:click="toggleInfobox"
                            tabindex="-1"></button>
                    </div>
                </div>
                <div id="toolbar">
                    <div id="toolbar-text-input">
                        {{ $t("ui.label_input") }} <textarea id="input-textbox"
                            v-on:keypress="handleMessageInputKeypress($event)"
                            v-on:keydown="handleMessageInputKeydown($event)"
                            tabindex="2"
                            maxlength="500"></textarea>
                        <button id="send-button" v-on:click="sendMessageToServer" tabindex="3">{{ $t("ui.button_send") }}</button>
                    </div>
                    <div id="toolbar-buttons">
                        <div class="tooltip-section tooltip-volume-section">
                            <label>{{ $t("ui.sound_effect") }}</label>
                            <div id="sound-effect-volume"></div>
                        </div>
                        <div class="tooltip-section tooltip-volume-section" v-show="enableTextToSpeech">
                            <label>{{ $t("ui.tts_volume") }}</label>
                            <div id="voice-volume"></div>
                        </div>
                        <div class="tooltip-section" v-if="isCommandSectionVisible">
                            <button id="btn-rula" v-on:click="requestRoomList()">{{ $t("ui.button_rula") }}</button>
                            <button id="btn-list" v-on:click="openUserListPopup()">{{ $t("ui.button_list") }}</button>
                        </div>
                        <div class="tooltip-section">
                            <button v-on:click="openPreferencesPopup"
                                    v-bind:title="$t('ui.button_preferences')"
                                    class="fas fa-cogs"></button>
                            <button v-if="notificationPermissionsGranted"
                                    v-on:click="toggleDesktopNotifications"
                                    v-bind:title="$t('ui.preferences_show_notifications')"
                                    class="fas"
                                    v-bind:class="{'fa-bell': showNotifications, 'fa-bell-slash': !showNotifications}"></button>
                        </div>
                        <div class="tooltip-section" v-if="isMoveSectionVisible">
                            <div class='tooltip-section-title'>
                                <div>{{ $t("ui.label_move") }}</div>
                            </div>
                            <div class="non-wrappable-buttons">
                                <button id="btn-move-left" class="grid-button"
                                        v-on:mousedown="setMovementDirection('left')"
                                        v-on:mouseup="setMovementDirection(null)"
                                        v-on:touchstart="setMovementDirection('left')"
                                        v-on:touchend="setMovementDirection(null)">↖</button
                                ><button id="btn-move-up" class="grid-button"
                                        v-on:mousedown="setMovementDirection('up')"
                                        v-on:mouseup="setMovementDirection(null)"
                                        v-on:touchstart="setMovementDirection('up')"
                                        v-on:touchend="setMovementDirection(null)">↗</button>
                            </div>
                            <div class="non-wrappable-buttons">
                                <button id="btn-move-down" class="grid-button"
                                        v-on:mousedown="setMovementDirection('down')"
                                        v-on:mouseup="setMovementDirection(null)"
                                        v-on:touchstart="setMovementDirection('down')"
                                        v-on:touchend="setMovementDirection(null)">↙</button
                                ><button id="btn-move-right" class="grid-button"
                                        v-on:mousedown="setMovementDirection('right')"
                                        v-on:mouseup="setMovementDirection(null)"
                                        v-on:touchstart="setMovementDirection('right')"
                                        v-on:touchend="setMovementDirection(null)">↘</button>
                            </div>
                        </div>
                        <div class="tooltip-section" v-if="isBubbleSectionVisible">
                            <div class='tooltip-section-title'>
                                <div>{{ $t("ui.label_bubble") }}</div>
                            </div>
                            <div class="non-wrappable-buttons">
                                <button class="grid-button" v-on:click="sendNewBubblePositionToServer('left')">↖</button
                                ><button class="grid-button" v-on:click="sendNewBubblePositionToServer('up')">↗</button>
                            </div>
                            <div class="non-wrappable-buttons">
                                <button class="grid-button" v-on:click="sendNewBubblePositionToServer('down')">↙</button
                                ><button class="grid-button" v-on:click="sendNewBubblePositionToServer('right')">↘</button>
                            </div>
                        </div>
                        <div class="tooltip-section">
                            <button id="logout-button" v-if="isLogoutButtonVisible" v-on:click="logout" class="fas fa-sign-out-alt" v-bind:title="$t('ui.button_logout')"></button>
                        </div>
                    </div>
                </div>
                {{ $t("ui.label_log") }}
                <div id="chatLog" tabindex="-1" v-bind:class="{'underlined-usernames': underlinedUsernames, 'timestamps-in-copied-log': timestampsInCopiedLog}" v-on:keydown="handlechatLogKeydown($event)">
                </div>
            </div>
            <div id="video-streams">
                <div v-for="(streamSlot, index) in streams" v-bind:class="{'stream-is-active': streamSlot.isActive}" v-bind:key="streamSlot">
                    <hr v-if="index != 0" />
                    <div>
                        {{ $t("ui.label_stream", {index: index+1}) }}<span class="stream-title">{{
                            streamSlot.isActive
                                ? (streamSlot.userId in users
                                    ? toDisplayName(this.users[streamSlot.userId].name)
                                    : "")
                                : "OFF"
                        }}</span>
                    </div>
                    <div :id="'video-container-' + index" class='video-container pinned-video' v-show="streamSlot.withVideo && ((takenStreams[index] && streamSlot.isReady) || index == streamSlotIdInWhichIWantToStream)">
                        <button
                            class="fas fa-thumbtack pin-video-button"
                            v-show="takenStreams[index] || (streamSlot.isActive && index == streamSlotIdInWhichIWantToStream)"
                            v-on:click="toggleVideoSlotPinStatus(index)"></button>
                        <video :id="'local-video-' + index"
                            v-show="streamSlot.isActive && index == streamSlotIdInWhichIWantToStream"
                            autoplay muted></video>
                        <video :id="'received-video-' + index"
                            v-show="takenStreams[index] && index != streamSlotIdInWhichIWantToStream"
                            autoplay></video>
                    </div>
                    <div :id="'vu-meter-container-' + index"
                        v-show="streamSlot.isActive && streamSlot.withSound && index == streamSlotIdInWhichIWantToStream">
                        <div :id="'vu-meter-bar-primary-' + index"></div>
                        <div :id="'vu-meter-bar-secondary-' + index"></div>
                    </div>
                    <div
                        v-show="takenStreams[index] && streamSlot.isReady && streamSlot.withSound && index != streamSlotIdInWhichIWantToStream">
                        <label for="stream-volume">{{ $t("ui.volume") }}</label>
                        <input type="range" :id="'volume-' + index" v-on:change="changeStreamVolume(index)"
                            name="stream-volume" min="0" max="1" step="0.01" :value="slotVolume[index]">
                        <div v-if="canUseAudioContext">
                            <label :for="'enable-compression-' + index">{{ $t("ui.enable_compression") }}</label>
                            <input type="checkbox"
                                :id="'enable-compression-' + index"
                                v-model="slotCompression[index]"
                                v-on:change="onCompressionChanged(index)">
                        </div>
                    </div>
                    <div class="stream-buttons">
                        <button :id="'take-stream-button-' + index"
                            v-bind:class="{'red-button': streamSlot.isReady}"
                            v-if="!takenStreams[index] && streamSlot.userId != myUserID && !wantToStream"
                            v-on:click="wantToTakeStream(index)">
                            {{ $t("ui.button_stream_take") }}
                        </button>
                        <button :id="'drop-stream-button-' + index"
                            v-if="takenStreams[index] && streamSlot.userId != myUserID && !wantToStream"
                            v-on:click="wantToDropStream(index)">
                            {{ $t("ui.button_stream_drop") }}
                        </button>

                        <button :id="'start-video-streaming-button-' + index"
                            v-if="!streamSlot.isActive && !wantToStream && streamSlotIdInWhichIWantToStream == null"
                            v-on:click="openStreamPopup(index)">
                            {{ $t("ui.button_stream_start") }}
                        </button>
                        <button :id="'stop-streaming-button-' + index"
                            v-if="streamSlotIdInWhichIWantToStream == index" v-on:click="stopStreaming">
                            {{ $t("ui.button_stream_stop") }}
                        </button>
                    </div>
                </div>
                <hr v-if="streams.length && currentRoom.hasChessboard" />
                <chessboard-slot
                    v-if="currentRoom.hasChessboard"
                    v-bind:socket="socket"
                    v-bind:chessboard-state="chessboardState"
                    v-bind:users="users"
                    v-bind:my-user-id="myUserID"
                    ></chessboard-slot>
            </div>

            <div class="popup-overlay" v-if="isRulaPopupOpen" v-on:click="closeRulaPopup"></div>
            <div id="rula-popup" class="popup" v-if="isRulaPopupOpen" v-on:keydown="handleRulaPopupKeydown($event)" tabindex="-1">
                <div class="popup-title">{{ $t("ui.rula_menu_title") }}</div>
                <div class="popup-content">
                    <table class="popup-table popup-selectable-table popup-sortable-table">
                        <colgroup>
                            <col id="rula-menu-column-room-name" />
                            <col id="rula-menu-column-user-count" />
                            <col id="rula-menu-column-streamers" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th v-on:click="sortRoomList('sortName')">
                                    {{ $t("ui.rula_menu_column_room_name") }}
                                </th>
                                <th v-on:click="sortRoomList('userCount')">
                                    {{ $t("ui.rula_menu_column_user_count") }}
                                </th>
                                <th v-on:click="sortRoomList('streamerCount')">
                                    {{ $t("ui.rula_menu_column_streamers") }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="room in roomList"
                                :id="'room-tr-' + room.id"
                                v-bind:key="room.id"
                                v-bind:class="{'popup-row-is-selected': rulaRoomSelection == room.id}"
                                v-on:click="selectRoomForRula(room.id)">
                                <td>{{ $t("room." + room.id) }}</td>
                                <td>{{ room.userCount }}</td>
                                <td>{{ room.streamerDisplayNames.join(", ") }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="popup-buttons">
                    <button v-on:click="rula(rulaRoomSelection)">{{ $t("ui.rula_menu_button_rula") }}</button><button
                        v-on:click="closeRulaPopup">{{ $t("ui.popup_button_cancel") }}</button>
                </div>
            </div>

            <div class="popup-overlay" v-if="isUserListPopupOpen" v-on:click="closeUserListPopup"></div>
            <div id="user-list-popup" class="popup" v-if="isUserListPopupOpen">
                <div class="popup-title">{{ $t("ui.user_list_popup_title").replace("@USER_COUNT@", getUserListForListPopup().length) }}</div>
                <div class="popup-item" v-html="$t('ui.user_list_popup_blurb')"></div>
                <div class="popup-content">
                    <table class="popup-table">
                        <colgroup>
                            <col id="user-list-column-user-name" />
                            <col id="user-list-column-ignore-button" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>{{ $t("ui.user_list_popup_column_user_name") }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :id="'user-list-element-' + u.id"
                                v-bind:key="u.id"
                                v-for="u in getUserListForListPopup()"
                                v-bind:class="{'popup-row-is-selected': u.id == highlightedUserId}">
                                <td>
                                    <div v-on:click="u.isInRoom && highlightUser(u.id, u.name)">
                                        <span v-bind:title="$t('ui.user_not_in_room')"
                                              class="user-not-in-room-warning fas fa-exclamation-triangle"
                                              v-if="!u.isInRoom"></span>
                                        <img v-bind:title="$t('ui.user_inactive')"
                                              v-if="u.isInactive"
                                              class="inactive-user-icon"
                                              src="zzz-sleep-symbol.svg" />
                                        {{ u.name || $t("default_user_name") }}
                                    </div>
                                    <button v-if="ignoredUserIds.has(u.id)" v-on:click="unignoreUser(u.id)">{{ $t("ui.user_list_popup_unignore") }}</button>
                                    <button v-if="!ignoredUserIds.has(u.id)" v-on:click="ignoreUser(u.id)">{{ $t("ui.user_list_popup_ignore") }}</button>
                                    <button v-on:click="blockUser(u.id)">{{ $t("ui.user_list_popup_block") }}</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="popup-buttons">
                    <button v-on:click="closeUserListPopup">{{ $t("ui.user_list_popup_close") }}</button>
                </div>
            </div>


            <div class="popup-overlay" v-if="isStreamPopupOpen" v-on:click="closeStreamPopup"></div>
            <div id="stream-popup" class="popup" v-if="isStreamPopupOpen">
                <div class="popup-title">{{ $t("ui.stream_form_title") }}</div>
                <div class="popup-content">
                    <div class='popup-item'>
                        <span>{{ $t("ui.stream_form_mode") }}</span><input type="radio"
                            id="stream-form-video-sound-mode" value="video_sound" v-model="streamMode"><label
                            for="stream-form-video-sound-mode">{{ $t("ui.stream_form_video_sound_mode") }}</label>

                        <input type="radio" id="stream-form-sound-only-mode" value="sound" v-model="streamMode"><label
                            for="stream-form-sound-only-mode">{{ $t("ui.stream_form_sound_only_mode") }}</label>

                        <input type="radio" id="stream-form-video-only-mode" value="video" v-model="streamMode"><label
                            for="stream-form-video-only-mode">{{ $t("ui.stream_form_video_only_mode") }}</label>
                    </div>
                    <div class='popup-item'>
                        <input type="checkbox" id="stream-form-private-stream" v-model="streamIsPrivateStream"><label
                            for="stream-form-private-stream">{{ $t("ui.stream_form_private_stream") }}</label>
                    </div>
                    <div class='popup-item' v-if="streamMode != 'sound'">
                        <input type="checkbox" id="stream-form-screen-capture" v-model="streamScreenCapture"><label
                            for="stream-form-screen-capture">{{ $t("ui.stream_form_screen_capture") }}</label>
                    </div>
                    <div class='popup-item' v-if="streamMode != 'sound' && !streamScreenCapture">
                        <span>{{ $t("ui.stream_form_camera_facing") }}</span><input type="radio"
                            id="stream-form-camera-facing-user" value="user" v-model="streamCameraFacing"><label
                            for="stream-form-camera-facing-user">{{ $t("ui.stream_form_camera_facing_user") }}</label>

                        <input type="radio" id="stream-form-camera-facing-environment" value="environment" v-model="streamCameraFacing"><label
                            for="stream-form-camera-facing-environment">{{ $t("ui.stream_form_camera_facing_environment") }}</label>
                    </div>
                    <div v-if="streamMode != 'video'">
                        <div class='popup-item'>
                            <button v-if="!displayAdvancedStreamSettings"
                                v-on:click="displayAdvancedStreamSettings = true">{{ $t("ui.stream_form_show_advanced") }}</button>
                            <button v-if="displayAdvancedStreamSettings"
                                v-on:click="displayAdvancedStreamSettings = false">{{ $t("ui.stream_form_hide_advanced") }}</button>
                        </div>
                        <div v-if="displayAdvancedStreamSettings">
                            <div class='popup-item' v-if="streamMode != 'sound' && streamScreenCapture">
                                <div>
                                    <input type="checkbox" id="stream-form-screen-capture-audio" v-model="streamScreenCaptureAudio"><label
                                        for="stream-form-screen-capture-audio">{{ $t("ui.stream_form_screen_capture_audio") }}</label>
                                </div>
                                <div class='popup-notice'>{{ $t("ui.stream_form_screen_capture_audio_notice") }}</div>
                            </div>
                            <div class='popup-item' v-if="!streamScreenCapture || !streamScreenCaptureAudio">
                                <div>
                                    <input type="checkbox" id="stream-form-echo-cancellation"
                                        v-model="streamEchoCancellation"><label for="stream-form-echo-cancellation">{{
                                        $t("ui.stream_form_echo_cancellation") }}</label>
                                </div>
                                <div v-if="!streamScreenCapture || !streamScreenCaptureAudio">
                                    <input type="checkbox" id="stream-form-noise-suppression"
                                        v-model="streamNoiseSuppression"><label for="stream-form-noise-suppression">{{
                                        $t("ui.stream_form_noise_suppression") }}</label>
                                </div>
                                <div v-if="!streamScreenCapture || !streamScreenCaptureAudio">
                                    <input type="checkbox" id="stream-form-auto-gain" v-model="streamAutoGain"><label
                                        for="stream-form-auto-gain">{{ $t("ui.stream_form_auto_gain") }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="popup-buttons">
                    <button v-on:click="wantToStartStreaming">{{ $t("ui.stream_form_button_stream") }}</button><button
                        v-on:click="closeStreamPopup">{{ $t("ui.popup_button_cancel") }}</button>
                </div>
            </div>

            <div class="popup-overlay" v-if="isPreferencesPopupOpen" v-on:click="closePreferencesPopup"></div>
            <div class="popup" v-if="isPreferencesPopupOpen">
                <div class="popup-title">{{ $t("ui.preferences_title") }}</div>
                <div class="popup-content">
                    <div class='popup-section'>
                        <div class='popup-header'>{{ $t("ui.preferences_title_general") }}</div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-shift-enter"
                                v-model="isNewlineOnShiftEnter" v-on:change="storeSet('isNewlineOnShiftEnter')"><label
                                for="preferences-shift-enter">{{ $t("ui.preferences_shift_enter") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-underlined-usernames"
                                v-model="underlinedUsernames" v-on:change="storeSet('underlinedUsernames')"><label
                                for="preferences-underlined-usernames">{{ $t("ui.preferences_underlined_usernames") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-timestamps-in-copied-log"
                                v-model="timestampsInCopiedLog" v-on:change="storeSet('timestampsInCopiedLog')"><label
                                for="preferences-timestamps-in-copied-log">{{ $t("ui.preferences_timestamps_in_copied_log") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-dark-mode"
                                v-model="isDarkMode" v-on:change="handleDarkMode"><label
                                for="preferences-dark-mode">{{ $t("ui.preferences_dark_mode") }}</label>
                        </div>
                    </div>
                    <div class='popup-section'>
                        <div class='popup-header'>{{ $t("ui.preferences_title_notifications") }}</div>
                        <div class='popup-item'>
                            <div>
                                <input type="checkbox" id="preferences-show-notifications"
                                    v-model="showNotifications" v-on:change="handleShowNotifications"><label
                                    for="preferences-show-notifications">{{ $t("ui.preferences_show_notifications") }}</label>
                            </div>
                            <div v-if="!notificationPermissionsGranted" class="popup-notice">{{ $t("ui.notifications_are_denied") }}</div>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-login-sound-enabled"
                                v-model="isLoginSoundEnabled" v-on:change="storeSet('isLoginSoundEnabled')"><label
                                for="preferences-login-sound-enabled">{{ $t("ui.preferences_login_sound_enabled") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-message-sound-enabled"
                                v-model="isMessageSoundEnabled" v-on:change="storeSet('isMessageSoundEnabled')"><label
                                for="preferences-message-sound-enabled">{{ $t("ui.preferences_message_sound_enabled") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-name-mention-sound-enabled"
                                v-model="isNameMentionSoundEnabled" v-on:change="handleNameMentionSoundEnabled"><label
                                for="preferences-name-mention-sound-enabled">{{ $t("ui.preferences_name_mention_sound_enabled") }}</label>
                        </div>
                        <div class='popup-item'>
                            <div>
                                <label for="preferences-custom-mention-sound-pattern">{{ $t("ui.preferences_custom_mention_sound_pattern") }}</label>
                                <input type="text" id="preferences-custom-mention-sound-pattern"
                                    v-model="customMentionSoundPattern" v-on:change="handleCustomMentionSoundPattern">
                            </div>
                            <div class='popup-notice'>{{ $t("ui.preferences_custom_mention_sound_notice") }}</div>
                        </div>
                    </div>
                    <div class='popup-section'>
                        <div class='popup-header'>{{ $t("ui.preferences_title_game") }}</div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-name-bg"
                                v-model="showUsernameBackground" v-on:click="toggleUsernameBackground"><label
                                for="preferences-name-bg">{{ $t("ui.preferences_name_bg") }}</label>
                        </div>
                        <div class='popup-item'>
                            <label for="preferences-bubble-opacity">{{ $t("ui.preferences_bubble_opacity") }}</label>
                            <input type="range" id="preferences-bubble-opacity"
                                min="50" max="100" v-model="bubbleOpacity" v-on:change="handleBubbleOpacity"><div
                                class='preferences-percentage'>{{ bubbleOpacity }}%</div>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-low-quality"
                                v-model="isLowQualityEnabled" v-on:change="handleLowQualityEnabled"><label
                                for="preferences-low-quality">{{ $t("ui.preferences_low_quality") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-crisp-mode"
                                v-model="isCrispModeEnabled" v-on:change="handleCrispModeEnabled"><label
                                for="preferences-crisp-mode">{{ $t("ui.preferences_crisp_mode") }}</label>
                        </div>
                    </div>
                    <div class='popup-section'>
                        <div class='popup-header'>{{ $t("ui.preferences_title_toolbar") }}</div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-command-section-visible"
                                v-model="isCommandSectionVisible" v-on:change="storeSet('isCommandSectionVisible')"><label
                                for="preferences-command-section-visible">{{ $t("ui.preferences_command_section_visible") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-move-section-visible"
                                v-model="isMoveSectionVisible" v-on:change="storeSet('isMoveSectionVisible')"><label
                                for="preferences-move-section-visible">{{ $t("ui.preferences_move_section_visible") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-bubble-section-visible"
                                v-model="isBubbleSectionVisible" v-on:change="storeSet('isBubbleSectionVisible')"><label
                                for="preferences-bubble-section-visible">{{ $t("ui.preferences_bubble_section_visible") }}</label>
                        </div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-logout-button-visible"
                                v-model="isLogoutButtonVisible" v-on:change="storeSet('isLogoutButtonVisible')"><label
                                for="preferences-logout-button-visible">{{ $t("ui.preferences_logout_button_visible") }}</label>
                        </div>
                    </div>
                    <div class='popup-section'>
                        <div class='popup-header'>{{ $t("ui.preferences_title_tts") }}</div>
                        <div class='popup-item'>
                            <input type="checkbox" id="preferences-text-to-speech"
                                v-model="enableTextToSpeech" v-on:change="handleEnableTextToSpeech"><label
                                for="preferences-text-to-speech">{{ $t("ui.preferences_enable_text_to_speech") }}</label>
                        </div>
                        <div class='popup-item'>
                            <label for="preferences-tts-voice">{{ $t("ui.preferences_tts_voice") }}</label>
                            <select id="preferences-tts-voice" v-model="ttsVoiceURI" v-on:change="changeVoice">
                                <option value="automatic">{{ $t("ui.preferences_tts_voice_automatic") }}</option>
                                <option value="animalese">{{ $t("ui.preferences_tts_voice_animalese") }}</option>
                                <option v-for="voice in availableTTSVoices" :value="voice.voiceURI" v-bind:key="voice.voiceURI">{{ voice.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="popup-buttons">
                    <button v-on:click="closePreferencesPopup">{{ $t("ui.popup_button_ok") }}</button>
                </div>
            </div>

            <div class="popup" v-if="isWarningToastOpen">
                <div class="popup-title">{{ $t("ui.warning_toast_title") }}</div>
                <div class="popup-content">
                    <div class="popup-item">
                        {{ warningToastMessage }}
                    </div>
                </div>
                <div class="popup-buttons">
                    <button v-on:click="closeWarningToast">{{ $t("ui.popup_button_ok") }}</button>
                </div>
            </div>
        </div>
        <div id="logged-out-page" v-if="loggedOut" class="full-screen-page">
            {{ $t("msg.goodbye") }}
            <img src="characters/giko/front-standing.svg"/>
            <a href="/">{{ $t("ui.back_to_homepage") }}</a>
        </div>
        <div id="poop-page" v-if="isPoop" class="full-screen-page">
            💩
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, nextTick } from "vue";
import { io, Socket } from "socket.io-client"
import ChessboardSlot from "./components/ChessboardSlot.vue"
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { BLOCK_HEIGHT, BLOCK_WIDTH, canUseAudioContext, getFormattedCurrentDate, loadImage, logToServer, postJson, requestNotificationPermission, safeDecodeURI, urlRegex, calculateRealCoordinates, UserException, debounceWithImmediateExecution, AudioProcessor, debounceWithDelayedExecution, isRunningOnWebpackServer } from "./utils"
import { Direction, PlayerDto, Room, RoomListItem, RoomListItemDto, RoomObject, RoomStateDto, StreamSlot, StreamSlotDto } from "./backend/types"
import { Character, characters, loadCharacters } from "./character"
import { isWebrtcReceiveCodecSupported, isWebrtcPublishCodecSupported, WebrtcCodec } from "webrtc-codec-support"
import $ from "jquery";
import "jquery-ui" // TODO find a better way to include jquery-ui
import 'jquery-ui-bundle' // TODO find a better way to include jquery-ui
import 'jquery-ui-bundle/jquery-ui.css' // TODO find a better way to include jquery-ui
import User from "./user";
import { RenderCache } from "./rendercache";
import { speak } from "./tts";
import { RTCPeer } from "./rtcpeer";
import i18n from "./i18n";

window.$ = $; // Horrible workaround for making $ visible to chessboard.js

export default defineComponent({
  name: "App",
  data: () => ({
    loginFooterContent: document.getElementById("login-footer-content")?.innerHTML ?? "<h1>ciao</h1>",

    userStatsForHomepage: {
        userCountGen: window.USER_COUNT_GEN,
        streamerCountGen: window.STREAMER_COUNT_GEN,
        userCountFor: window.USER_COUNT_FOR,
        streamerCountFor: window.STREAMER_COUNT_FOR,
    },

    selectedCharacter: null as Character | null,

    socket: null as Socket<DefaultEventsMap, DefaultEventsMap> | null,

    users: {} as { [id: string]: User},
    roomLoadId: 0,
    currentRoom: null as Room | null,
    myUserID: null as string | null,
    myPrivateUserID: null as string | null,
    isWaitingForServerResponseOnMovement: false,
    justSpawnedToThisRoom: true,
    isLoadingRoom: false,
    requestedRoomChange: false,
    isInfoboxVisible: localStorage.getItem("isInfoboxVisible") == "true",
    soundEffectVolume: 0,
    characterId: localStorage.getItem("characterId") || "giko",
    isLoggingIn: false,
    areaId: localStorage.getItem("areaId") ||"gen", // 'gen' or 'for'

    // canvas
    canvasContext: null as CanvasRenderingContext2D | null,
    isRedrawRequired: false,
    isUsernameRedrawRequired: false,
    isDraggingCanvas: false,
    canvasPointerStartState: null as {
        dist: number | null,
        pos: { x: number, y: number }
    } | null,
    canvasDragStartOffset: null as { x: number, y: number } | null,
    canvasManualOffset: { x: 0, y: 0 },
    canvasGlobalOffset: { x: 0, y: 0 },
    canvasDimensions: { w: 0, h: 0 },
    userCanvasScale: 1,
    userCanvasScaleStart: null as number | null,
    isLowQualityEnabled: localStorage.getItem("isLowQualityEnabled") == "true",
    isCrispModeEnabled: localStorage.getItem("isCrispModeEnabled") == "true",
    blockWidth: BLOCK_WIDTH,
    blockHeight: BLOCK_HEIGHT,
    devicePixelRatio: 1,
    backgroundImage: null as RenderCache | null,
    canvasObjects: null as ({
                                o: RoomObject,
                                type: "room-object",
                                priority: number,
                            }
                            | {
                                o: User,
                                type: "user",
                                priority: number,
                            }) []
                            | null,

    // rula stuff
    isRulaPopupOpen: false,
    roomList: [] as RoomListItem[],
    lastRoomListSortKey: (localStorage.getItem("lastRoomListSortKey") || "sortName") as "sortName" | "userCount" | "streamerCount",
    lastRoomListSortDirection: Number(localStorage.getItem("lastRoomListSortDirection") || 1),
    rulaRoomSelection: null as string | null,

    // user list stuff
    isUserListPopupOpen: false,
    ignoredUserIds: new Set(),

    // preferences stuff
    isPreferencesPopupOpen: false,
    showUsernameBackground: localStorage.getItem("showUsernameBackground") != "false",
    isNewlineOnShiftEnter: localStorage.getItem("isNewlineOnShiftEnter") != "false",
    bubbleOpacity: Number(localStorage.getItem("bubbleOpacity") || 100),
    isCommandSectionVisible: localStorage.getItem("isCommandSectionVisible") != "false",
    isMoveSectionVisible: localStorage.getItem("isMoveSectionVisible") != "false",
    isBubbleSectionVisible: localStorage.getItem("isBubbleSectionVisible") != "false",
    isLogoutButtonVisible: localStorage.getItem("isLogoutButtonVisible") != "false",
    isDarkMode: localStorage.getItem("isDarkMode") == "true",
    showNotifications: localStorage.getItem("showNotifications") != "false",
    enableTextToSpeech: localStorage.getItem("enableTextToSpeech") == "true",
    ttsVoiceURI: localStorage.getItem("ttsVoiceURI") || "automatic",
    voiceVolume: Number(localStorage.getItem("voiceVolume") || 100),
    availableTTSVoices: [] as SpeechSynthesisVoice[],
    isMessageSoundEnabled: localStorage.getItem("isMessageSoundEnabled") != "false",
    isLoginSoundEnabled: localStorage.getItem("isLoginSoundEnabled") != "false",
    isNameMentionSoundEnabled: localStorage.getItem("isNameMentionSoundEnabled") == "true",
    customMentionSoundPattern: localStorage.getItem("customMentionSoundPattern") || "",
    mentionSoundFunction: null as ((msg: string) => boolean) | null,

    // streaming
    streams: [] as StreamSlotDto[],
    mediaStream: null as MediaStream | null,
    streamSlotIdInWhichIWantToStream: null as number | null,
    rtcPeerSlots: [] as ({
        attempts: 0,
        rtcPeer: RTCPeer | null,
    } | null)[],
    takenStreams: [] as boolean[], // streams taken by me
    slotVolume: JSON.parse(localStorage.getItem("slotVolume") || "{}"), // key: slot Id / value: volume
    slotCompression: [] as boolean[],
    audioProcessors: {} as { [slotID: number]: AudioProcessor },

    // stream settings
    isStreamPopupOpen: false,
    streamMode: "video_sound" as "video_sound" | "video" | "sound",
    displayAdvancedStreamSettings: false,
    streamEchoCancellation: false,
    streamNoiseSuppression: false,
    streamAutoGain: false,
    streamIsPrivateStream: false,
    streamScreenCapture: false,
    streamScreenCaptureAudio: false,
    streamCameraFacing: "user",

    // Warning Toast
    isWarningToastOpen: false,
    warningToastMessage: "",
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

    vuMeterTimer: null as NodeJS.Timer | null,
    highlightedUserId: null as string | null,
    highlightedUserName: null as string | null,
    movementDirection: null as Direction | null,
    underlinedUsernames: localStorage.getItem("underlinedUsernames") == "true",
    timestampsInCopiedLog: localStorage.getItem("timestampsInCopiedLog") != "false",
    notificationPermissionsGranted: false,
    canUseAudioContext: canUseAudioContext,
    lastFrameTimestamp: 0,
    chessboardState: {},

    loadCharacterImagesPromise: null as Promise<void[]> | null,
    isCanvasPointerDown: false,
    lastSetMovementDirectionTime: Date.now(),
  }),
  mounted() {
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
            this.closeRulaPopup()
            this.closeUserListPopup()
            this.closeStreamPopup()
            this.closePreferencesPopup()
            this.closeWarningToast()
        }
        if (ev.code == "KeyG" && ev.ctrlKey)
        {
            ev.preventDefault()
            document.getElementById("input-textbox")!.focus()
            return
        }
        if (ev.code == "KeyL" && ev.ctrlKey)
        {
            ev.preventDefault()
            document.getElementById("chatLog")!.focus()
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
        this.setLanguage("en")

    this.loadCharacterImagesPromise = loadCharacters(this.isCrispModeEnabled);

    // Enable dark mode stylesheet (gotta do it here in the "mounted" event because otherwise
    // the screen will flash dark for a bit while loading the page)
    for (let i = 0; i < document.styleSheets.length; i++)
            if (document.styleSheets[i].title == "dark-mode-sheet")
                document.styleSheets[i].disabled = false

    const charSelect = document.getElementById("character-selection")!
    const charactersSelected = charSelect.getElementsByClassName("character-selected")
    if (charactersSelected.length)
        charactersSelected[0].scrollIntoView({block: "nearest"})

    document.getElementById("username-textbox")!.focus()

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
    login: async function (ev: Event)
    {
        try {
            ev.preventDefault();
            this.isLoggingIn = true;

            // This is to make sure that the browser doesn't attempt to show the
            // "autocomplete" drop down list when pressing the arrow keys on the keyboard,
            // even when the textbox isn't visibile anymore (dunno why this happens, a firefox bug maybe).
            document.getElementById("username-textbox")!.blur()

            localStorage.setItem("username", this.username)
            localStorage.setItem("characterId", this.characterId)
            localStorage.setItem("areaId", this.areaId)

            window.addEventListener("resize", () =>
            {
                this.isRedrawRequired = true;
            })

            await this.loadCharacterImagesPromise;

            const die = Math.random()
            if (this.characterId === "naito" && die < 0.25)
                this.characterId = "funkynaito"
            if (this.characterId === "dokuo" && die < 0.15)
                this.characterId = "tabako_dokuo"


            if (this.password == "iapetus56")
                this.characterId = "shar_naito"

            this.selectedCharacter = characters[this.characterId];

            await this.connectToServer();
            this.loggedIn = true;
            this.isLoggingIn = false;

            await nextTick() // registerKeybindings needs the next page to be rendered

            this.registerKeybindings();

            const roomCanvas = document.getElementById("room-canvas") as HTMLCanvasElement
            this.canvasContext = roomCanvas.getContext("2d")!;
            this.paintLoop(0);

            this.soundEffectVolume = Number(localStorage.getItem(this.areaId + "soundEffectVolume") || 0)

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
                    this.changeSoundEffectVolume(ui.value!);
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
                    this.changeVoiceVolume(ui.value!);
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
            console.error(e, e.stack)
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
    getSVGMode: function ()
    {
        return this.isCrispModeEnabled ? "crisp" : null;
    },
    reloadImages: async function ()
    {
        this.loadRoomBackground();
        this.loadRoomObjects();

        await (loadCharacters(this.isCrispModeEnabled));
        this.isRedrawRequired = true;
    },
    setLanguage: function (code: string)
    {
        if (this.$root)
            this.$root.$i18n.locale = code
    },
    showWarningToast: function (text: string)
    {
        this.warningToastMessage = text;
        this.isWarningToastOpen = true;
    },
    closeWarningToast: function ()
    {
        this.isWarningToastOpen = false;
    },
    loadRoomBackground: async function ()
    {
        const urlMode = (!this.getSVGMode() ? "" : "." + this.getSVGMode());

        const roomLoadId = this.roomLoadId;

        const image = await loadImage(this.currentRoom!.backgroundImageUrl.replace(".svg", urlMode + ".svg"))

        if (this.roomLoadId != roomLoadId) return;

        this.backgroundImage = RenderCache.Image(image, this.currentRoom!.scale);
        this.isRedrawRequired = true;
    },
    loadRoomObjects: async function ()
    {
        const urlMode = (!this.getSVGMode() ? "" : "." + this.getSVGMode());

        const roomLoadId = this.roomLoadId;

        await Promise.all(Object.values(this.currentRoom!.objects).map((o: RoomObject) =>
            loadImage("rooms/" + this.currentRoom!.id + "/" + o.url.replace(".svg", urlMode + ".svg"))
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
    updateRoomState: async function (dto: RoomStateDto)
    {
        const roomDto = dto.currentRoom
        const usersDto = dto.connectedUsers
        const streamsDto = dto.streams

        this.chessboardState = dto.chessboardState

        this.isLoadingRoom = true;
        this.roomLoadId = this.roomLoadId + 1;

        if (dto.currentRoom.needsFixedCamera)
            this.canvasManualOffset = { x: 0, y: 0 }

        const previousRoomId = this.currentRoom && this.currentRoom.id
        this.currentRoom = roomDto;

        this.users = {};

        for (const u of usersDto)
        {
            const user = this.addUser(u);

            if (previousRoomId != this.currentRoom.id && user.message)
            {
                this.displayUserMessage(user, user.message);
            }
        }

        // Force update of user coordinates using the current room's logics (origin coordinates, etc)
        this.forcePhysicalPositionRefresh();

        await this.loadRoomBackground();
        await this.loadRoomObjects();

        this.blockWidth = this.currentRoom.blockWidth ? this.currentRoom.blockWidth : BLOCK_WIDTH;
        this.blockHeight = this.currentRoom.blockHeight ? this.currentRoom.blockHeight : BLOCK_HEIGHT;

        // stream stuff
        this.updateCurrentRoomStreams(streamsDto);

        // I can't remember why this focus() is here... commenting it for now because
        // it throws an error.
        // document.getElementById("room-canvas")!.focus();
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
        });

        const loginMessage = await loginResponse.json();

        if (!loginMessage.isLoginSuccessful) throw new UserException(loginMessage.error);

        this.myUserID = loginMessage.userId;
        this.myPrivateUserID = loginMessage.privateUserId;

        logToServer(new Date() + " " + this.myUserID
                    + " window.EXPECTED_SERVER_VERSION: "+ window.EXPECTED_SERVER_VERSION
                    + " loginMessage.appVersion: " + loginMessage.appVersion
                    + " DIFFERENT: " + (window.EXPECTED_SERVER_VERSION != loginMessage.appVersion))

        if (window.EXPECTED_SERVER_VERSION < loginMessage.appVersion)
            this.pageRefreshRequired = true

        // prevent accidental page closing
        window.onbeforeunload = () => {
            // Before onbeforeunload the socket has already died, so
            // i have to start it again here, in case the user
            // decides that he doesn't want to close the window.
            this.initializeSocket();
            return "Are you sure?";
        }

        // load the room state before connecting the websocket, so that all
        // code handling websocket events (and paint() events) can assume that
        // currentRoom, streams etc... are all defined

        const response = await fetch("/areas/" + this.areaId + "/rooms/admin_st")
        this.updateRoomState(await response.json())

        logToServer(new Date() + " " + this.myUserID + " User agent: " + navigator.userAgent)

        this.initializeSocket()
    },
    initializeSocket: function()
    {
        if (isRunningOnWebpackServer())
          this.socket = io("http://localhost:8085")
        else
          this.socket = io()

        const immanentizeConnection = async () =>
        {
            // it can happen that the user is pressing the arrow keys while the
            // socket is down, in which case the server will never answer to the
            // user-move event, and isWaitingForServerResponseOnMovement will never
            // be reset. So, just in case, I reset it at every socket reconnection.
            this.isWaitingForServerResponseOnMovement = false

            this.connectionLost = false;
            this.socket!.emit("user-connect", this.myPrivateUserID);

            // Check if there's a new version
            const response = await fetch("/version");
            if (!response.ok)
                throw response
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
            console.error("Socket disconnected:", reason)
            this.connectionLost = true;
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

        this.socket.on("server-system-message", (messageCode) =>
        {
            this.writeMessageToLog("SYSTEM", this.$t(messageCode), null)
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
                user.moveImmediatelyToPosition(this.currentRoom!, x, y, direction);
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
            {
                const loginSound = document.getElementById("login-sound") as HTMLAudioElement
                loginSound.play();
            }
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
            this.users[userId].isInactive = true;
            this.isRedrawRequired = true;
        });

        this.socket.on("server-user-active", (userId) =>
        {
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
        this.socket.on("server-update-current-room-streams", (streams) =>
        {
            this.updateCurrentRoomStreams(streams);
        });

        this.socket.on("server-room-list", async (roomList: RoomListItemDto[]) =>
        {
            this.roomList = roomList.map(r => ({
                id: r.id,
                userCount: r.userCount,
                streamers: r.streamers,
                sortName: this.$t("room." + r.id, {reading: true}),
                streamerCount: r.streamers.length,
                streamerDisplayNames: r.streamers.map(s => this.toDisplayName(s)),
            }));
            this.sortRoomList(this.lastRoomListSortKey, this.lastRoomListSortDirection)
            this.isRulaPopupOpen = true;

            await nextTick()
            document.getElementById("rula-popup")!.focus()
        });

        this.socket.on("server-rtc-message", async (streamSlotId: number, type, msg) =>
        {
            console.log("server-rtc-message", streamSlotId, type, msg);
            const rtcPeer = this.rtcPeerSlots[streamSlotId]!.rtcPeer;
            if (rtcPeer === null) return;
            if(type == "offer")
            {
                rtcPeer.acceptOffer(msg);
            }
            else if(type == "answer")
            {
                msg = msg.replace(/\r\n.*candidate.*udp.*\r\n/g, "\r\n");
                console.log(msg)
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

            this.writeMessageToLog("SYSTEM", this.$t("msg.chess_win").replace("@USER_NAME@", winnerUserName), null)
        })

        this.socket.on("server-chess-quit", winnerUserId => {
            const winnerUserName = this.toDisplayName(this.users[winnerUserId] ? this.users[winnerUserId].name : "N/A")

            this.writeMessageToLog("SYSTEM", this.$t("msg.chess_quit").replace("@USER_NAME@", winnerUserName), null)
        })
    },
    addUser: function (userDTO: PlayerDto): User
    {
        const newUser = new User(userDTO);
        newUser.moveImmediatelyToPosition(
            this.currentRoom!,
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

        return newUser;
    },
    writeMessageToLog: function(userName: string, msg: string, userId: string | null)
    {
        const chatLog = document.getElementById("chatLog")!;
        const isAtBottom = (chatLog.scrollHeight - chatLog.clientHeight) - chatLog.scrollTop < 5;

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");

        if (userId)
            messageDiv.dataset.userId = userId
        if (userId && userId == this.highlightedUserId)
            messageDiv.classList.add("highlighted-message")

        if (!userId && userName == "SYSTEM")
            messageDiv.classList.add("system-message")

        const [displayName, tripcode] = this.toDisplayName(userName).split("◆")

        const timestampSpan = document.createElement("span")
        timestampSpan.className = "message-timestamp"
        timestampSpan.innerHTML = "[" + getFormattedCurrentDate() + "]&nbsp;"

        const authorSpan = document.createElement("span");
        authorSpan.className = "message-author";
        authorSpan.title = new Date().toString()
        authorSpan.textContent = displayName;
        authorSpan.addEventListener("click", (ev) => {
            this.highlightUser(userId, this.toDisplayName(userName))
        })

        const tripcodeSpan = document.createElement("span");
        if (tripcode)
        {
            tripcodeSpan.className = "message-author";
            tripcodeSpan.title = new Date().toString()
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
                const url = anchor.textContent!;
                anchor.href = (prefix == 'www.' ? 'http://' + url : url);
                anchor.textContent = safeDecodeURI(url);
                return anchor.outerHTML;
            });

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
    displayUserMessage: async function (user: User, msg: string)
    {
        // Don't do anything for ignored users
        if (this.ignoredUserIds.has(user.id))
            return;

        const plainMsg = msg.replace(urlRegex, s => safeDecodeURI(s));

        user.message = plainMsg;
        if(user.lastMessage != user.message)
        {
            user.bubbleImage = null;
            this.isRedrawRequired = true;
            user.lastMessage = user.message;
        }

        if(!user.message) return;

        if (this.soundEffectVolume > 0)
        {
            if (this.mentionSoundFunction &&
                this.mentionSoundFunction(plainMsg))
                {
                    const mentionSound = document.getElementById("mention-sound") as HTMLAudioElement
                    mentionSound.play();
                }
            else if (this.isMessageSoundEnabled)
            {
                const messageSound = document.getElementById("message-sound") as HTMLAudioElement
                messageSound!.play();
            }
        }

        this.writeMessageToLog(user.name, msg, user.id)

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
    toDisplayName: function (name: string)
    {
        if (name == "")
            return this.$t("default_user_name");
        return name;
    },
    drawImage: function (context: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number = 0, y: number = 0)
    {
        context.drawImage(
            image,
            Math.round(this.getCanvasScale() * x + this.canvasGlobalOffset.x),
            Math.round(this.getCanvasScale() * y + this.canvasGlobalOffset.y)
        );
    },
    getNameImage: function(name: string, withBackground: boolean)
    {
        const [displayName, tripcode] = name.split("◆")

        const lineHeight = 13
        const height = lineHeight * (tripcode && displayName ? 2 : 1) + 3;

        const fontPrefix = "bold ";
        const fontSuffix = "px Arial, Helvetica, sans-serif";

        return new RenderCache(function(canvas: HTMLCanvasElement, scale: number)
        {
            const context = canvas.getContext('2d')!;
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
            context.fillStyle = "blue";

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
    getBubbleImage: function(user: User)
    {
        const maxLineWidth = 250;
        const lineHeight = 15;
        const fontHeight = 13;
        const fontSuffix = "px IPAMonaPGothic,'IPA モナー Pゴシック',Monapo,Mona,'MS PGothic','ＭＳ Ｐゴシック',submona,sans-serif";

        const boxArrowOffset = 5;
        const boxMargin = 6;
        const boxPadding = [5, 3];

        let messageLines: string[] = user.message!.split(/\r\n|\n\r|\n|\r/);
        let preparedLines = null as string[] | null;
        let textWidth = 0;

        const arrowCorner = [
            ["down", "left"].includes(user.bubblePosition),
            ["up", "left"].includes(user.bubblePosition)];

        return new RenderCache((canvas: HTMLCanvasElement, scale: number) =>
        {
            const context = canvas.getContext('2d')!;
            context.font = fontHeight + fontSuffix;

            if (preparedLines === null)
            {
                preparedLines = [];
                textWidth = 0;

                while (messageLines.length && preparedLines.length < 5)
                {
                    const line = messageLines.shift()!
                    let lastPreparedLine = "";
                    let lastLineWidth = 0;
                    for (let i=0; i<line!.length; i++)
                    {
                        const preparedLine = line!.substring(0, i+1);
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
                arrowCorner[0] ? canvas.width : 0,
                arrowCorner[1] ? canvas.height : 0);
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
                    (arrowCorner[0] ? 0 : sBoxMargin) + sBoxPadding[0],
                    (arrowCorner[1] ? 0 : sBoxMargin) + sBoxPadding[1] + (i*sLineHeight) + (sLineHeight/2));
            }

            return [boxWidth + boxMargin, boxHeight + boxMargin]
        });
    },
    detectCanvasResize: function ()
    {
        const devicePixelRatio = this.getDevicePixelRatio();

        const offsetWidth = this.canvasContext!.canvas.offsetWidth * devicePixelRatio;
        const offsetHeight = this.canvasContext!.canvas.offsetHeight * devicePixelRatio

        if (this.canvasDimensions.w != offsetWidth ||
            this.canvasDimensions.h != offsetHeight ||
            this.devicePixelRatio != devicePixelRatio)
        {
            this.canvasDimensions.w = offsetWidth;
            this.canvasDimensions.h = offsetHeight;

            this.canvasContext!.canvas.width = this.canvasDimensions.w;
            this.canvasContext!.canvas.height = this.canvasDimensions.h;

            this.devicePixelRatio = devicePixelRatio
        }
    },
    setCanvasGlobalOffset: function ()
    {
        if (this.currentRoom!.needsFixedCamera)
        {
            const fixedCameraOffset = this.currentRoom!.backgroundOffset ||
                { x: 0, y: 0 };
            this.canvasGlobalOffset.x = this.getCanvasScale() * -fixedCameraOffset.x
            this.canvasGlobalOffset.y = this.getCanvasScale() * -fixedCameraOffset.y
            return;
        }

        const userOffset = { x: 0, y: 0 };
        if (this.myUserID! in this.users)
        {
            const user = this.users[this.myUserID!]

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

        const backgroundImage = this.backgroundImage!.getImage(this.getCanvasScale())

        const bcDiff =
        {
            w: backgroundImage.width - this.canvasDimensions.w,
            h: backgroundImage.height - this.canvasDimensions.h
        }

        const margin = (this.currentRoom!.isBackgroundImageOffsetEdge ?
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

    calculateUserPhysicalPositions: function (delta: number)
    {
        for (const id in this.users)
        {
            this.users[id].calculatePhysicalPosition(this.currentRoom!, delta);
        }
    },

    updateCanvasObjects: function ()
    {
        const objects: any[] = this.currentRoom!.objects
                .map(o => ({
                    o,
                    type: "room-object",
                    priority: o.x + 1 + (this.currentRoom!.size.y - o.y),
                }))

        const users: any[] = Object.values(this.users).map(o => ({
                o,
                type: "user",
                priority: o.logicalPositionX + 1 + (this.currentRoom!.size.y - o.logicalPositionY),
            }))

        // TODO: maybe having a single canvasObjects list isn't a good idea?
        this.canvasObjects = objects.concat(users)
            .sort((a, b) =>
            {
                if (a.priority < b.priority) return -1;
                if (a.priority > b.priority) return 1;
                return 0;
            });
    },

    paintBackground: function ()
    {
        const context = this.canvasContext!;

        if (this.currentRoom!.backgroundColor)
            context.fillStyle = this.currentRoom!.backgroundColor;
        else
            context.fillStyle = this.isDarkMode ? "#354F52" : "#b0b0b0";
        context.fillRect(0, 0, this.canvasDimensions.w, this.canvasDimensions.h);

        this.drawImage(
            context,
            this.backgroundImage!.getImage(this.getCanvasScale())
        );
    },

    drawObjects: function ()
    {
        const context = this.canvasContext!;

        for (const o of this.canvasObjects!)
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

                const renderImage = o.o.getCurrentImage(this.currentRoom!);
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
        for (const o of this.canvasObjects!.filter(o => o.type == "user" && !this.ignoredUserIds.has(o.o.id)))
        {
            if (o.type == "user" && !this.ignoredUserIds.has(o.o.id))
            {
                if (o.o.nameImage == null || this.isUsernameRedrawRequired)
                    o.o.nameImage = this.getNameImage(this.toDisplayName(o.o.name), this.showUsernameBackground);

                const image = o.o.nameImage.getImage(this.getCanvasScale())

                this.drawImage(
                    this.canvasContext!,
                    image,
                    o.o.currentPhysicalPositionX + this.blockWidth/2 - o.o.nameImage.width/2,
                    o.o.currentPhysicalPositionY - 120
                );
            }
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
        for (const o of this.canvasObjects!)
        {
            if (o.type == "user" && !this.ignoredUserIds.has(o.o.id))
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
                    this.canvasContext!,
                    image,
                    user.currentPhysicalPositionX + this.blockWidth/2
                        + (pos[0] ? 21 : -21 - user.bubbleImage.width),
                    user.currentPhysicalPositionY
                        - (pos[1] ? 62 : 70 + user.bubbleImage.height)
                );
            }
        }
    },

    drawOriginLines: function ()
    {
        const context = this.canvasContext!;

        context.strokeStyle = "#ff0000";

        const co = this.canvasGlobalOffset;

        context.beginPath();
        context.moveTo(co.x+11, co.y-1);
        context.lineTo(co.x-1, co.y-1);
        context.lineTo(co.x-1, co.y+10);
        context.stroke();

        const origin = calculateRealCoordinates(this.currentRoom!, 0, 0)

        const cr_x = co.x+origin.x;
        const cr_y = co.y+origin.y;

        context.beginPath();
        context.rect(cr_x-1, cr_y+1, this.blockWidth+2, -this.blockHeight-2);
        context.stroke();

        const cc_x = co.x+this.currentRoom!.originCoordinates.x;
        const cc_y = co.y+this.currentRoom!.originCoordinates.y;

        context.strokeStyle = "#0000ff";

        context.beginPath();
        context.moveTo(co.x-1, co.y);
        context.lineTo(cc_x, co.y);
        context.lineTo(cc_x, cc_y);
        context.stroke();
    },

    drawGridNumbers: function ()
    {
        const context = this.canvasContext!;

        context.font = "bold 13px Arial, Helvetica, sans-serif";
        context.textBaseline = "bottom";
        context.textAlign = "center";

        for (let x = 0; x < this.currentRoom!.size.x; x++)
            for (let y = 0; y < this.currentRoom!.size.y; y++)
            {
                context.fillStyle = "#0000ff";
                if (Object.values(this.currentRoom!.doors).find(d => d.x == x && d.y == y))
                    context.fillStyle = "#00cc00";
                if (this.currentRoom!.blocked.find(b => b.x == x && b.y == y))
                    context.fillStyle = "#ff0000";
                if (this.currentRoom!.sit.find(b => b.x == x && b.y == y))
                    context.fillStyle = "yellow";
                const realCoord = calculateRealCoordinates(
                    this.currentRoom!,
                    x,
                    y
                );
                context.fillText(
                    x + "," + y,
                    (realCoord.x + this.blockWidth/2) + this.canvasGlobalOffset.x,
                    (realCoord.y - this.blockHeight/3) + this.canvasGlobalOffset.y
                );
            }
    },

    paint: function (delta: number)
    {
        if (this.isLoadingRoom || !this.backgroundImage)
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
            this.drawBubbles();
            if (this.enableGridNumbers)
            {
                this.drawOriginLines();
                this.drawGridNumbers();
            }
            this.isRedrawRequired = false;
        }

        this.changeRoomIfSteppingOnDoor();
    },

    paintLoop: function (timestamp: number)
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

        const currentUser = this.users[this.myUserID!];

        if (currentUser.isWalking) return;

        const door = Object.values(this.currentRoom!.doors).find(
            (d) =>
                d.x == currentUser.logicalPositionX &&
                d.y == currentUser.logicalPositionY
        );

        if (!door) return;
        if (door.target == null) return;

        const { roomId, doorId } = door.target;

        this.changeRoom(roomId, doorId);
    },
    changeRoom: function (targetRoomId: string, targetDoorId?: string)
    {
        if (this.mediaStream) this.stopStreaming();
        for (let i = 0; i < this.takenStreams.length; i++)
        {
            this.dropStream(i)
            // when going to a new room, all streams must be off by default
            this.takenStreams[i] = false
            this.slotCompression[i] = false

            if (this.audioProcessors[i])
            {
                this.audioProcessors[i].dispose()
                delete this.audioProcessors[i]
            }
        }

        if (window.speechSynthesis)
            speechSynthesis.cancel();
        this.requestedRoomChange = true;
        this.socket!.emit("user-change-room", { targetRoomId, targetDoorId });
    },
    forcePhysicalPositionRefresh: function ()
    {
        for (const u of Object.values(this.users))
            u.moveImmediatelyToPosition(
                this.currentRoom!,
                u.logicalPositionX,
                u.logicalPositionY,
                u.direction
            );
        this.updateCanvasObjects();
        this.isRedrawRequired = true;
    },
    sendNewPositionToServer: function (direction: Direction)
    {
        if (
            this.isLoadingRoom ||
            this.isWaitingForServerResponseOnMovement ||
            (this.users[this.myUserID!] && this.users[this.myUserID!].isWalking)
        )
            return;

        this.isWaitingForServerResponseOnMovement = true;
        this.socket!.emit("user-move", direction);
    },
    sendNewBubblePositionToServer: function (position: Direction)
    {
        this.socket!.emit("user-bubble-position", position);
    },
    sendMessageToServer: function ()
    {
        const inputTextbox = document.getElementById("input-textbox") as HTMLInputElement;

        const message = inputTextbox.value.substr(0, 500);
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
            if (message || this.users[this.myUserID!].message)
                this.socket!.emit("user-msg", message);
        }
        inputTextbox.value = "";
        inputTextbox.focus()
    },
    registerKeybindings: function ()
    {
        // Ping so that if my avatar was transparent, it turns back to normal.
        // Use debounce so that we never send more than one ping every 10 minutes
        const debouncedPing = debounceWithImmediateExecution(() => {
            this.socket!.emit("user-ping");
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

        const pointerEnd = () =>
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
            const observer = new ResizeObserver(() =>
            {
                this.isRedrawRequired = true
                // I thought a delta of 0 would be appropriate that for some reason it doesn't quite work (all avatars
                // snap to their final position instantly while resizing), so for now i'll just use 1. Good luck to anyone
                // who wants to figure out.
                this.paint(1)
            });
            observer.observe(document.getElementById("canvas-container")!);
        }
    },
    toggleInfobox: function ()
    {
        localStorage.setItem(
            "isInfoboxVisible",
            (this.isInfoboxVisible = !this.isInfoboxVisible) ? "true" : "false"
        );
    },
    toggleUsernameBackground: function () {
        localStorage.setItem(
            "showUsernameBackground",
            (this.showUsernameBackground = !this.showUsernameBackground) ? "true" : "false"
        );
        this.isUsernameRedrawRequired = true;
        this.isRedrawRequired = true;
    },
    handleCanvasKeydown: function (event: KeyboardEvent)
    {
        if (event.code == "KeyG" && event.ctrlKey)
        {
            // Stop propagation to avoid triggering the handler on the window object
            // (which would always focus the input-textbox)
            event.stopPropagation()
            event.preventDefault()
            document.getElementById("input-textbox")!.focus()
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
                    this.zoomIn()
                    break;
                case "Minus":
                    this.zoomOut()
                    break;
            }
        }
    },
    setMovementDirection: function(direction: Direction | null)
    {
        this.movementDirection = direction

        // Debounce needed because sometimes this function is called by by the event mousedown, sometimes
        // by touchstart but sometimes both, and in the latter case I don't want to call this.sendNewPositionToServer() twice.
        if (Date.now() - this.lastSetMovementDirectionTime > 200)
        {
            this.lastSetMovementDirectionTime = Date.now()
            if (this.movementDirection)
                this.sendNewPositionToServer(this.movementDirection)
        }
    },
    getPointerState: function (event: MouseEvent | TouchEvent)
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
    handleCanvasPointerDown: function (event: MouseEvent | TouchEvent)
    {
        const state = this.getPointerState(event);
        if (!state) return;

        this.isCanvasPointerDown = true;
        this.canvasDragStartOffset = { x: this.canvasManualOffset.x, y: this.canvasManualOffset.y };
        this.canvasPointerStartState = state;
        this.userCanvasScaleStart = null;

        event.preventDefault();
        const target = event.target as HTMLElement
        target.focus()
    },
    handleCanvasPointerMove: function (event: MouseEvent | TouchEvent)
    {
        if (!this.isCanvasPointerDown) return;

        const state = this.getPointerState(event);
        if (!state) return;

        const dragOffset = {
            x: -(this.canvasPointerStartState!.pos.x - state.pos.x),
            y: -(this.canvasPointerStartState!.pos.y - state.pos.y)
        };

        if (state.dist)
        {
            const distDiff = this.canvasPointerStartState!.dist! - state.dist;

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
            this.canvasManualOffset.x = this.canvasDragStartOffset!.x + dragOffset.x / this.userCanvasScale
            this.canvasManualOffset.y = this.canvasDragStartOffset!.y + dragOffset.y / this.userCanvasScale;
        }

        event.preventDefault();
    },
    handleMessageInputKeydown: function (event: KeyboardEvent)
    {
        if (event.code == "KeyG" && event.ctrlKey)
        {
            // Stop propagation to avoid triggering the handler on the window object
            // (which would always focus the input-textbox)
            event.stopPropagation();
            event.preventDefault();
            document.getElementById("room-canvas")!.focus()
            return
        }
    },
    handleMessageInputKeypress: function (event: KeyboardEvent)
    {
        if (event.key != "Enter"
            || (this.isNewlineOnShiftEnter && event.shiftKey)
            || (!this.isNewlineOnShiftEnter && !event.shiftKey))
            return;

        this.sendMessageToServer();
        event.preventDefault();
        return false;
    },
    zoomIn: function ()
    {
        this.setCanvasScale(this.userCanvasScale + 0.1);
    },
    zoomOut: function ()
    {
        this.setCanvasScale(this.userCanvasScale - 0.1);
    },
    handleCanvasWheel: function (event: WheelEvent)
    {
        if (event.deltaY < 0)
            this.zoomIn()
        else
            this.zoomOut()

        event.preventDefault();
        return false;
    },
    setCanvasScale: function (canvasScale: number)
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

    setupRTCConnection: function (slotId: number): RTCPeer
    {
        const rtcPeer = new RTCPeer((type: string, msg: RTCIceCandidate | string | undefined) =>
        {
            // TODO figure out if keeping this line causes issues.
            // More privacy with candidates not being sent.
            if(type == "candidate") return;
            this.socket!.emit("user-rtc-message", {
                streamSlotId: slotId, type, msg})
        });

        const reconnect = () =>
        {
            if (slotId == this.streamSlotIdInWhichIWantToStream)
            {
                console.log("Attempting to restart stream")
                this.startStreaming()
            }
            else if (this.takenStreams[slotId])
            {
                console.log("Attempting to retake stream")
                this.dropStream(slotId)
                this.takeStream(slotId)
            }
            else
            {
                console.log("Stream connection closed")
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
        rtcPeer.conn!.addEventListener("icecandidateerror", (ev) =>
        {
            console.error("icecandidateerror", ev, ev.errorCode, ev.errorText, ev.address, ev.url, ev.port)
        })

        rtcPeer.conn!.addEventListener("iceconnectionstatechange", (ev) =>
        {
            const state = rtcPeer.conn!.iceConnectionState;
            console.log("RTC Connection state", state)
            logToServer(new Date() + " " + this.myUserID + " RTC Connection state " + state)

            const slot = this.rtcPeerSlots[slotId]

            if (state == "connected")
            {
                if (slot)
                    slot.attempts = 0
            }
            else if (["failed", "disconnected", "closed"].includes(state))
            {
                rtcPeer.close();
                if (!slot) return;
                if (slot.attempts > 4)
                {
                    terminate()
                }
                else
                {
                    setTimeout(reconnect,
                        Math.max(this.takenStreams[slotId] ? 1000 : 0,
                            slot.attempts * 1000));
                }

                slot.attempts++;
            }
        });
        return rtcPeer;
    },

    updateCurrentRoomStreams: function (streams: StreamSlotDto[])
    {
        this.takenStreams = streams.map((s, slotId: number) => {
            return !!this.takenStreams[slotId]
        });

        
        const a = streams.map((s, slotId: number) => {
            if (!this.rtcPeerSlots[slotId])
                return null

            // this.takenStreams[slotId] should be true only if updateCurrentRoomStreams()
            // was called on an event different from a room change.
            if (this.takenStreams[slotId] || this.streamSlotIdInWhichIWantToStream == slotId)
                return this.rtcPeerSlots[slotId]

            this.dropStream(slotId);
            return null
        });

        this.rtcPeerSlots = a

        this.streams = streams;

        this.streamSlotIdInWhichIWantToStream = null;

        for (let slotId = 0; slotId < streams.length; slotId++)
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
                if (!stream.isActive || !stream.isReady)
                    this.dropStream(slotId);
                else
                    this.takeStream(slotId);
            }

            $( "#video-container-" + slotId ).resizable({aspectRatio: true})

            if (this.slotVolume[slotId] === undefined)
                this.slotVolume[slotId] = 1
            if (this.slotCompression[slotId] === undefined)
                this.slotCompression[slotId] = false

            // Sadly it looks like there's no other way to set a default volume for the video,
            // since apparently <video> elements have no "volume" attribute and it must be set via javascript.
            // So, i use nextTick() to execute this piece of code only after the element has been added to the DOM.
            nextTick(() => {
                const receivedVideoElement = document.getElementById("received-video-" + slotId) as HTMLVideoElement
                receivedVideoElement.volume = this.slotVolume[slotId]
            })
        }
    },

    wantToStartStreaming: async function ()
    {
        try
        {
            this.isStreamPopupOpen = false;

            const withVideo = this.streamMode != "sound";
            const withSound = this.streamMode != "video";
            const withScreenCapture = this.streamScreenCapture && withVideo
            const withScreenCaptureAudio = this.streamScreenCaptureAudio && withScreenCapture && withSound

            const audioConstraints = {
                channelCount: 2,
                echoCancellation: this.streamEchoCancellation,
                noiseSuppression: this.streamNoiseSuppression,
                autoGainControl: this.streamAutoGain,
            }

            let userMediaPromise: Promise<MediaStream> | null = null
            if ((withSound && !withScreenCaptureAudio) || !withScreenCapture)
                userMediaPromise = navigator.mediaDevices.getUserMedia(
                    {
                        video: !withVideo || withScreenCapture ? undefined : {
                            width: 320,
                            height: 240,
                            frameRate: {
                                ideal: 24,
                                min: 10,
                            },
                            facingMode: this.streamCameraFacing,
                        },
                        audio: !withSound ? undefined : audioConstraints
                    }
                );

            let screenMediaPromise: Promise<MediaStream> | null = null
            if (withScreenCapture)
                screenMediaPromise = navigator.mediaDevices.getDisplayMedia(
                {
                    video: true,
                    audio: !withScreenCaptureAudio ? undefined : audioConstraints
                });

            // I need to use Promise.allSettled() because the browser needs to be convinced that both getDisplayMedia()
            // and getUserMedia() were initiated by a user action.
            const promiseResults = await Promise.allSettled([userMediaPromise, screenMediaPromise])

            const userMediaResults = promiseResults[0]
            const screenMediaResults = promiseResults[1]

            if (userMediaResults.status == "rejected")
            {
                // Close the devices that were successfully opened
                if (screenMediaResults.status == "fulfilled" && screenMediaResults.value)
                    for (const track of (await screenMediaResults.value).getTracks())
                        track.stop();

                throw userMediaResults.reason
            }

            if (screenMediaResults.status == "rejected")
            {
                // Close the devices that were successfully opened
                if (userMediaResults.status == "fulfilled" && userMediaResults.value)
                    for (const track of (await userMediaResults.value).getTracks())
                        track.stop();

                throw screenMediaResults.reason
            }


            const userMedia = await userMediaResults.value
            const screenMedia = await screenMediaResults.value

            // Populate this.mediaStream
            if (!withScreenCapture)
                this.mediaStream = userMedia!
            else
            {
                this.mediaStream = screenMedia!
                if (withSound && !withScreenCaptureAudio)
                {
                    const audioTrack = userMedia!.getAudioTracks()[0]
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

                // VU Meter
                if (window.AudioContext)
                {
                    const context = new AudioContext();
                    const microphone = context.createMediaStreamSource(this.mediaStream);
                    const analyser = context.createAnalyser()
                    analyser.minDecibels = -60;
                    analyser.maxDecibels = 0;
                    analyser.smoothingTimeConstant = 0.01;
                    analyser.fftSize = 32
                    const bufferLengthAlt = analyser.frequencyBinCount;
                    const dataArrayAlt = new Uint8Array(bufferLengthAlt);
                    microphone.connect(analyser);

                    this.vuMeterTimer = setInterval(() => {
                        try {
                            if (this.streamSlotIdInWhichIWantToStream == null)
                            {
                                clearInterval(this.vuMeterTimer!)
                                return
                            }
                            analyser.getByteFrequencyData(dataArrayAlt)

                            const max = dataArrayAlt.reduce((acc, val) => Math.max(acc, val))
                            const level = max / 255
                            const vuMeterBarPrimary = document.getElementById("vu-meter-bar-primary-" + this.streamSlotIdInWhichIWantToStream)!
                            const vuMeterBarSecondary = document.getElementById("vu-meter-bar-secondary-" + this.streamSlotIdInWhichIWantToStream)!

                            vuMeterBarSecondary.style.width = vuMeterBarPrimary.style.width
                            vuMeterBarPrimary.style.width = level * 100 + "%"
                        }
                        catch (exc)
                        {
                            console.error(exc)
                            clearInterval(this.vuMeterTimer!)
                        }
                    }, 100)
                }
            }

            this.socket!.emit("user-want-to-stream", {
                streamSlotId: this.streamSlotIdInWhichIWantToStream,
                withVideo: withVideo,
                withSound: withSound,
                isPrivateStream: this.streamIsPrivateStream,
                info: this.mediaStream.getAudioTracks().map(t => ({
                        constraints: t.getConstraints && t.getConstraints(),
                        settings: t.getSettings && t.getSettings(),
                        capabilities: t.getCapabilities && t.getCapabilities(),
                    }))
                    .concat(this.mediaStream.getVideoTracks().map(t => ({
                        constraints: t.getConstraints && t.getConstraints(),
                        settings: t.getSettings && t.getSettings(),
                        capabilities: t.getCapabilities && t.getCapabilities(),
                    })))
            });

            

            // On small screens, displaying the <video> element seems to cause a reflow in a way that
            // makes the canvas completely gray, so i force a redraw
            this.isRedrawRequired = true;
        } catch (e)
        {
            console.error(e, e.stack)
            if (e instanceof UserException)
            {
                this.showWarningToast(this.$t("msg." + e.message));
            }
            else
            {
                this.showWarningToast(this.$t("msg.error_obtaining_media"));
            }
            this.wantToStream = false;
            this.mediaStream = null;
            this.streamSlotIdInWhichIWantToStream = null;
        }
    },
    setupRtcPeerSlot: function(slotId: number)
    {
        if (!this.rtcPeerSlots[slotId])
            this.rtcPeerSlots[slotId] = {
                attempts: 0,
                rtcPeer: null,
            }

        this.rtcPeerSlots[slotId]!.rtcPeer = this.setupRTCConnection(slotId)
        return this.rtcPeerSlots[slotId]
    },
    startStreaming: async function ()
    {
        const slotId = this.streamSlotIdInWhichIWantToStream!;
        const rtcPeer = this.setupRtcPeerSlot(slotId)!.rtcPeer!;

        this.takenStreams[slotId] = false;
        this.mediaStream!
            .getTracks()
            .forEach((track) =>
                rtcPeer.conn!.addTrack(track, this.mediaStream!)
            );

        const videoElement = document.getElementById("local-video-" + slotId) as HTMLVideoElement

        console.log("setting srcObject", videoElement, this.mediaStream)
        videoElement.srcObject = this.mediaStream;
    },
    stopStreaming: function ()
    {
        if (this.mediaStream)
            for (const track of this.mediaStream.getTracks())
                track.stop();

        const streamSlotId = this.streamSlotIdInWhichIWantToStream!;

        const localVideoElement = document.getElementById("local-video-" + streamSlotId) as HTMLVideoElement
        localVideoElement.srcObject = this.mediaStream = null;
        if (this.vuMeterTimer)
            clearInterval(this.vuMeterTimer)

        this.streamSlotIdInWhichIWantToStream = null;

        const peerSlot = this.rtcPeerSlots[streamSlotId]
        if (peerSlot)
        {
            peerSlot.rtcPeer!.close()
            this.rtcPeerSlots[streamSlotId] = null;
        }

        this.socket!.emit("user-want-to-stop-stream");

        // On small screens, displaying the <video> element seems to cause a reflow in a way that
        // makes the canvas completely gray, so i force a redraw
        this.isRedrawRequired = true;
    },
    wantToTakeStream: function (streamSlotId: number)
    {
        if (!window.RTCPeerConnection)
        {
            this.showWarningToast(this.$t("msg.no_webrtc"));
            return;
        }

        this.takenStreams[streamSlotId] = true;

        if (streamSlotId in this.streams && this.streams[streamSlotId].isReady)
            this.takeStream(streamSlotId);
    },
    takeStream: function (streamSlotId: number)
    {
        if (this.rtcPeerSlots[streamSlotId]) return // no need to attempt again to take this stream

        const rtcPeer = this.setupRtcPeerSlot(streamSlotId)!.rtcPeer!;

        rtcPeer.conn!.addEventListener(
            "track",
            (event) =>
            {
                try
                {
                    const stream = event.streams[0]

                    const videoElement = document.getElementById("received-video-" + streamSlotId) as HTMLVideoElement
                    
                    videoElement.srcObject = stream;
                    $( "#video-container-" + streamSlotId ).resizable({aspectRatio: true})

                    if (this.audioProcessors[streamSlotId])
                        this.audioProcessors[streamSlotId].dispose()

                    if (this.streams[streamSlotId].withSound)
                    {
                        this.audioProcessors[streamSlotId] = new AudioProcessor(stream, videoElement, this.slotVolume[streamSlotId])

                        if (this.slotCompression[streamSlotId])
                            this.audioProcessors[streamSlotId].enableCompression()
                    }
                }
                catch (exc)
                {
                    console.error(exc)
                }
            },
            { once: true }
        );
        this.socket!.emit("user-want-to-take-stream", streamSlotId);
    },
    dropStream: function (streamSlotId: number)
    {
        if(!this.rtcPeerSlots[streamSlotId]) return;

        this.rtcPeerSlots[streamSlotId]?.rtcPeer?.close()
        this.rtcPeerSlots[streamSlotId] = null;
    },
    wantToDropStream: function (streamSlotId: number)
    {
        this.takenStreams[streamSlotId] = false;
        this.dropStream(streamSlotId);
    },
    rula: function (roomId: string | null)
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
    ignoreUser: function(userId: string)
    {
        this.ignoredUserIds.add(userId)
        this.isRedrawRequired = true
        this.$forceUpdate() // HACK: the v-if for the ignore and unignore buttons doesn't get automatically re-evaluated
    },
    unignoreUser: function(userId: string)
    {
        this.ignoredUserIds.delete(userId)
        this.isRedrawRequired = true
        this.$forceUpdate() // HACK: the v-if for the ignore and unignore buttons doesn't get automatically re-evaluated
    },
    blockUser: function(userId: string)
    {
        if (confirm(this.$t("msg.are_you_sure_you_want_to_block")))
        {
            this.socket!.emit("user-block", userId);
        }
    },
    sortRoomList: function (key: "sortName" | "userCount" | "streamerCount", direction: number)
    {
        if (!direction)
            direction = this.lastRoomListSortDirection == 1 ? -1 : 1

        this.roomList.sort((a, b) =>
        {
            let sort;
            if (key == "sortName")
                sort = a[key].localeCompare(b[key]);
            else
                sort = b[key] - a[key];
            return sort * direction;
        })

        localStorage.setItem("lastRoomListSortKey", this.lastRoomListSortKey = key)
        localStorage.setItem("lastRoomListSortDirection", String(this.lastRoomListSortDirection = direction))
    },
    openStreamPopup: function (streamSlotId: number)
    {
        if (!window.RTCPeerConnection)
        {
            this.showWarningToast(this.$t("msg.no_webrtc"));
            return;
        }

        this.streamSlotIdInWhichIWantToStream = streamSlotId;
        this.wantToStream = true;

        this.isStreamPopupOpen = true;
        this.streamMode = "video_sound";
        this.streamEchoCancellation = false;
        this.streamNoiseSuppression = false;
        this.streamAutoGain = false;
        this.streamScreenCapture = false;
        this.streamScreenCaptureAudio = false;
        this.streamCameraFacing = "user";
    },
    closeStreamPopup: function ()
    {
        if (!this.isStreamPopupOpen)
            return

        this.isStreamPopupOpen = false;
        this.wantToStream = false;
        this.streamSlotIdInWhichIWantToStream = null;
    },
    changeStreamVolume: function (streamSlotId: number)
    {
        const volumeSlider = document.getElementById("volume-" + streamSlotId) as HTMLInputElement;

        this.audioProcessors[streamSlotId].setVolume(Number(volumeSlider.value))

        this.slotVolume[streamSlotId] = volumeSlider.value;
        localStorage.setItem("slotVolume", JSON.stringify(this.slotVolume))
    },
    changeSoundEffectVolume: function (newVolume: number)
    {
        debouncedLogSoundVolume(this.myUserID, newVolume)
        this.soundEffectVolume = newVolume

        this.updateAudioElementsVolume()
        const messageSoundElement = document.getElementById("message-sound") as HTMLAudioElement
        messageSoundElement.play()
        localStorage.setItem(this.areaId + "soundEffectVolume", String(this.soundEffectVolume));
    },
    updateAudioElementsVolume: function ()
    {
        for (const elementId of ["message-sound", "login-sound", "mention-sound"])
        {
            const el = document.getElementById(elementId) as HTMLAudioElement
            el.volume = this.soundEffectVolume
        }
    },
    requestRoomList: function ()
    {
        this.socket!.emit("user-room-list");
    },
    selectRoomForRula: function (roomId: string)
    {
        this.rulaRoomSelection = roomId;
    },
    showPasswordInput: function ()
    {
        this.passwordInputVisible = true;
    },
    handleDarkMode: function ()
    {
        this.isRedrawRequired = true

        const chatLog = document.getElementById("chatLog") as HTMLDivElement

        const lastChild = chatLog.lastChild as HTMLElement

        if(lastChild && window.ResizeObserver)
        {
            const observer = new ResizeObserver((mutationsList, observer) =>
            {
                lastChild.scrollIntoView({ block: "end" })
                observer.unobserve(lastChild);
            });
            observer.observe(lastChild);
        }

        this.storeSet("isDarkMode");
    },
    storeSet: function (itemName: string)
    {
        localStorage.setItem(itemName, (this as any)[itemName]);
    },
    handleBubbleOpacity: function ()
    {
        this.storeSet("bubbleOpacity");
        this.resetBubbleImages();
    },
    logout: function ()
    {
        if (confirm(this.$t("msg.are_you_sure_you_want_to_logout")))
        {
            // TODO stop all streams (both sending and receiving)
            if (this.socket)
                this.socket.close()
            this.loggedIn = false
            this.loggedOut = true
            window.onbeforeunload = null
        }
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

        this.mentionSoundFunction = (msg: string): boolean =>
        {
            if (re_object)
            {
                const res = re_object.test(msg)
                re_object.lastIndex = 0;
                if (res) return true;
            }
            const lmsg = msg.toLowerCase()
            if (this.isNameMentionSoundEnabled && this.users[this.myUserID!])
            {
                const name = this.toDisplayName(this.users[this.myUserID!].name).trim().toLowerCase();
                if (name.split("◆").some((word: string) => lmsg.includes(word))) return true;
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
        speak(this.$t("test"), this.ttsVoiceURI, this.voiceVolume)
        this.storeSet('ttsVoiceURI')
    },
    // I think this getVoices() function isn't called anywhere, might be okay to remove
    getVoices: function () {
        if (!window.speechSynthesis)
            return []
        return speechSynthesis.getVoices()
    },
    changeVoiceVolume: function(newValue: number) {
        this.voiceVolume = newValue
        this.storeSet('voiceVolume')
        debouncedSpeakTest(this.ttsVoiceURI, this.voiceVolume)
    },
    toggleVideoSlotPinStatus: function(slotId: number) {
        const videoContainer = document.getElementById('video-container-' + slotId)!
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
            // videoContainer.style = ""
            videoContainer.style.top = ""
            videoContainer.style.left = ""
        }
    },
    highlightUser: function(userId: string | null, userName: string)
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

        for (const messageElement of document.getElementsByClassName("message") as HTMLCollectionOf<HTMLElement>)
        {
            if (messageElement.dataset.userId == this.highlightedUserId)
                messageElement.classList.add("highlighted-message")
            else
                messageElement.classList.remove("highlighted-message")
        }
    },
    getUserListForListPopup: function ()
    {
        const output = Object.values(this.users)
                              .filter(u => u.id != this.myUserID)
                              .map(u => ({
                                  id: u.id,
                                  name: u.name as string | null,
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
    handleRulaPopupKeydown: function(event: KeyboardEvent)
    {
        const previousIndex = this.roomList.findIndex(r => r.id == this.rulaRoomSelection)

        switch (event.code)
        {
            case "ArrowDown":
            case "KeyJ":
                this.rulaRoomSelection = this.roomList[(previousIndex + 1) % this.roomList.length].id
                document.getElementById("room-tr-" + this.rulaRoomSelection)!.scrollIntoView({ block: "nearest"})
                break;
            case "ArrowUp":
            case "KeyK":
                if (previousIndex <= 0)
                    this.rulaRoomSelection = this.roomList[this.roomList.length - 1].id
                else
                    this.rulaRoomSelection = this.roomList[previousIndex - 1].id
                document.getElementById("room-tr-" + this.rulaRoomSelection)!.scrollIntoView({ block: "nearest"})
                break;
            case "Enter":
                this.rula(this.rulaRoomSelection)
                break;
        }
    },
    handlechatLogKeydown: function(ev: KeyboardEvent) {
        // hitting ctrl+a when the log is focused selects only the text in the log
        if (ev.code == "KeyA" && ev.ctrlKey)
        {
            ev.preventDefault()
            const chatLog = document.getElementById("chatLog") as HTMLElement
            document.getSelection()!.setBaseAndExtent(chatLog, 0, chatLog.nextSibling!, 0);
        }
    },
    toggleDesktopNotifications: function() {
        this.showNotifications = !this.showNotifications
        this.handleShowNotifications()
    },
    onCompressionChanged: function(streamSlotID: number)
    {
        if (this.slotCompression[streamSlotID])
            this.audioProcessors[streamSlotID].enableCompression()
        else
            this.audioProcessors[streamSlotID].disableCompression()
    }
  },
  components: {
    ChessboardSlot,
  },
});

const debouncedSpeakTest = debounceWithDelayedExecution((ttsVoiceURI: string, voiceVolume: number) => {
    if (window.speechSynthesis)
    {
        speechSynthesis.cancel()
        speak(i18n.global.t("test"), ttsVoiceURI, voiceVolume)
    }
}, 150)

const debouncedLogSoundVolume = debounceWithDelayedExecution((myUserID: string, volume: number) => {
    logToServer(myUserID + " SFX volume: " + volume)
}, 150)

</script>

<style lang="scss">
// #app {

// }
</style>
