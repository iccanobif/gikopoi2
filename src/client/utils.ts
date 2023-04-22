import type { Room, ImageLayer } from './types'

export const BLOCK_WIDTH = 80
export const BLOCK_HEIGHT = 40

export const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi

export function loadImage(url: string)
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            const img = new Image();
            img.addEventListener("load", () => 
            {
                resolve(img)
            })
            img.addEventListener("error", reject)
            // @ts-ignore
            img.src = url + "?v=" + window.EXPECTED_SERVER_VERSION
        }
        catch (err)
        {
            reject(err)
        }
    })
}

export function stringToImage(imageString: string, isPng: boolean)
{
    return new Promise<HTMLImageElement>((resolve, reject) => {
        try
        {
            const img = new Image()
            
            if (isPng)
               img.src = "data:image/png;base64," + imageString
            else
                img.src = "data:image/svg+xml;base64," + btoa(imageString)
            
            img.addEventListener("load", () => resolve(img))
            img.addEventListener("error", reject)
        }
        catch (exc)
        {
            reject(exc)
        }
    })
}

export async function stringToImageList(imageString: string, isBase64: boolean)
{
    if (isBase64)
    {
        const img = await stringToImage(imageString, true);
        const imageLayers: ImageLayer[] = [{ image: img }]
        return Promise.resolve(imageLayers)
    }

    return new Promise<ImageLayer[]>((resolve, reject) =>
    {
        try
        {
            const svgDoc = document.createElement("template")
            svgDoc.innerHTML = imageString
            
            if (!svgDoc.content || !svgDoc.content.firstElementChild)
                return
            
            const elements = Array.from(svgDoc.content.firstElementChild.children)
                .filter(el => el.tagName != "defs") as SVGElement[]
            
            Promise.all(elements
                .reduce((acc, el) =>
            {
                const object = (el.firstElementChild
                        && el.firstElementChild.tagName == "desc"
                        && el.firstElementChild.textContent
                        && el.firstElementChild.textContent.charAt(0) == "{")
                    ? JSON.parse(el.firstElementChild.textContent)
                    : {}
                if (el.id && el.id.startsWith("gikopoipoi_"))
                {
                    if (!object.tags) object.tags = []
                    object.tags.push(el.id.slice(11))
                }
                const lastIndex = acc.length - 1
                const isCurrentObjectUsed = Object.keys(object).length > 0
                const isLastObjectUsed = acc[lastIndex] && Object.keys(acc[lastIndex][0]).length > 0
                if (acc.length == 0 || isCurrentObjectUsed || isLastObjectUsed)
                    acc.push([object, [el]])
                else
                    acc[lastIndex][1].push(el)
                return acc
            }, [] as [ImageLayer, Element[]][])
                .map(async ([object, layerEls]) =>
            {
                elements.forEach(el => { el.style.display = layerEls.includes(el) ? "inline" : "none" })
                if (!svgDoc.content.firstElementChild) return object
                const img = await stringToImage(svgDoc.content.firstElementChild.outerHTML, false);
                object.image = img;
                return object;
            }))
                .then(images => { resolve(images) })
                .catch(reject)
        }
        catch (exception)
        {
            reject(exception)
        }
    })
}

// returns "left" and "bottom" positions
export function calculateRealCoordinates(room: Room, x: number, y: number): {x: number, y: number}
{
    const blockWidth = room.blockWidth ? room.blockWidth : BLOCK_WIDTH;
    const blockHeight = room.blockHeight ? room.blockHeight : BLOCK_HEIGHT;
    
    let realX = room.originCoordinates.x
        + x * blockWidth / 2
        + y * blockWidth / 2

    let realY = room.originCoordinates.y
        + x * blockHeight / 2
        - y * blockHeight / 2

    return { x: realX, y: realY }
}

// further down

export function logToServer(msg: string)
{
    return fetch("/client-log", {
        method: "POST",
        headers: { 'Content-Type': "text/plain"},
        body: msg
    })
}
