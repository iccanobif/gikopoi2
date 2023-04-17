export interface AnnualEventObject
{
    from: string;
    to: string;
}

export type AnnualEventCallback = (currentEvents: string[], addedEvents: string[], removedEvents: string[]) => void
