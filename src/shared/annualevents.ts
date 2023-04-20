import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

type RangeDateDeterminer = (now: dayjs.Dayjs) => dayjs.Dayjs

export type AnnualEventCallback = (currentEvents: string[], addedEvents: string[], removedEvents: string[]) => void


function getNow(): dayjs.Dayjs
{
    return dayjs().tz("Asia/Tokyo")
}

function isSameOrAfter(d1: dayjs.Dayjs, d2: dayjs.Dayjs): boolean
{
    return !d1.isBefore(d2)
}

function isSameOrBefore(d1: dayjs.Dayjs, d2: dayjs.Dayjs): boolean
{
    return !d1.isAfter(d2)
}

export class AnnualEvent
{
    private from: RangeDateDeterminer;
    private to: RangeDateDeterminer;
    private areRangeDatesSameYear: boolean;
    
    constructor(from: RangeDateDeterminer, to: RangeDateDeterminer)
    {
        this.from = from
        this.to = to
        
        const now = getNow()
        this.areRangeDatesSameYear = this.determineFrom(now).isBefore(this.determineTo(now));
    }
    
    private determineFrom(checkDate: dayjs.Dayjs): dayjs.Dayjs
    {
        return this.from(checkDate.startOf('day'))
    }
    
    private determineTo(checkDate: dayjs.Dayjs): dayjs.Dayjs
    {
        return this.to(checkDate.endOf('day'))
    }
    
    public getNextEventDate(checkDate?: dayjs.Dayjs): dayjs.Dayjs
    {
        const cd = checkDate ? checkDate : getNow()
        const fromTime = this.determineFrom(cd)
        const toTime = this.determineTo(cd)
        
        const firstInYear = this.areRangeDatesSameYear ? fromTime : toTime
        const lastInYear = this.areRangeDatesSameYear ? toTime : fromTime
        
        if (cd.isBefore(firstInYear))
            return firstInYear
        else if (cd.isBefore(lastInYear))
            return lastInYear
        else
            return firstInYear.add(1, 'year')
    }
    
    public isBetween(checkDate: dayjs.Dayjs): boolean
    {
        const fromTime = this.determineFrom(checkDate)
        const toTime = this.determineTo(checkDate)
        if (this.areRangeDatesSameYear)
            return isSameOrAfter(checkDate, fromTime) && isSameOrBefore(checkDate, toTime)
        else
            return isSameOrBefore(checkDate, toTime) || isSameOrAfter(checkDate, fromTime)
    }
    
    public isNow(): boolean
    {
        const now = getNow()
        return this.isBetween(now)
    }
}

export const annualEvents: {[eventName: string]: AnnualEvent} =
{
    spring: new AnnualEvent((now) => now.month(2).date(21), (now) => now.month(4).endOf('month')), // starting with cherry blossoms blooming
    summer: new AnnualEvent((now) => now.month(5).startOf('month'), (now) => now.month(7).endOf('month')), // sun
    autumn: new AnnualEvent((now) => now.month(8).startOf('month'), (now) => now.month(10).endOf('month')), // orange/yellow/brown colors
    winter: new AnnualEvent((now) => now.month(11).startOf('month'), (now) => now.month(2).date(20)), // snow
    
    sakura: new AnnualEvent((now) => now.month(2).date(21), (now) => now.month(3).endOf('month')), // cherry blossoms
    goldenWeek: new AnnualEvent((now) => now.month(3).date(29), (now) => now.month(4).date(5)),
    rainy: new AnnualEvent((now) => now.month(5).startOf('month'), (now) => now.month(5).endOf('month')), // tsuyu / rainy season
    fireflies: new AnnualEvent((now) => now.month(6).date(1), (now) => now.month(6).date(9)), // ホタル観賞
    akizakura: new AnnualEvent((now) => now.month(8).startOf('month'), (now) => now.month(8).endOf('month')), // cosmos flowers
    spooktober: new AnnualEvent((now) => now.month(9).date(17), (now) => now.month(10).date(1)),
    christmasTime: new AnnualEvent(
        (now) => now.month(11).date(24).startOf('week').subtract(3, 'week'), // first advent
        (now) => now.month(11).date(30)),
    newYears: new AnnualEvent((now) => now.month(11).date(31), (now) => now.month(0).date(1)),
}

export function getCurrentAnnualEvents(): string[]
{
    const now = getNow()
    return Object.entries(annualEvents)
        .filter(([eventName, annualEvent]) => annualEvent.isBetween(now))
        .map(([eventName, annualEvent]) => eventName)
}

export function getSoonestEventDate(): dayjs.Dayjs
{
    const now = getNow()
    return Object.values(annualEvents)
        .map(annualEvent => annualEvent.getNextEventDate(now))
        .reduce((previous, current) => current.isBefore(previous) ? current : previous)
}


const eventObservers: {[eventName: string]: AnnualEventCallback[]} = {}
let hasObserverStarted = false

export function subscribeToAnnualEvents(annualEventNames: string[], callbackFunction: AnnualEventCallback)
{
    annualEventNames.forEach(name =>
    {
        if (!(name in eventObservers)) eventObservers[name] = []
        eventObservers[name].push(callbackFunction)
    })
    if (!hasObserverStarted)
    {
        observeEvents()
        hasObserverStarted = true
    }
}

function observeEvents(previousAnnualEvents?: string[])
{
    const currentAnnualEvents = getCurrentAnnualEvents();
    if (typeof previousAnnualEvents !== "undefined")
    {
        const added: string[] = currentAnnualEvents.filter(eventName => !previousAnnualEvents.includes(eventName));
        const removed: string[] = previousAnnualEvents.filter(eventName => !currentAnnualEvents.includes(eventName));
        
        const callbackFunctionsToCall = new Set(added.concat(removed)
            .filter(name => name in eventObservers)
            .map(eventName => eventObservers[eventName])
            .flat());

        callbackFunctionsToCall.forEach(callbackFunction => callbackFunction(currentAnnualEvents, added, removed));
    }
    setTimeout(observeEvents, Math.min(getSoonestEventDate().diff(getNow()), 60*60*1000), currentAnnualEvents); // min every hour or time to next event date
}
