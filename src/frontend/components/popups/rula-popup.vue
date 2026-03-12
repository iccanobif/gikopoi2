<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="emit('close')"></div>
    <div
        id="rula-popup"
        class="popup"
        v-if="isOpen"
        v-on:keydown="emit('keydown', $event)"
        tabindex="-1">
        <div class="popup-titlebar">
            <div class="popup-title">{{ $t("ui.rula_menu_title") }}</div>
            <div class="popup-titlebar-item">
                <label for="rula-room-group">{{ $t("ui.rula_menu_label_group") }} </label>
                <select id="rula-room-group" :value="roomGroup" v-on:change="onRoomGroupChange">
                    <option value="all">{{ $t("ui.rula_menu_group_option_all") }}</option>
                    <option value="gikopoipoi">{{ $t("area.gikopoipoi") }}</option>
                    <option value="gikopoi">{{ $t("area.gikopoi") }}</option>
                    <option value="bar_giko">{{ $t("area.bar_giko") }}</option>
                </select>
            </div>
        </div>
        <div class="popup-content">
            <table class="popup-table popup-selectable-table popup-sortable-table">
                <colgroup>
                    <col id="rula-menu-column-room-name" />
                    <col id="rula-menu-column-user-count" />
                    <col id="rula-menu-column-streamers" />
                </colgroup>
                <thead>
                    <tr>
                        <th v-on:click="emit('set-sort-key', 'sortName')">
                            {{ $t("ui.rula_menu_column_room_name") }}
                        </th>
                        <th v-on:click="emit('set-sort-key', 'userCount')">
                            {{ $t("ui.rula_menu_column_user_count") }}
                        </th>
                        <th v-on:click="emit('set-sort-key', 'streamerCount')">
                            {{ $t("ui.rula_menu_column_streamers") }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="room in rooms"
                        :key="room.id"
                        :id="'room-tr-' + room.id"
                        v-bind:class="{'popup-row-is-selected': selectedRoomId == room.id}"
                        v-on:click="emit('select-room', room.id)"
                        v-on:dblclick="emit('rula', room.id)">
                        <td>{{ $t("room." + room.id) }}</td>
                        <td>{{ room.userCount }}</td>
                        <td>
                            <span v-for="(stream, index) in room.streams" :key="stream.userName + '-' + index">
                                <span v-if="index !== 0">/</span>
                                {{ stream.userName }}
                                <span
                                    v-bind:title="$t('ui.visible_only_to_specific_users_stream')"
                                    v-if="stream.isVisibleOnlyToSpecificUsers"
                                    class="fas fa-lock visible-only-to-specific-users-stream-icon"></span>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="popup-buttons">
            <button v-on:click="emit('rula', selectedRoomId)">{{ $t("ui.rula_menu_button_rula") }}</button><button
                v-on:click="emit('close')">{{ $t("ui.popup_button_cancel") }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ListedRoom, RulaRoomListSortKey } from '../../types'

const props = defineProps<{
    isOpen: boolean,
    rooms: ListedRoom[],
    roomGroup: string,
    selectedRoomId: string | null,
}>()

const emit = defineEmits<{
    close: [],
    keydown: [event: KeyboardEvent],
    roomGroupChange: [value: string],
    prepareRoomList: [],
    setSortKey: [sortKey: RulaRoomListSortKey],
    selectRoom: [roomId: string],
    rula: [roomId: string | null],
}>()

function onRoomGroupChange(event: Event)
{
    const target = event.target as HTMLSelectElement
    emit('roomGroupChange', target.value)
    emit('prepareRoomList')
}
</script>

<style scoped>
</style>