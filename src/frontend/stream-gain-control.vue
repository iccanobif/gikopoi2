<script setup lang="ts">
import { ref } from 'vue'
import { defineEmits, onMounted, onBeforeUnmount } from 'vue'

const count = ref(0)
const emit = defineEmits(['gain-changed'])

const emitGainChanged = () => {
    emit('gain-changed', count.value)
}
const increment = () => {
    count.value++
    emitGainChanged()
}
const decrement = () => {
    count.value > 0 && count.value--
    emitGainChanged()
}
const reset = () => {
    count.value = 0
    emitGainChanged()
}

const intervalMilliseconds = 200

let interval: NodeJS.Timer | null = null

const startIncrement = () => {
    if (interval) return
    increment()
    interval = setInterval(increment, intervalMilliseconds)
}
const stopIncrement = () => {
    if (interval) {
        clearInterval(interval)
        interval = null
    }
}

const startDecrement = () => {
    if (interval) return
    decrement()
    interval = setInterval(decrement, intervalMilliseconds)
}

const stopDecrement = () => {
    if (interval) {
        clearInterval(interval)
        interval = null
    }
}

const handleKeyDown = (event: KeyboardEvent, type: "increment" | "decrement") => {
    if (event.key === 'Enter' || event.key === ' ')
        type === 'increment' ? startIncrement() : startDecrement()
}

const handleKeyUp = (type: "increment" | "decrement") => {
    type === 'increment' ? stopIncrement() : stopDecrement()
}

onMounted(() => {
    window.addEventListener('mouseup', stopIncrement)
    window.addEventListener('mouseup', stopDecrement)
    window.addEventListener('keyup', stopDecrement)
    window.addEventListener('keyup', stopIncrement)
})

onBeforeUnmount(() => {
    window.removeEventListener('mouseup', stopIncrement)
    window.removeEventListener('mouseup', stopDecrement)
    window.removeEventListener('keyup', stopDecrement)
    window.removeEventListener('keyup', stopIncrement)
})
</script>

<template>
    <div class="stream-gain-control">
        <button
            @mousedown="startDecrement"
            @mouseup="stopDecrement"
            @keydown="event => handleKeyDown(event, 'decrement')"
            @keyup="() => handleKeyUp('decrement')"
            :class="{ disabled: count === 0, decrement: true }"></button>
        <button
            @mousedown="startIncrement"
            @mouseup="stopIncrement"
            @keydown="event => handleKeyDown(event, 'increment')"
            @keyup="() => handleKeyUp('increment')"
            class="increment"></button>
        <button @click="reset">{{ count }}</button>
    </div>
</template>