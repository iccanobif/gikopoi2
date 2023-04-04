const { inject } = Vue

export default {
    props: ["userId", "userName"],
    template: "#component-username",
    setup(props)
    {
        const highlightedUserId = inject('highlightedUserId')
        const highlightUser = inject('highlightUser')
        
        return {
            highlightedUserId,
            highlightUser,
            
            userId: props.userId,
            userName: props.userName,
        }
    },
}
