import { Client } from 'socket.io/dist/client';
import type { Users, CanvasObject, ClientRoomObject, AnimationFrame } from './types'

// Make jizou turn around when a user is standing in front of it
// return true if redraw is required
export function animateJizou(jizouObject: ClientRoomObject, users: Users): boolean
{
    // If the images have not been loaded yet, do nothing
    if (!jizouObject.allImages)
        return false

    const now = Date.now();

    const needToTurnAround = !!Object.values(users).find(u => u.logicalPositionX == 7 && u.logicalPositionY == 5)

    // Initialize state
    if (!jizouObject.lastUserCameOrLeftTime)
    {
        jizouObject.lastUserCameOrLeftTime = now
        // If when I enter the room someone else is already in front of the jizou, immediately display it at frame 3
        jizouObject.currentFrame = needToTurnAround ? 3 : 0
        jizouObject.needToTurnAround = needToTurnAround
    }

    if (jizouObject.needToTurnAround != needToTurnAround)
        jizouObject.lastUserCameOrLeftTime = now
    jizouObject.needToTurnAround = needToTurnAround

    const elapsedTime = Date.now() - jizouObject.lastUserCameOrLeftTime

    // Calculate the frame that should be displayed now.
    // Frames from 0 to 3 are for the head movement, frame 4 is for eye blinking
    if (needToTurnAround)
    {
        // look at the camera
        if (jizouObject.currentFrame == 0 && elapsedTime > 1500)
            jizouObject.currentFrame = 1
        else if (jizouObject.currentFrame == 1 && elapsedTime > 1500 + 60)
            jizouObject.currentFrame = 2
        else if (jizouObject.currentFrame == 2 && elapsedTime > 1500 + 60 * 2)
            jizouObject.currentFrame = 3
        // eye blinking (blink twice for 70ms every 5 seconds)
        else if (jizouObject.currentFrame == 3 || jizouObject.currentFrame == 4)
            if ((elapsedTime % 5000 > 3000 && elapsedTime % 5000 < 3000 + 70)
                || elapsedTime % 5000 > 3170 && elapsedTime % 5000 < 3240)
                jizouObject.currentFrame = 4
            else
                jizouObject.currentFrame = 3
    }
    else // return to base position, looking away from the camera
    {
        // not checking currentFrame == 4 on purpose, so that if the user moves away right when the jizou is blinking, it gets stuck
        // technically this is a bug, but it's funny so let's keep it.
        if (jizouObject.currentFrame == 3)
            jizouObject.currentFrame = 2
        else if (jizouObject.currentFrame == 2 && elapsedTime > 60)
            jizouObject.currentFrame = 1
        else if (jizouObject.currentFrame == 1 && elapsedTime > 60 * 2)
            jizouObject.currentFrame = 0
    }

    // If the current frame was changed, set the new image. Return true if redraw is required.
    if (jizouObject.currentFrame && jizouObject.image == jizouObject.allImages[jizouObject.currentFrame])
        return false
    else
    {
        if (jizouObject.currentFrame)
            jizouObject.image = jizouObject.allImages[jizouObject.currentFrame]
        return true
    }
}

export function animateObjects(canvasObjects: CanvasObject[], users: Users): boolean
{
    const now = Date.now();
    return canvasObjects
        .filter(o => o.type == "room-object")
        .map(o => o.o as ClientRoomObject)
        .filter(o => o.animation)
        .map(object =>
    {
        if (object.animation && object.animation.type == "cycle")
        {
            if (!object.animation.scenes["main"]) return false
            const mainScene = object.animation.scenes["main"]
            if (!mainScene.frames) return false
            if (mainScene.frames.length == 0 || typeof mainScene.frames[0] == "string" || !mainScene.frames[0].image) return false
            
            const getFrameDelay = (frame: AnimationFrame) => frame.frameDelay || mainScene.frameDelay || (object.animation && object.animation.frameDelay) || 0
            
            const totalLength = mainScene.frames.reduce((accLength, frame) => accLength + getFrameDelay(frame) , 0)
            const currentTime = (now+(object.animation.cycleShift || 0)) % totalLength
            let accLength = 0
            const currentFrame = mainScene.frames.find(frame =>
            {
                accLength += getFrameDelay(frame)
                return currentTime < accLength
            })
            
            if (!currentFrame) return false
            
            const isDifferentFrame = object.animation.currentFrame != currentFrame
            object.animation.currentFrame = currentFrame
            
            object.image = currentFrame.image
            return isDifferentFrame
        }
        
        return false
    }).some(isRedrawRequired => isRedrawRequired)
}
