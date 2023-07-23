const { optimize, loadConfig } = require('svgo');
const fs = require("fs/promises")

let svgoConfig
const charactersDirectory = "public/characters"
const roomsDirectory = "public/rooms"

async function optimizeFile(fileFullName)
{
    if (!svgoConfig)
        svgoConfig = await loadConfig(); // loads svgo.config.js from the cwd
    
    const svgString = await fs.readFile(fileFullName)
    if (!/\r|\n/.exec(svgString)) return
    const result = optimize(svgString, { path: fileFullName, ...svgoConfig });

    await fs.writeFile(fileFullName, result.data)
    console.log(Math.round((result.data.length / svgString.length) * 100, 2) + "%", fileFullName, result.data.length + " bytes, was " + svgString.length + " bytes")
}

async function optimizeAll()
{
    await optimizeFile("public/enabled-listener.svg")
    await optimizeFile("public/disabled-listener.svg")

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

const args = process.argv.slice(2);
if (args.length > 0)
    optimizeFile(args[0]).catch(console.error)
else
    optimizeAll().catch(console.error)