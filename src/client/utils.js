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

export function stringToImage(imageString, isPng)
{
    return new Promise((resolve, reject) => {
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

export async function stringToImageList(imageString, isBase64)
{
    if (isBase64)
    {
        const img = await stringToImage(imageString, true);
        return [{ image: img }];
    }

    return new Promise((resolve, reject) =>
    {
        try
        {
            const svgDoc = document.createElement("template")
            svgDoc.innerHTML = imageString
            
            const elements = Array.from(svgDoc.content.firstElementChild.children)
                .filter(el => el.tagName != "defs")
            
            Promise.all(elements
                .reduce((acc, el) =>
            {
                const object = (el.firstElementChild
                        && el.firstElementChild.tagName == "desc"
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
            }, [])
                .map(async ([object, layerEls]) =>
            {
                elements.forEach(el => { el.style.display = layerEls.includes(el) ? "inline" : "none" })

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
    return fetch("/client-log", {
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

const maxGain = 1.3

var AudioContext = window.AudioContext          // Default
                 || window.webkitAudioContext;  // Safari and old versions of Chrome

export class AudioProcessor
{
    constructor(stream, volume, isInbound, vuMeterCallback)
    {
        this.stream = stream
        this.isBoostEnabled = false
        this.isMute = false
        this.isInbound = isInbound

        this.vuMeterCallback = vuMeterCallback

        this.context = new AudioContext();
        this.source = this.context.createMediaStreamSource(stream);
        this.destination = this.context.createMediaStreamDestination()
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -50;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;
        this.gain = this.context.createGain();

        // To support old safari versions that people still seem to use, check that createStereoPanner
        // is available, and if not, use a dummy gain node instead.
        if (this.context.createStereoPanner)
        {
            this.pan = this.context.createStereoPanner();
            this.pan.value = 0;
        }
        else
        {
            this.pan = this.context.createGain();
        }

        this.analyser = this.context.createAnalyser()

        this.connectNodes()

        this.setVolume(volume)

        // Vu meter
        this.analyser.minDecibels = -60;
        this.analyser.maxDecibels = 0;
        this.analyser.smoothingTimeConstant = 0.01;
        // fftSize must be 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, or 32768
        this.analyser.fftSize = 32
        const bufferLengthAlt = this.analyser.frequencyBinCount;
        const dataArrayAlt = new Uint8Array(bufferLengthAlt);

        this.vuMeterTimer = setInterval(() => {
            try {
                this.analyser.getByteFrequencyData(dataArrayAlt)

                const max = dataArrayAlt.reduce((acc, val) => Math.max(acc, val))

                // Convert level to a linear scale between 0 and 1
                const linearLevel = max / 255

                // Convert level to a logarithmic scale between 0 and 1
                const sensitivity = 50
                const logarithmicLevel = Math.log(linearLevel * sensitivity + 1) / Math.log(sensitivity + 1)

                vuMeterCallback(logarithmicLevel)
            }
            catch (exc)
            {
                console.error(exc)
                clearInterval(this.vuMeterTimer)
            }
        }, 100)
    }

    dispose()
    {
        for (const track of this.stream.getTracks()) track.stop();
        clearInterval(this.vuMeterTimer)
        return this.context.close().catch(console.error)
    }

    connectNodes()
    {
        this.source.disconnect()
        this.compressor.disconnect()
        this.gain.disconnect()
        this.pan.disconnect()

        if (this.isBoostEnabled)
        {
            this.source.connect(this.compressor)
            this.compressor.connect(this.gain)
        }
        else
        {
            this.source.connect(this.gain)
        }

        this.gain.connect(this.pan)

        if (this.isInbound)
            this.pan.connect(this.context.destination)
        
        this.pan.connect(this.destination)
        this.pan.connect(this.analyser)
    }

    setVolume(volume)
    {
        this.volume = volume

        this.gain.gain.value = this.isBoostEnabled
            ? volume * maxGain
            : volume
    }

    mute()
    {
        this.gain.gain.value = 0
        this.isMute = true
    }

    unmute()
    {
        this.gain.gain.value = this.volume
        this.isMute = false
    }

    setPan(value)
    {
        // Check that this is actually a pan node and not a dummy gain node (see comments in constructor)
        if (this.pan.pan)
            this.pan.pan.value = value
    }

    onCompressionChanged()
    {
        this.connectNodes()
    }
}

export function getFormattedCurrentDate() {
    const date = new Date()
    return [date.getFullYear(),
            "-",
            (date.getMonth() + 1).toString().padStart(2, '0'),
            "-",
            date.getDate().toString().padStart(2, '0'),
            " ",
            date.getHours().toString().padStart(2, '0'),
            ":",
            date.getMinutes().toString().padStart(2, '0'),
            ":",
            date.getSeconds().toString().padStart(2, '0'),
           ].join('');
  };

// On normal god-fearing browsers requestPermission() returns a Promise, while
// safari uses a callback parameter.
export function requestNotificationPermission()
{
    return new Promise((resolve, reject) => {
        const promise = Notification.requestPermission(resolve)
        if (promise)
            promise.then(resolve)
    })
}

export async function getDeviceList(includeAudioDevices, includeVideoDevices)
{
    if (!includeVideoDevices && !includeAudioDevices)
        return []

    // In order to get the labels, we need to get permission first 
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: includeVideoDevices, audio: includeAudioDevices })

    const devices = await navigator.mediaDevices.enumerateDevices();

    const output = devices
        .filter(d => (includeAudioDevices && d.kind == "audioinput") || (includeVideoDevices && d.kind == "videoinput"))
        .map(d => ({
            id: d.deviceId,
            name: d.label,
            type: d.kind
        }))

    for (const track of mediaStream.getTracks()) track.stop();

    return output
}

export function getClickCoordinatesWithinCanvas(canvas, clickEvent, devicePixelRatio)
{
    const canvasBoundingClientRect = canvas.getBoundingClientRect()
    
    return {
        x: (clickEvent.clientX - canvasBoundingClientRect.x) * devicePixelRatio,
        y: (clickEvent.clientY - canvasBoundingClientRect.y) * devicePixelRatio,
    }
}

// HTML control functions

export const controlCharLT = String.fromCharCode(2) // <
export const controlCharGT = String.fromCharCode(3) // >
export const controlCharAmp = String.fromCharCode(31) // &

export function htmlToControlChars(string)
{
    return string
        .replaceAll("&", controlCharAmp)
        .replaceAll("<", controlCharLT)
        .replaceAll(">", controlCharGT)
}

export function controlCharsToHtml(string)
{
    return string
        .replaceAll(controlCharAmp, "&")
        .replaceAll(controlCharLT, "<")
        .replaceAll(controlCharGT, ">")
}

export function removeControlChars(string)
{
    return string.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
}

export function escapeHTML(string)
{
    return string
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}
