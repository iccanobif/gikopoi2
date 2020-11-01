export function loadImage(url)
{
    console.log(url)
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