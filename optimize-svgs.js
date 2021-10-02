const { optimize } = require('svgo');
const fs = require("fs/promises")

const charactersDirectory = "static/characters"

async function optimizeAll()
{
    const characterIds = await fs.readdir(charactersDirectory)
    for (const characterId of characterIds)
    {
        const spriteFiles = await fs.readdir(charactersDirectory + "/" + characterId)
        for (const spriteFile of spriteFiles)
        {
            if (spriteFile.match(/\.png$/))
                continue
            const fileFullName = charactersDirectory + "/" + characterId + "/" + spriteFile
            const svgString = await fs.readFile(fileFullName)
            const result = optimize(svgString, {
                path: fileFullName,
                multipass: true,
            });

            await fs.writeFile(fileFullName, result.data)
            console.log(Math.round((result.data.length / svgString.length) * 100, 2) + "%", fileFullName, result.data.length + " bytes, was " + svgString.length + " bytes")
        }
    }
}

optimizeAll().catch(console.error)