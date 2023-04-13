import { inject, watch, ref } from 'vue'

const fallbackUserName = "N/A"

export default {
    props: ["userId", "userName"],
    template: "#component-username",
    setup(props)
    {
        const users = inject('users')
        const highlightedUserId = inject('highlightedUserId')
        const highlightUser = inject('highlightUser')
        const ignoredUserIds = inject('ignoredUserIds')
        
        const properUserName = props.userName
            || users[highlightedUserId]
            || fallbackUserName
        
        const userName = ref()
        
        const setUserName = () =>
        {
            userName.value = ignoredUserIds.value.has(props.userId)
                ? fallbackUserName
                : properUserName
        }
                
        watch(ignoredUserIds, setUserName,
            { immediate: true, deep: true })
        
        return {
            highlightedUserId,
            highlightUser,
            
            userId: props.userId,
            userName,
        }
    },
}
