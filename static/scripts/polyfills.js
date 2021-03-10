Promise.allSettled = Promise.allSettled ||
    ((promises) => Promise.all(promises.map(p => p
        .then(v => ({
            status: 'fulfilled',
            value: v,
        }))
        .catch(e => ({
            status: 'rejected',
            reason: e,
        }))
    )));

Notification = Notification ||
{
    requestPermission: () => { },
    permission: "default",
}

if (!speechSynthesis)
    speechSynthesis = {
        getVoices: () => []
    }

speechSynthesis.addEventListener = speechSynthesis.addEventListener || (() => { })