<script setup lang="ts">
import { ref } from 'vue'
import { defineEmits } from 'vue'

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
    emitGainChanged();
}
const reset = () => {
    count.value = 0
    emitGainChanged()
}

</script>
<template>
    <div class="stream-gain-control">
        <button @click="decrement" :class="{ disabled: count === 0, decrement: true }"></button>
        <button @click="increment" class="increment"></button>
        <button @click="reset">{{ count }}</button>
    </div>
</template>