<script setup lang="ts">
import type { Socket } from 'socket.io-client'
import type { Ref } from 'vue'

import { ref, toRef, watch, inject, computed, onBeforeUnmount } from 'vue'
import { useTranslation } from 'i18next-vue'

import type { Users, JankenStateDto } from '../types'

const { t } = useTranslation()

const hands = [ "rock", "paper", "scissors" ]
const createFallbackUser = (id: string | null) => ({ id, name: "N/A" })

const props = defineProps<{
    jankenState: JankenStateDto
}>()

const socket = inject("socket") as Ref<Socket>
const users = inject("users") as Ref<Users>
const myUserId = inject("myUserId") as Ref<string>

const state = toRef(props, "jankenState")

const isActive = computed(() => state.value.stage == "choosing" || state.value.stage == "phrase" || state.value.stage == "draw")
const isJoinable = ref(!isActive.value) // becomes true 2 seconds after isActive becomes false, to allow the players to see the results
const isStageDraw = computed(() => state.value.stage == "draw")
const isStageResult = computed(() => state.value.stage == "win" || state.value.stage == "draw")

const player1 = ref()
watch(() => state.value.player1Id, () => { player1.value = ((state.value.player1Id && users.value[state.value.player1Id])
    || createFallbackUser(state.value.player1Id)) }, { immediate: true })

const player2 = ref()
watch(() => state.value.player2Id, () => { player2.value = ((state.value.player2Id && users.value[state.value.player2Id])
    || createFallbackUser(state.value.player2Id)) }, { immediate: true })

// this is so that the named player, in cases like quitting, doesn't become N/A when the id is checked in the users list
const namedPlayer = computed(() => player1.value.id == state.value.namedPlayerId ? player1.value
    : (player2.value.id == state.value.namedPlayerId ? player2.value : createFallbackUser(state.value.namedPlayerId)))

const isCurrentUserPlaying = computed(() => (isActive.value || state.value.stage == "joining") &&
    (state.value.player1Id == myUserId.value || state.value.player2Id == myUserId.value))

const isVisible = ref(false)
const display = () => isVisible.value = true
const hide = () => isVisible.value = false
watch(isCurrentUserPlaying, () => { if (isCurrentUserPlaying.value) isVisible.value = true })

const waitForStateChange = ref(false)
const join = () =>
{
    waitForStateChange.value = true
    socket.value.emit("user-want-to-join-janken")
}
const quit = () =>
{
    waitForStateChange.value = true
    socket.value.emit("user-want-to-quit-janken")
}
watch(state, () => { waitForStateChange.value = false })
onBeforeUnmount(quit)

const waitForResult = ref(false)
const isWaitingForOpponent = ref(false)
let waitingForOpponentTimer: number | null = null
const chooseHand = (handKey: string) =>
{
    waitForResult.value = true
    socket.value.emit("user-want-to-choose-janken-hand", handKey)
    
    // to avoid the flashing message of waiting for the other
    // opponent if you're the last to pick
    waitingForOpponentTimer = window.setTimeout(
        () => { isWaitingForOpponent.value = true }, 500)
}

watch(isStageResult, () =>
{
    if (!isStageResult.value) return
    waitForResult.value = false
    if (waitingForOpponentTimer)
        window.clearTimeout(waitingForOpponentTimer)
    isWaitingForOpponent.value = false
})

const drawCount = ref(0)
watch(isStageDraw, () => drawCount.value++)
let joinableTimer: number | null = null
watch(isActive, () =>
{
    if (isActive.value)
    {
        waitForResult.value = false
        if (joinableTimer)
            window.clearTimeout(joinableTimer)
        isJoinable.value = false
    }
    else
    {
        drawCount.value = 0
        joinableTimer = window.setTimeout(() => isJoinable.value = true, 2000)
    }
})
</script>

<template>
    <div class="slot-wrapper janken-wrapper">
        <div class="slot-title">{{ t("ui.janken_title") }}</div>
        <div class="slot-buttons">
            <button @click="display" v-if="!isVisible && !isCurrentUserPlaying"
                :class="{'slot-button-highlight': (player1.id && state.stage == 'joining') || isActive}">{{ t("ui.game_display") }}</button>
            <button @click="hide" v-if="isVisible && !isCurrentUserPlaying">{{ t("ui.game_hide") }}</button>
            <button @click="join" v-if="!isCurrentUserPlaying && !waitForStateChange && isJoinable">{{ t("ui.game_join") }}</button>
            <button @click="quit" v-if="isCurrentUserPlaying && !waitForStateChange && (state.stage == 'joining' || state.stage == 'choosing')">{{ t("ui.game_quit") }}</button>
        </div>
        <div v-if="isVisible">
            <div v-if="player1.id && player2.id" class="slot-message janken-versus">
                <div class="janken-versus-player1"><username-label :user-id="player1.id" :user-name="player1.name"></username-label></div>
                <div>{{ t("ui.janken_versus") }}</div>
                <div class="janken-versus-player2"><username-label :user-id="player2.id" :user-name="player2.name"></username-label></div>
            </div>
            <div v-if="state.stage == 'win' || state.stage == 'draw'"
                class="janken-hand-results" :class="{ 'janken-hands-draw': state.stage == 'draw' }">
                <div class="janken-results-hand janken-hand-player1" :class="[{ 'janken-hand-winner': player1.id == namedPlayer.id }, 'janken-hand-' + state.player1Hand]"></div>
                <div class="janken-results-hand janken-hand-player2" :class="[{ 'janken-hand-winner': player2.id == namedPlayer.id }, 'janken-hand-' + state.player2Hand]"></div>
            </div>
            <div class="slot-message">
                <template v-if="state.stage == 'joining'">
                    <span v-if="!player1.id">{{ t("ui.janken_start_a_game") }}</span>
                    <span v-else-if="!player2.id">
                        <i18next :translation="$t('ui.janken_waiting_for_opponent')">
                            <template #username><username-label :user-id="player1.id" :user-name="player1.name"></username-label></template>
                        </i18next>
                    </span>
                </template>
                
                <template v-else-if="state.stage == 'choosing'">
                    <template v-if="isCurrentUserPlaying">
                        <span v-if="!waitForResult">{{ t("ui.janken_choose_your_hand") }}</span>
                        <span v-else-if="isWaitingForOpponent">{{ t("ui.janken_waiting_for_player") }}</span>
                    </template>
                    <template v-else>
                        <span>{{ t("ui.janken_players_choosing") }}</span>
                    </template>
                </template>
                
                <template v-else-if="state.stage == 'phrase'">
                    <span v-if="drawCount == 0">{{ t("ui.janken_phrase") }}</span>
                    <span v-else-if="drawCount < 4">{{ t("ui.janken_phrase_after_draw") }}</span>
                    <span v-else>{{ t("ui.janken_phrase_after_draw_repeated") }}</span>
                </template>
                
                <span v-else-if="state.stage == 'win'">
                    <i18next :translation="$t('ui.janken_win')">
                        <template #username><username-label :user-id="namedPlayer.id" :user-name="namedPlayer.name"></username-label></template>
                    </i18next>
                </span>
                
                <template v-else-if="state.stage == 'quit'">
                    <span>
                        <i18next :translation="$t('ui.janken_quit')">
                            <template #username><username-label :user-id="namedPlayer.id" :user-name="namedPlayer.name"></username-label></template>
                        </i18next>
                    </span>
                </template>
            
                <template v-else-if="state.stage == 'timeout'">
                    <span>{{ t("ui.janken_timeout_reached") }}</span>
                </template>
            </div>
            <div v-if="isCurrentUserPlaying && state.stage == 'choosing' && !waitForResult" class="janken-hands">
                <button
                    v-for="hand in hands"
                    v-bind:key="hand"
                    @click="chooseHand(hand)"
                    :class="['janken-hand-' + hand]"></button>
            </div>
        </div>
    </div>
</template>
