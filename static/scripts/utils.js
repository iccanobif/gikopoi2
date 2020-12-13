export const BLOCK_WIDTH = 160
export const BLOCK_HEIGHT = 80

export const scale = 0.5;

export function loadImage(url)
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
            img.src = url;
        }
        catch (err)
        {
            reject(err)
        }
    })
}

// returns "left" and "bottom" positions
export function calculateRealCoordinates(room, x, y)
{
    let realX = room.originCoordinates.x
        + x * BLOCK_WIDTH / 2
        + y * BLOCK_WIDTH / 2

    let realY = room.originCoordinates.y
        + x * BLOCK_HEIGHT / 2
        - y * BLOCK_HEIGHT / 2

    realY += BLOCK_HEIGHT / 2

    realX *= scale
    realY *= scale

    return { x: realX, y: realY }
}

export const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

export function postJson(url, data)
{
    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}