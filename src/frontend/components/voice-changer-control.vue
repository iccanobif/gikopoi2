<script setup lang="ts">
import { inject, Ref } from 'vue';
import { AudioProcessor } from '../utils';
import NumericValueControl from './numeric-value-control.vue'

const outboundAudioProcessor = inject('outboundAudioProcessor') as Ref<AudioProcessor>

// This component might be destroyed and recreated multiple times, so we need to
// get the current pitch factor from the audio processor.
// Also the audio processor might not be ready yet, so we need to use a default value.
const initialPitchFactor = outboundAudioProcessor.value?.getPitchFactor() ?? 1
const initialValue = Math.round((initialPitchFactor - 1) * 200)

function onPitchShiftChanged(value: number) {
    console.log('onPitchShiftChanged', value, outboundAudioProcessor.value)
    // convert value (-100~100) to pitch factor (0.5~1.5)
    const pitchFactor = 0.5 + (value + 100) / 200
    outboundAudioProcessor.value?.setPitchFactor(pitchFactor)
}

</script>

<template>
    <numeric-value-control :min="-100" :max="200" :default="0" :initialValue="initialValue"
        @value-changed="value => onPitchShiftChanged(value)"></numeric-value-control>
</template>