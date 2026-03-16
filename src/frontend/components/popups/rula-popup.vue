<template>
    <div class="popup-overlay" v-if="isOpen" v-on:click="emit('close')"></div>
    <div
        id="rula-popup"
        ref="popupElement"
        class="popup"
        v-if="isOpen"
        v-on:keydown="handleKeydown"
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
                        <th v-on:click="setSortKey('sortName')">
                            {{ $t("ui.rula_menu_column_room_name") }}
                        </th>
                        <th v-on:click="setSortKey('userCount')">
                            {{ $t("ui.rula_menu_column_user_count") }}
                        </th>
                        <th v-on:click="setSortKey('streamerCount')">
                            {{ $t("ui.rula_menu_column_streamers") }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="room in preparedRoomList"
                        :key="room.id"
                        :id="'room-tr-' + room.id"
                        v-bind:class="{'popup-row-is-selected': selectedRoomId == room.id}"
                        v-on:click="selectedRoomId = room.id"
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
import { nextTick, ref, watch } from 'vue'
import i18next from 'i18next'
import type { GikopoipoiPreferences, ListedRoom, RulaRoomListSortKey } from '../../types'
import { setAndPersist } from '../../preferences';

const props = defineProps<{
    isOpen: boolean,
    preferences: GikopoipoiPreferences,
}>()

const emit = defineEmits<{
    close: [],
    rula: [roomId: string | null],
}>()

const popupElement = ref<HTMLElement | null>(null)
const roomList = ref<ListedRoom[]>([])
const preparedRoomList = ref<ListedRoom[]>([])
const roomGroup = ref('all')
const selectedRoomId = ref<string | null>(null)

function normalizeRoomList(rooms: ListedRoom[]): ListedRoom[]
{
    return rooms.map(r => ({
        ...r,
        sortName: i18next.t('room.' + r.id, { context: 'sort_key' }) || '',
        streams: r.streams.map(s => ({
            ...s,
            userName: s.userName === '' ? (i18next.t('default_user_name') || '') : s.userName,
        })),
    }))
}

function prepareRoomList()
{
    const key = props.preferences.rulaRoomListSortKey
    const direction = props.preferences.rulaRoomListSortDirection

    const list = roomGroup.value === 'all'
        ? [...roomList.value]
        : roomList.value.filter(r => r.group === roomGroup.value)

    list.sort((a, b) => {
        let sort = 0
        if (key === 'streamerCount')
            sort = b.streams.length - a.streams.length
        if (key === 'userCount' || (key === 'streamerCount' && sort === 0))
            sort = b.userCount - a.userCount
        if (sort === 0 && a.sortName && b.sortName)
            sort = a.sortName.localeCompare(b.sortName, i18next.language)
        return sort * direction
    })

    preparedRoomList.value = list
}

function setRooms(rooms: ListedRoom[], currentRoomId: string | null)
{
    roomList.value = normalizeRoomList(rooms)
    roomGroup.value = 'all'
    selectedRoomId.value = currentRoomId
    prepareRoomList()
}

function setSortKey(key: RulaRoomListSortKey)
{
    const nextDirection = props.preferences.rulaRoomListSortKey !== key
        ? 1
        : (props.preferences.rulaRoomListSortDirection * -1) as 1 | -1

    setAndPersist(props.preferences, "rulaRoomListSortKey", key)
    setAndPersist(props.preferences, "rulaRoomListSortDirection", nextDirection)
}

function onRoomGroupChange(event: Event)
{
    const target = event.target as HTMLSelectElement
    roomGroup.value = target.value
    prepareRoomList()
}

function handleKeydown(event: KeyboardEvent)
{
    if (!preparedRoomList.value.length)
        return

    const previousIndex = preparedRoomList.value.findIndex(r => r.id === selectedRoomId.value)

    switch (event.code)
    {
        case 'ArrowDown':
        case 'KeyJ':
        case 'KeyS':
            selectedRoomId.value = preparedRoomList.value[(previousIndex + 1) % preparedRoomList.value.length].id
            break
        case 'ArrowUp':
        case 'KeyK':
        case 'KeyW':
            if (previousIndex <= 0)
                selectedRoomId.value = preparedRoomList.value[preparedRoomList.value.length - 1].id
            else
                selectedRoomId.value = preparedRoomList.value[previousIndex - 1].id
            break
        case 'Enter':
            emit('rula', selectedRoomId.value)
            return
        default:
            return
    }

    if (!selectedRoomId.value)
        return

    document.getElementById('room-tr-' + selectedRoomId.value)?.scrollIntoView({ block: 'nearest' })
}

watch(
    () => props.preferences.rulaRoomListSortKey,
    () => prepareRoomList()
)

watch(
    () => props.preferences.rulaRoomListSortDirection,
    () => prepareRoomList()
)

watch(
    () => props.isOpen,
    async (isOpen) => {
        if (!isOpen)
        {
            selectedRoomId.value = null
            return
        }

        await nextTick()
        popupElement.value?.focus()
    }
)

defineExpose({
    setRooms,
})
</script>

<style scoped>
</style>