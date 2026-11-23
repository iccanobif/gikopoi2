const popupCloseHandleStack: (() => void)[] = []

export function registerPopupCloseHandle(handle: () => void) {
    popupCloseHandleStack.push(handle)
}

export function unregisterPopupCloseHandle(handle: () => void) {
    const index = popupCloseHandleStack.indexOf(handle)
    if (index >= 0) {
        popupCloseHandleStack.splice(index, 1)
    }
}

function closeLastPopup() {
    const handle = popupCloseHandleStack.pop()
    if (handle) handle()
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeLastPopup()
    }
})