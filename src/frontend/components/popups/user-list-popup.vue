<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="emit('close')"></div>
    <div id="user-list-popup" class="popup" v-if="isOpen">
        <div class="popup-titlebar">
            <div class="popup-title">{{ $t("ui.user_list_popup_title", {userCount: users.length}) }}</div>
        </div>
        <div class="popup-item">{{ $t("ui.user_list_popup_blurb") }}</div>
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
                    <tr
                        :id="'user-list-element-' + u.id"
                        v-for="u in users"
                        :key="u.id"
                        v-bind:class="{'popup-row-is-selected': u.id == highlightedUserId}">
                        <td>
                            <div v-on:click="u.isInRoom && emit('highlight-user', u.id, u.name || '')">
                                <span
                                    v-bind:title="$t('ui.user_not_in_room')"
                                    class="user-not-in-room-warning fas fa-exclamation-triangle"
                                    v-if="!u.isInRoom"></span>
                                <img
                                    v-bind:title="$t('ui.user_inactive')"
                                    v-if="u.isInactive"
                                    class="inactive-user-icon"
                                    src="/zzz-sleep-symbol.svg"></img>
                                <img
                                    v-if="isStreaming && streamTarget == 'specific_users' && allowedListenerIds.has(u.id)"
                                    class="enabled-disabled-listener-icon"
                                    src="/enabled-listener.svg"></img>
                                <img
                                    v-if="isStreaming && streamTarget == 'specific_users' && !allowedListenerIds.has(u.id)"
                                    class="enabled-disabled-listener-icon"
                                    src="/disabled-listener.svg"></img>
                                {{ u.name }}
                            </div>
                            <button
                                v-if="isStreaming && streamTarget == 'specific_users' && !allowedListenerIds.has(u.id)"
                                v-on:click="emit('give-stream', u.id)">{{ $t("ui.user_list_popup_give_stream") }}</button>
                            <button
                                v-if="isStreaming && streamTarget == 'specific_users' && allowedListenerIds.has(u.id)"
                                v-on:click="emit('revoke-stream', u.id)">{{ $t("ui.user_list_popup_revoke_stream") }}</button>

                            <button v-if="ignoredUserIds.has(u.id)" v-on:click="emit('unignore-user', u.id)">{{ $t("ui.user_list_popup_unignore") }}</button>
                            <button v-if="!ignoredUserIds.has(u.id)" v-on:click="emit('ignore-user', u.id)">{{ $t("ui.user_list_popup_ignore") }}</button>

                            <button v-on:click="emit('block-user', u.id)">{{ $t("ui.user_list_popup_block") }}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="popup-buttons">
            <button v-on:click="emit('close')">{{ $t("ui.user_list_popup_close") }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PopupUserList } from '../../types'

defineProps<{
    isOpen: boolean,
    users: PopupUserList[],
    highlightedUserId: string | null,
    isStreaming: boolean,
    streamTarget: 'all_room' | 'specific_users',
    allowedListenerIds: Set<string>,
    ignoredUserIds: Set<string>,
}>()

const emit = defineEmits<{
    close: [],
    highlightUser: [userId: string, userName: string],
    giveStream: [userId: string],
    revokeStream: [userId: string],
    ignoreUser: [userId: string],
    unignoreUser: [userId: string],
    blockUser: [userId: string],
}>()
</script>

<style scoped>
</style>