module.exports = {
    multipass: true,
    plugins: [{
        name: 'preset-default',
        params: {
            overrides: {
                cleanupIDs: { // For version of SVGO in the repo
                    preservePrefixes: ["gikopoipoi_"]
                },
                cleanupIds: { // Newest version changes the key's case
                    preservePrefixes: ["gikopoipoi_"]
                },
                removeHiddenElems: {
                    displayNone: false
                }
            }
        }
    }]
};