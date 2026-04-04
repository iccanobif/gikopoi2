<script setup lang="ts">
import { ref } from 'vue'
import type { ClientRoom } from '../types'

const props = defineProps<{
    currentRoom: ClientRoom | null
}>()

const emit = defineEmits<{
    'adjust-object': [objectIndex: number, property: string, delta: number]
    'set-object': [objectIndex: number, property: string, value: number]
    'toggle-object-visibility': [objectIndex: number]
}>()

const fields: { label: string; prop: string; step: number }[] = [
    { label: 'x',     prop: 'x',        step: 1   },
    { label: 'y',     prop: 'y',        step: 1   },
    { label: 'ox',    prop: 'offset.x', step: 1   },
    { label: 'oy',    prop: 'offset.y', step: 1   },
    { label: 'scale', prop: 'scale',    step: 0.1 },
]

const copyStatus = ref<'idle' | 'copied'>('idle')

function adjust(objectIndex: number, property: string, delta: number)
{
    emit('adjust-object', objectIndex, property, delta)
}

function onInput(objectIndex: number, property: string, event: Event)
{
    const raw = (event.target as HTMLInputElement).value
    const value = parseFloat(raw)
    if (!isNaN(value))
        emit('set-object', objectIndex, property, value)
}

function getValue(obj: NonNullable<ClientRoom>['objects'][number], property: string): number
{
    if (property === 'x') return obj.x
    if (property === 'y') return obj.y
    if (property === 'offset.x') return obj.offset?.x ?? 0
    if (property === 'offset.y') return obj.offset?.y ?? 0
    if (property === 'scale') return obj.scale ?? 1
    return 0
}

function formatObjectsJson(objects: Record<string, unknown>[]): string
{
    return [
        '[',
        ...objects.map((object, index) => `    ${JSON.stringify(object)},`),
        ']',
    ].join('\n')
}

function copyObjectsJson()
{
    if (!props.currentRoom) return
    const stripped = props.currentRoom.objects.map(o => {
        const out: Record<string, unknown> = { x: o.x, y: o.y }
        if (o.id !== undefined)     out.id = o.id
        if (o.width !== undefined)  out.width = o.width
        if (o.height !== undefined) out.height = o.height
        out.url = o.url
        if (o.animation !== undefined) out.animation = o.animation
        if (o.scale !== undefined)  out.scale = o.scale
        if (o.offset !== undefined) out.offset = o.offset
        return out
    })
    const json = formatObjectsJson(stripped)
    navigator.clipboard.writeText(json).then(() => {
        copyStatus.value = 'copied'
        setTimeout(() => { copyStatus.value = 'idle' }, 2000)
    })
}

function toggleVisibility(objectIndex: number)
{
    emit('toggle-object-visibility', objectIndex)
}
</script>

<template>
    <div id="room-object-editor" v-if="currentRoom">
        <div id="room-object-editor-toolbar">
            <button @click="copyObjectsJson">{{ copyStatus === 'copied' ? '✓ Copied!' : 'Copy objects JSON' }}</button>
        </div>
        <div
            v-for="(obj, index) in currentRoom.objects"
            :key="index"
            class="room-object-editor-row"
        >
            <span class="room-object-editor-label">{{ obj.url || ('[' + index + ']') }}</span>
            <span class="room-object-editor-field">
                <button @click="toggleVisibility(index)">{{ obj.isHidden ? '無' : '有' }}</button>
            </span>
            <span v-for="field in fields"
                  :key="field.prop"
                  class="room-object-editor-field">
                <label class="room-object-editor-field-name">{{ field.label }}</label>
                <button @click="adjust(index, field.prop, -field.step)">−</button>
                <input
                    class="room-object-editor-input"
                    type="number"
                    :step="field.step"
                    :value="getValue(obj, field.prop)"
                    @change="onInput(index, field.prop, $event)"
                />
                <button @click="adjust(index, field.prop, field.step)">+</button>
            </span>
        </div>
    </div>
</template>

<style>
#room-object-editor {
    padding: 4px;
    font-size: 11px;
    border-top: 1px solid #aaa;
    margin-top: 4px;
}

#room-object-editor-toolbar {
    margin-bottom: 4px;
}

.room-object-editor-row {
    display: grid;
    grid-template-columns: 140px repeat(6, auto);
    align-items: center;
    gap: 4px;
    padding: 2px 0;
    border-bottom: 1px dotted #ccc;
}

.room-object-editor-label {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.room-object-editor-field {
    display: inline-flex;
    align-items: center;
    gap: 2px;
}

.room-object-editor-field-name {
    font-size: 10px;
}

.room-object-editor-input {
    width: 52px;
    font-size: 11px;
    padding: 0 2px;
}

.room-object-editor-row button {
    padding: 0 4px;
    line-height: 1.2;
    font-size: 12px;
    cursor: pointer;
}
</style>
