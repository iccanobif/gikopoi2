// Make jizou turn around when a user is standing in front of it
// return true if redraw is required
export function animateJizou(jizouObject, users)
{
    // initialize state
    if (!jizouObject.lastFrameChangeTime)
    {
        jizouObject.lastFrameChangeTime = Date.now()
        jizouObject.currentFrame = 0
    }

    const needToTurnAround = !!Object.values(users).find(u => u.logicalPositionX == 7 && u.logicalPositionY == 5)
    const timeForNewFrame = Date.now() - jizouObject.lastFrameChangeTime > 150

    if (!timeForNewFrame)
        return false

    if (needToTurnAround)
        switch (jizouObject.currentFrame)
        {
            case 0:
                jizouObject.image = jizouObject.allImages[1];
                jizouObject.lastFrameChangeTime = Date.now();
                jizouObject.currentFrame = 1
                return true;
            case 1: 
                jizouObject.image = jizouObject.allImages[2];
                jizouObject.lastFrameChangeTime = Date.now();
                jizouObject.currentFrame = 2
                return true;
            case 2: return false;
        }
    else
        switch (jizouObject.currentFrame)
        {
            case 2:
                jizouObject.image = jizouObject.allImages[1];
                jizouObject.lastFrameChangeTime = Date.now();
                jizouObject.currentFrame = 1
                return true;
            case 1:
                jizouObject.image = jizouObject.allImages[0];
                jizouObject.lastFrameChangeTime = Date.now();
                jizouObject.currentFrame = 0
                return true;
            case 0: return false;
        }
}
