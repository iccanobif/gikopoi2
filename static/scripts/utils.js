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

export class AudioProcessor
{
    constructor(stream, volume, vuMeterCallback)
    {
        this.stream = stream
        this.isBoostEnabled = false

        this.vuMeterCallback = vuMeterCallback

        this.context = new AudioContext()
        this.source = this.context.createMediaStreamSource(stream);
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -50;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;
        this.gain = this.context.createGain()

        this.setVolume(volume)

        this.connectNodes()

        // Vu meter
        const vuMeterSource = this.context.createMediaStreamSource(stream);
        const analyser = this.context.createAnalyser()
        analyser.minDecibels = -60;
        analyser.maxDecibels = 0;
        analyser.smoothingTimeConstant = 0.01;
        analyser.fftSize = 32
        const bufferLengthAlt = analyser.frequencyBinCount;
        const dataArrayAlt = new Uint8Array(bufferLengthAlt);
        vuMeterSource.connect(analyser);

        this.vuMeterTimer = setInterval(() => {
            try {
                analyser.getByteFrequencyData(dataArrayAlt)

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
        clearInterval(this.vuMeterTimer)
        return this.context.close().catch(console.error)
    }

    connectNodes()
    {
        this.source.disconnect()
        this.compressor.disconnect()
        this.gain.disconnect()

        if (this.isBoostEnabled)
        {
            this.source.connect(this.compressor)
            this.compressor.connect(this.gain)
            this.gain.connect(this.context.destination)
        }
        else
        {
            this.source.connect(this.gain)
            this.gain.connect(this.context.destination)
        }
    }

    setVolume(volume)
    {
        this.volume = volume

        this.gain.gain.value = this.isBoostEnabled
            ? volume * maxGain
            : volume
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