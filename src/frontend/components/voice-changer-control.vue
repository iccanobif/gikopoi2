<script setup lang="ts">
import { inject, Ref } from 'vue';
import { AudioProcessor } from '../utils';
import NumericValueControl from './numeric-value-control.vue';

const outboundAudioProcessor = inject('outboundAudioProcessor') as Ref<AudioProcessor>
const pitchShiftMin = -100
const pitchShiftMax = 200
const pitchFactorMin = 0.5
const pitchFactorMax = 2
const pitchShiftRange = pitchShiftMax - pitchShiftMin
const pitchFactorRange = pitchFactorMax - pitchFactorMin

// This component might be destroyed and recreated multiple times, so we need to
// get the current pitch factor from the audio processor.
// Also the audio processor might not be ready yet, so we need to use a default value.
const initialPitchFactor = outboundAudioProcessor.value?.getPitchFactor() ?? 1
const initialValue = Math.round(Math.min(
    pitchShiftMax,
    Math.max(
        pitchShiftMin,
        ((initialPitchFactor - pitchFactorMin) / pitchFactorRange) * pitchShiftRange + pitchShiftMin,
    ),
))

function onPitchShiftChanged(value: number) {
    // Convert slider values (-100..200) to AudioProcessor pitch factors (0.5..2.0).
    const pitchFactor = pitchFactorMin + ((value - pitchShiftMin) / pitchShiftRange) * pitchFactorRange
    outboundAudioProcessor.value?.setPitchFactor(pitchFactor)
}

</script>

<template>
    <NumericValueControl
        :min="pitchShiftMin"
        :max="pitchShiftMax"
        :default="0"
        :initialValue="initialValue"
        @value-changed="onPitchShiftChanged"></NumericValueControl>
</template>
