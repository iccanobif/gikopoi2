// Make jizou turn around when a user is standing in front of it
// return true if redraw is required
export function animateJizou(jizouObject, users)
{
    const now = Date.now();

    // initialize state
    if (!jizouObject.lastEventTime)
    {
        jizouObject.lastEventTime = now
        jizouObject.currentFrame = 0
        jizouObject.needToTurnAround = false
    }

    const needToTurnAround = !!Object.values(users).find(u => u.logicalPositionX == 7 && u.logicalPositionY == 5)

    // I consider switching from needToTurnAround == false to needToTurnAround == true an event so that i can wait
    // a full second before starting the animation, but when going from needToTurnAround == true to needToTurnAround == false
    // I want the animation to start immediately, so I don't update lastEventTime.
    if (!jizouObject.needToTurnAround && needToTurnAround)
        jizouObject.lastEventTime = now
    jizouObject.needToTurnAround = needToTurnAround

    // When a user moves in front of the jizou, I want to wait for one second before starting the animation
    const timeForNewFrame = now - jizouObject.lastEventTime > (jizouObject.currentFrame == 0 ? 1500 : 60)

    if (!timeForNewFrame)
        return false

    if (needToTurnAround)
        switch (jizouObject.currentFrame)
        {
            case 0:
                jizouObject.image = jizouObject.allImages[1];
                jizouObject.lastEventTime = now;
                jizouObject.currentFrame = 1
                return true;
            case 1: 
                jizouObject.image = jizouObject.allImages[2];
                jizouObject.lastEventTime = now;
                jizouObject.currentFrame = 2
                return true;
            case 2: return false;
        }
    else
        switch (jizouObject.currentFrame)
        {
            case 2:
                jizouObject.image = jizouObject.allImages[1];
                jizouObject.lastEventTime = now;
                jizouObject.currentFrame = 1
                return true;
            case 1:
                jizouObject.image = jizouObject.allImages[0];
                jizouObject.lastEventTime = now;
                jizouObject.currentFrame = 0
                return true;
            case 0: return false;
        }
}
