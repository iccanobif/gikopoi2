Promise.allSettled = Promise.allSettled ||
    ((promises) => Promise.all(promises.map(p => Promise.resolve(p)
        .then(v => ({
            status: 'fulfilled',
            value: v,
        }))
        .catch(e => ({
            status: 'rejected',
            reason: e,
        }))
    )));

window.Notification = window.Notification ||
{
    requestPermission: () => { return Promise.resolve("denied") },
    permission: "default",
}

if (!window.speechSynthesis)
    window.speechSynthesis = {
        getVoices: () => [],
        cancel: () => {}
    }

window.speechSynthesis.addEventListener = window.speechSynthesis.addEventListener || (() => { })
