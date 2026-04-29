import assert from 'node:assert/strict'
import dayjs from 'dayjs'
import { describe, it } from 'mocha'

import { AnnualEvent, annualEvents } from '../src/common/annualevents.ts'


describe('AnnualEvent.isBetween', () =>
{
    it('returns true for dates inside an event range in the same year', () =>
    {
        const spring = new AnnualEvent(
            d => d.set({ month: 2, date: 21 }),
            d => d.set({ month: 4, date: 31 }),
        )

        assert.equal(spring.isBetween(dayjs('2026-03-21T12:00:00')), true)
        assert.equal(spring.isBetween(dayjs('2026-03-21T00:00:00')), true)
        assert.equal(spring.isBetween(dayjs('2026-04-30T23:59:59')), true)
    })

    it('returns false for dates outside an event range in the same year', () =>
    {
        const spring = new AnnualEvent(
            d => d.set({ month: 2, date: 21 }),
            d => d.set({ month: 4, date: 31 }),
        )

        assert.equal(spring.isBetween(dayjs('2026-03-20T23:59:59')), false)
        assert.equal(spring.isBetween(dayjs('2026-06-01T00:00:00')), false)
    })

    it('handles ranges that cross the year boundary', () =>
    {
        const winter = new AnnualEvent(
            d => d.set({ month: 11, date: 1 }),
            d => d.set({ month: 2, date: 20 }),
        )

        assert.equal(winter.isBetween(dayjs('2026-12-10T12:00:00')), true)
        assert.equal(winter.isBetween(dayjs('2027-01-15T12:00:00')), true)
        assert.equal(winter.isBetween(dayjs('2026-03-21T12:00:00')), false)
        assert.equal(winter.isBetween(dayjs('2026-11-30T12:00:00')), false)
    })

    it('includes both boundaries for ranges that cross the year boundary', () =>
    {
        const winter = new AnnualEvent(
            d => d.set({ month: 11, date: 1 }),
            d => d.set({ month: 2, date: 20 }),
        )

        assert.equal(winter.isBetween(dayjs('2026-12-01T00:00:00')), true)
        assert.equal(winter.isBetween(dayjs('2027-03-20T23:59:59')), true)
    })
    it('returns true for noKotatsu in 2026/04/29', () =>
    {
        assert.equal(annualEvents.noKotatsu.isBetween(dayjs('2026-04-29T12:00:00')), true)
    })
    it('returns true for winter in 2026/12/15', () =>
    {
        const winter = new AnnualEvent(
            d => d.set({ month: 11, date: 1 }),
            d => d.set({ month: 2, date: 20 }),
        )
        assert.equal(winter.isBetween(dayjs('2026-12-15T12:00:00')), true)
    })
})
