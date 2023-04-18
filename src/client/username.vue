<script setup lang="ts">
import { inject, watch, ref, computed, Ref } from 'vue'

import { Users, IgnoredUserIds } from './types'

const fallbackUserName = 'N/A'

const props = defineProps<{
    userId: string,
    userName?: string
}>()

const users = inject('users') as Ref<Users>
const highlightedUserId = inject('highlightedUserId') as Ref<string>
const highlightUser = inject('highlightUser') as any
const ignoredUserIds = inject('ignoredUserIds') as Ref<IgnoredUserIds>

const properUserName = props.userName
    || (users.value[highlightedUserId.value] && users.value[highlightedUserId.value].name)
    || fallbackUserName

const userName = ref(fallbackUserName)
watch(ignoredUserIds, () =>
{
    userName.value = ignoredUserIds.value.has(props.userId)
        ? fallbackUserName
        : properUserName
}, { immediate: true, deep: true })
</script>

<template>
    <span class="username"
        :class="{'highlighted-username': props.userId && props.userId == highlightedUserId}"
        @click="highlightUser(userId, userName)">{{ userName }}</span>
</template>
