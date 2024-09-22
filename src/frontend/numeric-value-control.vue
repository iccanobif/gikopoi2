<!-- When using ev.preventDefault(), On PC the buttons raise the mousedown and mouseup events,
 while on mobile they raise the touchstart and touchend events  -->

<!-- It's still not working on android. why? -->


<script setup lang="ts">
import { ref } from 'vue'
import { defineEmits, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    minValue: {
        type: Number,
        default: Number.MIN_VALUE
    },
    maxValue: {
        type: Number,
        default: Number.MAX_VALUE
    }
})

const count = ref(0)
const emit = defineEmits(['value-changed'])

const emitValueChanged = () => {
    emit('value-changed', count.value)
}
const increment = () => {
    count.value++
    emitValueChanged()
}
const decrement = () => {
    count.value > 0 && count.value--
    emitValueChanged()
}
const reset = () => {
    count.value = 0
    emitValueChanged()
}

const intervalMilliseconds = 200

let interval: NodeJS.Timer | null = null

const startIncrement = (event: Event) => {
    event.preventDefault();
    if (interval) return
    increment()
    interval = setInterval(increment, intervalMilliseconds)
}
const stopIncrement = (event: Event) => {
    event.preventDefault();
    if (interval) {
        clearInterval(interval)
        interval = null
    }
}

const startDecrement = (event: Event) => {
    event.preventDefault();
    if (interval) return
    decrement()
    interval = setInterval(decrement, intervalMilliseconds)
}

const stopDecrement = (event: Event) => {
    event.preventDefault();
    if (interval) {
        clearInterval(interval)
        interval = null
    }
}

const handleKeyDown = (event: KeyboardEvent, type: "increment" | "decrement") => {
    event.preventDefault();
    if (event.key === 'Enter' || event.key === ' ')
        type === 'increment' ? startIncrement(event) : startDecrement(event)
}

const handleKeyUp = (event: KeyboardEvent, type: "increment" | "decrement") => {
    event.preventDefault();
    type === 'increment' ? stopIncrement(event) : stopDecrement(event)
}

// TODO: handle touch events (touchstart, touchend, touchcancel)

onMounted(() => {
    window.addEventListener('mouseup', stopIncrement)
    window.addEventListener('mouseup', stopDecrement)
    window.addEventListener('keyup', stopDecrement)
    window.addEventListener('keyup', stopIncrement)
    window.addEventListener('touchend', stopIncrement)
    window.addEventListener('touchend', stopDecrement)
})

onBeforeUnmount(() => {
    window.removeEventListener('mouseup', stopIncrement)
    window.removeEventListener('mouseup', stopDecrement)
    window.removeEventListener('keyup', stopDecrement)
    window.removeEventListener('keyup', stopIncrement)
    window.removeEventListener('keyup', stopDecrement)
    window.removeEventListener('keyup', stopIncrement)
})
</script>

<template>
    <div class="numeric-value-control">
        <button
            @mousedown="event => startDecrement(event)"
            @mouseup="event => stopDecrement(event)"
            @keydown="event => handleKeyDown(event, 'decrement')"
            @keyup="event => handleKeyUp(event, 'decrement')"
            @touchstart="event => startDecrement(event)"
            @touchend="event => stopDecrement(event)"
            :class="{ disabled: count === 0, decrement: true }"></button>
        <button
            @mousedown="event => startIncrement(event)"
            @mouseup="event => stopIncrement(event)"
            @keydown="event => handleKeyDown(event, 'increment')"
            @keyup="event => handleKeyUp(event, 'increment')"
            @touchstart="event => startIncrement(event)"
            @touchend="event => stopIncrement(event)"
            class="increment"></button>
        <button @click="reset">{{ count }}</button>
    </div>
</template>