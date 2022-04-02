const { optimize } = require('svgo');
const fs = require("fs/promises")

const charactersDirectory = "static/characters"
const roomsDirectory = "static/rooms"

async function optimizeFile(fileFullName)
{
    const svgString = await fs.readFile(fileFullName)
    const result = optimize(svgString, {
        path: fileFullName,
        multipass: true,
    });

    await fs.writeFile(fileFullName, result.data)
    console.log(Math.round((result.data.length / svgString.length) * 100, 2) + "%", fileFullName, result.data.length + " bytes, was " + svgString.length + " bytes")
}

async function optimizeAll()
{
    await optimizeFile("static/enabled-listener.svg")
    await optimizeFile("static/disabled-listener.svg")

    const characterIds = await fs.readdir(charactersDirectory)
    for (const characterId of characterIds)
    {
        const spriteFiles = await fs.readdir(charactersDirectory + "/" + characterId)
        for (const spriteFile of spriteFiles)
        {
            if (!spriteFile.match(/\.svg$/))
                continue
            const fileFullName = charactersDirectory + "/" + characterId + "/" + spriteFile
            await optimizeFile(fileFullName)
        }
    }
    const roomIds = await fs.readdir(roomsDirectory, { })
    for (const roomId of roomIds.filter(roomId => !roomId.match(/\.svg$/)))
    {
        const spriteFiles = await fs.readdir(roomsDirectory + "/" + roomId)
        for (const spriteFile of spriteFiles)
        {
            if (!spriteFile.match(/\.svg$/))
                continue
            const fileFullName = roomsDirectory + "/" + roomId + "/" + spriteFile
            // console.log(fileFullName)
            await optimizeFile(fileFullName)
        }
    }
}

optimizeAll().catch(console.error)