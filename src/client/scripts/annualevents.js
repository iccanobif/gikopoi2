import dayjs from 'dayjs'

function parseEventString(eventString)
{
    return new Function("getNow", "return getNow()." + eventString)(dayjs)
}

export class AnnualEvent
{
    constructor(annualEventObject)
    {
        this.from = parseEventString(annualEventObject.from);
        this.to = parseEventString(annualEventObject.to);
        this.areRangeDatesSameYear = this.from.isBefore(this.to);
    }
    
    isBetween(checkDate)
    {
        if (this.areRangeDatesSameYear)
        {   // if between the dates
            return !checkDate.isBefore(this.from, "day") && !checkDate.isAfter(this.to, "day");
        }
        else
        {   // if after the `from` date OR before the `to` date
            return !checkDate.isBefore(this.from, "day") || !checkDate.isAfter(this.to, "day");
        }
    }
    
    isNow()
    {
        const now = dayjs()
        return this.isBetween(now)
    }
}

// annualEvent("winter").isNow()
export function annualEvent(eventName)
{
    return new AnnualEvent(window.annualEvents[eventName]);
}