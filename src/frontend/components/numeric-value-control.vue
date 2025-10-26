<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    // initialValue is the value that will be set when the component is created
    initialValue: {
        type: Number,
        default: 0
    },
    // default is the value that will be set when the reset button is clicked
    default: {
        type: Number,
        default: 0
    },
})

const count = ref(props.initialValue)
const emit = defineEmits(['value-changed'])

const emitValueChanged = () => {
    console.log('emitValueChanged', count.value)
    emit('value-changed', count.value)
}
const increment = () => {
    if (count.value < props.max) {
        count.value++
        emitValueChanged()
    }
}

const decrement = () => {
    if (count.value > props.min) {
        count.value--
        emitValueChanged()
    }
}
const reset = () => {
    count.value = props.default
    emitValueChanged()
}
</script>

<template>
    <div class="numeric-value-control">
        <button
            @click="decrement"
            :class="{ disabled: count === props.min, decrement: true }"></button>
        <button
            @click="increment"
            :class="{ disabled: count === props.max, increment: true }"></button>
        <button
            class="value"
            @click="reset">{{ count }}</button>
    </div>
</template>