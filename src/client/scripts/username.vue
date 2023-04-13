<script setup>
import { inject, watch, ref } from 'vue'

const fallbackUserName = 'N/A'

const props = defineProps(['userId', 'userName'])

const users = inject('users')
const highlightedUserId = inject('highlightedUserId')
const highlightUser = inject('highlightUser')
const ignoredUserIds = inject('ignoredUserIds')

const properUserName = props.userName
    || users[highlightedUserId]
    || fallbackUserName

const userName = ref()
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
