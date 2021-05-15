export const BLOCK_WIDTH = 80
export const BLOCK_HEIGHT = 40

export const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi

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
            img.src = url + "?v=" + window.EXPECTED_SERVER_VERSION;
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

export const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

export function postJson(url, data)
{
    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
}

export function logToServer(msg)
{
    return fetch("/error", {
        method: "POST",
        headers: { 'Content-Type': "text/plain"},
        body: msg
    })
}

// Some websites don't seem to realize that URL encoded strings should decode to UTF-8 and not to SHIFT-JIS.
// example: https://seesaawiki.jp/your_heart/d/%A4%C8%A4%AD%A4%E1%A4%AD%A5%BB%A5%F3%A5%B5%A1%BC%A4%CB%A4%C4%A4%A4%A4%C6
export function safeDecodeURI(str)
{
    try {
        return decodeURI(str)
    }
    catch (exc)
    {
        return str
    }
}

export const debounceWithDelayedExecution = (func, wait) => {
    let timeout;
  
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

export const debounceWithImmediateExecution = (func, wait) => {
    let lastExecution = null;
  
    return function executedFunction(...args) {
      if (Date.now() - lastExecution > wait)
      {
        lastExecution = Date.now()
        func(...args);
      }
    };
  };

export class AudioProcessor
{
    constructor(stream)
    {
        this.stream = stream
        if (window.AudioContext)
        {
            this.context = new AudioContext()
            
            this.source = this.context.createMediaStreamSource(stream);
            this.compressor = this.context.createDynamicsCompressor();
            this.compressor.threshold.value = -50;
            this.compressor.knee.value = 40;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0;
            this.compressor.release.value = 0.25;
            this.gain = this.context.createGain()
            this.gain.gain.value = 230

            this.source.connect(this.context.destination)
        }
    }

    dispose()
    {
        return this.context.close().catch(console.error)
    }

    getOutputStream()
    {
        if (window.AudioContext)
            return this.context.createMediaStreamDestination().stream

        return this.stream
    }

    setGain(gain)
    {
        this.gain.gain.value = gain
    }

    enableCompression()
    {
        console.log("enable compression")
        this.source.disconnect(this.context.destination)
        // this.source.connect(this.compressor)
        // this.compressor.connect(this.gain)

        this.source.connect(this.gain)
        this.gain.connect(this.context.destination)
    }
    
    disableCompression()
    {
        console.log("disable compression")
        this.source.disconnect()
        // this.compressor.disconnect(this.gain)
        this.gain.disconnect()

        this.source.connect(this.context.destination)
    }
}