const { ref, toRef, watch, inject, computed } = Vue

const hands = [ "rock", "paper", "scissors" ]
const createFallbackUser = (id) => ({ id, name: "N/A" })

export default {
    props: ["jankenState"],
    template: "#janken-slot",
    setup(props)
    {
        const socket = inject("socket")
        const users = inject("users")
        const myUserId = inject("myUserId")
        
        const state = toRef(props, "jankenState")
        
        const isActive = computed(() => state.value.stage == "choosing" || state.value.stage == "phrase" || state.value.stage == "draw")
        const isJoinable = ref(!isActive.value) // becomes true 2 seconds after isActive becomes false, to allow the players to see the results
        const isStageJoining = computed(() => state.value.stage == "joining")
        const isStageChoosing = computed(() => state.value.stage == "choosing")
        const isStageDraw = computed(() => state.value.stage == "draw")
        const isStageResult = computed(() => state.value.stage == "win" || state.value.stage == "draw")
        
        const player1 = ref()
        const setPlayer1 = () => { player1.value = (users.value[state.value.player1Id]
            || createFallbackUser(state.value.player1Id)) }
        watch(() => state.value.player1Id, setPlayer1, { immediate: true })
        
        const player2 = ref()
        const setPlayer2 = () => { player2.value = (users.value[state.value.player2Id]
            || createFallbackUser(state.value.player2Id)) }
        watch(() => state.value.player2Id, setPlayer2, { immediate: true })
        
        const namedPlayer = computed(() => player1.value.id == state.value.namedPlayerId ? player1.value
            : (player2.value.id == state.value.namedPlayerId ? player2.value : createFallbackUser(state.value.namedPlayerId)))
        
        const isCurrentUserPlaying = computed(() => (isActive.value || state.value.stage == "joining") &&
            (state.value.player1Id == myUserId.value || state.value.player2Id == myUserId.value))
        
        const isVisible = ref(false)
        const display = () => isVisible.value = true
        const hide = () => isVisible.value = false
        watch(isCurrentUserPlaying, () => { if (isCurrentUserPlaying.value) isVisible.value = true })
        
        const waitForChoosing = ref(false)
        const join = () =>
        {
            waitForChoosing.value = true
            socket.value.emit("user-want-to-join-janken")
        }
        watch(isStageChoosing, () => { if (isStageChoosing.value) waitForChoosing.value = false })
        
        const waitForJoining = ref(false)
        const quit = () =>
        {
            waitForJoining.value = true
            socket.value.emit("user-want-to-quit-janken")
        }
        watch(isStageJoining, () => { if (isStageJoining.value) waitForJoining.value = false })
        
        const waitForResult = ref(false)
        const isWaitingForOpponent = ref(false)
        let waitingForOpponentTimer = null
        const chooseHand = (handKey) =>
        {
            waitForResult.value = true
            socket.value.emit("user-want-to-choose-janken-hand", handKey)
            
            // to avoid the flashing message of waiting for the other
            // opponent if you're the last to pick
            waitingForOpponentTimer = setTimeout(
                () => { isWaitingForOpponent.value = true }, 500)
        }
        
        watch(isStageResult, () =>
        {
            if (!isStageResult.value) return
            
            waitForResult.value = false
            clearTimeout(waitingForOpponentTimer)
            isWaitingForOpponent.value = false
        })
        
        const drawCount = ref(0)
        watch(isStageDraw, () => drawCount.value++)
        let joinableTimer = null
        watch(isActive, () =>
        {
            if (isActive.value)
            {
                clearTimeout(joinableTimer)
                isJoinable.value = false
            }
            else
            {
                drawCount.value = 0
                joinableTimer = setTimeout(() => isJoinable.value = true, 2000)
            }
        })
        
        return {
            hands,
            
            isVisible,
            isActive,
            isJoinable,
            state,
            namedPlayer,
            player1,
            player2,
            isCurrentUserPlaying,
            isWaitingForOpponent,
            waitForChoosing,
            waitForJoining,
            waitForResult,
            drawCount,
            
            display,
            hide,
            
            join,
            quit,
            
            chooseHand,
        }
    },
    beforeUnmount()
    {
        this.quit()
    }
}
