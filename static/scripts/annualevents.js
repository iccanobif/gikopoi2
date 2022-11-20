class AnnualEvent
{
	constructor(monthFrom, dayFrom, monthTo, dayTo)
	{
		this.monthFrom = monthFrom;
		this.dayFrom = dayFrom
		this.monthTo = monthTo
		this.dayTo = dayTo
	}
	
	getOccurrence(y)
	{
		return [
			new Date(y, this.monthFrom-1, this.dayFrom),
			new Date(y, this.monthTo-1, this.dayTo, 23, 59, 59, 999)]
	}
	
	isBetween(date)
	{
		if (!date) date = new Date();
		const [start, end] = this.getOccurrence(date.getFullYear());
		if (start > end)
			return start <= date || date <= end;
		else
			return start <= date && date <= end;
	}
	
	isNow()
	{
		return this.isBetween()
	}
}

class AnnualMonthEvent extends AnnualEvent
{
	constructor(monthNumber)
	{
		this.monthNumber
	}
	
	getOccurrence(y)
	{
		return [
			new Date(y, this.monthNumber, 1),
			new Date(y, this.monthNumber + 1, 0)]
	}
}

const monthNames = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december"
]

export const annualEvents =
{
	spring: new AnnualEvent( 3, 20,  6, 20),
	summer: new AnnualEvent( 6, 21,  9, 21),
	autumn: new AnnualEvent( 9, 22, 12, 20),
	winter: new AnnualEvent(12, 21,  3, 19),
	
	goldenWeek: new AnnualEvent( 4, 29,  5,  5),
	fireflies: new AnnualEvent( 7,  1,  7,  9),
	spooktober: new AnnualEvent(10, 17, 11,  1),
	christmasTime: new AnnualEvent(12,  1, 12, 31),
	newYears: new AnnualEvent(12, 31,  1,  1),
}

monthNames.forEach((monthName, monthNumber) => {
	annualEvents[monthName] = new AnnualMonthEvent(monthNumber);
})