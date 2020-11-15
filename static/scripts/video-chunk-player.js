export default class VideoChunkPlayer
{
    constructor(container)
    {
        this.container = container
        this.videoElement1 = document.createElement("video")
        this.videoElement2 = document.createElement("video")

        for (const videoElement of [this.videoElement1, this.videoElement2])
        {
            videoElement.style.zIndex = -1
            videoElement.autoplay = true
            container.appendChild(videoElement)
        }

        this.videoElement1.addEventListener("loadeddata", () => 
        {
            this.videoElement1.style.zIndex = 1000;
            this.videoElement2.style.zIndex = -1;
        })
        this.videoElement2.addEventListener("loadeddata", () => 
        {
            this.videoElement2.style.zIndex = 1000;
            this.videoElement1.style.zIndex = -1;
        })

        this.whichVideoElement = 1
    }

    playChunk(arrayBuffer)
    {
        this.videoElement1.style.display = "block"
        this.videoElement2.style.display = "block"

        const blob = new Blob([arrayBuffer])
        if (this.whichVideoElement == 1)
        {
            this.videoElement1.src = URL.createObjectURL(blob)
            this.whichVideoElement = 2
        }
        else 
        {
            this.videoElement2.src = URL.createObjectURL(blob)
            this.whichVideoElement = 1
        }
    }

    stop()
    {
        this.videoElement1.style.display = "none"
        this.videoElement2.style.display = "none"
    }
}