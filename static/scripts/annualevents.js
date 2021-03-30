class AnnualEvent
{
	constructor(occurrenceFunction)
	{
		this.occurrenceFunction = occurrenceFunction
	}
	
	isBetween(date)
	{
		if (!date) date = new Date();
		console.log(date)
		const [start, end] = this.occurrenceFunction(date.getFullYear());
		console.log(start, end)
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

function ae(monthFrom, dayFrom, monthTo, dayTo)
{
	return new AnnualEvent((y) => [new Date(y,  monthFrom-1, dayFrom), new Date(y,  monthTo-1, dayTo)]);
}

export const annualEvents =
{
	spring: ae( 3, 20,   6, 20),
	summer: ae( 6, 21,   9, 21),
	autumn: ae( 9, 22,  12, 20),
	winter: ae(12, 21,   3, 19),
	
	halloweenPeriod: ae(10,  1,  10, 31),
	christmasPeriod: ae(12,  1,  12, 31),
}