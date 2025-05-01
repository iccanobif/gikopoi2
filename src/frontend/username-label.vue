<script setup lang="ts">
import { inject, watch, onUnmounted, ref, computed } from 'vue'
import type { Ref, WatchStopHandle } from 'vue'

import type { Users, IgnoredUserIds } from './types'

const fallbackUserName = 'N/A'

const props = defineProps<{
    userId: string,
    userName?: string
}>()

const users = inject('users') as Ref<Users>
const highlightedUserId = inject('highlightedUserId') as Ref<string>
const highlightUser = inject('highlightUser') as (userId: string, userName: string) => void
const ignoredUserIds = inject('ignoredUserIds') as Ref<IgnoredUserIds>

const properUserName = ref(fallbackUserName)

watch(props, () =>
{
    properUserName.value = fallbackUserName
    if (props.userName)
    {
        properUserName.value = props.userName
    }
    else
    {
        let unwatch: WatchStopHandle
        let unwatchTimer: number
        // watches users until properUserName is set or 4 seconds are over
        const clearUnwatchTimer = () => window.clearTimeout(unwatchTimer)
        const checkUsers = (): boolean =>
        {
            if (!users.value[props.userId]) return true
            properUserName.value = users.value[props.userId].name
            if (unwatch)
            {
                unwatch()
                clearUnwatchTimer()
            }
            return false
        }
        if (checkUsers())
        {
            unwatch = watch(users, checkUsers)
            unwatchTimer = window.setTimeout(unwatch, 4000)
            onUnmounted(clearUnwatchTimer)
        }
    }
}, { deep: true, immediate: true })

const userName = computed(() => ignoredUserIds.value.has(props.userId) ? fallbackUserName : properUserName.value)
</script>

<template>
    <span class="username"
        :class="{'highlighted-username': props.userId && props.userId == highlightedUserId}"
        @click="highlightUser(props.userId, userName)">{{ userName }}</span>
</template>
