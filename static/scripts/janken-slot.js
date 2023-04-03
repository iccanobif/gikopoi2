const { ref, toRef, watch } = Vue

const hands = [ "rock", "paper", "scissors" ]

export default {
    props: ["socket", "jankenState", "users", "myUserId"],
    template: "#janken-slot",
    setup(props)
    {
        const users = toRef(props, "users")
        
        const isVisible = ref(false)
        const isActive = ref(false)
        const state = toRef(props, "jankenState")
        const namedPlayer = ref(null)
        const player1 = ref(null)
        const player2 = ref(null)
        const isCurrentUserPlaying = ref(false)
        const showResults = ref(false)
        const isWaitingForOpponent = ref(false)
        const hasRequestedToJoin = ref(false)
        const hasRequestedToQuit = ref(false)
        const hasChosenHand = ref(false)
        const drawCount = ref(0)
        
        const display = () => isVisible.value = true
        const hide = () => isVisible.value = false
        
        const join = () =>
        {
            hasRequestedToJoin.value = true
            hasRequestedToQuit.value = false
            props.socket.emit("user-want-to-join-janken")
        }
        const quit = () =>
        {
            hasRequestedToQuit.value = true
            props.socket.emit("user-want-to-quit-janken")
        }
        
        const chooseHand = (handKey) =>
        {
            hasChosenHand.value = true
            props.socket.emit("user-want-to-choose-janken-hand", handKey)
            setTimeout(() =>
            {
                // to avoid the flashing message of waiting for the other
                // opponent if you're the last to pick
                isWaitingForOpponent.value = true
            }, 500)
        }
        
        const capitalizeText = (str) => str.charAt(0).toUpperCase() + str.slice(1)
        
        const prepareGame = () =>
        {
            hasChosenHand.value = false
            isWaitingForOpponent.value = false
            
            isActive.value = true
            showResults.value = false
        }
        
        const resetGame = () =>
        {
            isActive.value = false
            drawCount.value = 0
            if (isCurrentUserPlaying.value)
            {
                isVisible.value = true
                isCurrentUserPlaying.value = false
            }
            hasRequestedToQuit.value = false
        }
        
        const processState = () =>
        {
            player1.value = users.value[state.value.player1Id] || null
            player2.value = users.value[state.value.player2Id] || null
            namedPlayer.value = users.value[state.value.namedPlayerId] || null
            
            isCurrentUserPlaying.value =
                state.value.player1Id == props.myUserId
                || state.value.player2Id == props.myUserId
            
            if (isCurrentUserPlaying.value)
                isVisible.value = true
            
            if (state.value.stage == "choosing")
            {
                prepareGame()
            }
            else if (state.value.stage == "win")
            {
                setTimeout(() => {
                    showResults.value = true
                    setTimeout(resetGame, 2000)
                }, 2000)
            }
            else if (state.value.stage == "draw")
            {
                drawCount.value++
                setTimeout(() =>
                {
                    showResults.value = true
                    setTimeout(() =>
                    {
                        state.value.stage = "choosing"
                        prepareGame()
                    }, 2000)
                }, 2000)
            }
            else if (state.value.stage == "quit"
                || state.value.stage == "timeout")
            {
                setTimeout(resetGame, 2000)
            }
            
            hasRequestedToJoin.value = false
        }
        
        watch(state, processState)
        processState()
        
        return {
            hands,
            myUserId: props.myUserId,
            
            isVisible,
            isActive,
            state,
            namedPlayer,
            player1,
            player2,
            isCurrentUserPlaying,
            showResults,
            isWaitingForOpponent,
            hasRequestedToJoin,
            hasRequestedToQuit,
            hasChosenHand,
            drawCount,
            
            display,
            hide,
            
            join,
            quit,
            
            chooseHand,
            
            capitalizeText,
        }
    },
    beforeUnmount()
    {
        this.quit()
    }
}
