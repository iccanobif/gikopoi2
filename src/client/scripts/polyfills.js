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
