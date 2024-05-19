import type {DateToken} from "./index.ts";

export class DateRangeHandlers {
    static readonly TIME_UNITS: Record<string, number> = {
        yr: 31536000000, // 365 days
        mon: 2678400000, // 31 days
        day: 86400000, // 24 hours
        hr: 3600000, // 60 minutes
        min: 60000, // 60 seconds
        sec: 1000, // 1 second
    };

    static dayRange(date: Date): DateToken {
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const end = new Date(start.getTime() + DateRangeHandlers.TIME_UNITS.day);
        return { start: start.getTime(), end: end.getTime() - 1 };
    }

    static weekRange(date: Date): DateToken {
        const day = date.getDay();
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
        const end = new Date(start.getTime() + 7 * DateRangeHandlers.TIME_UNITS.day);
        return { start: start.getTime(), end: end.getTime() - 1 };
    }

    static monthRange(date: Date): DateToken {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        return { start: start.getTime(), end: end.getTime() - 1 };
    }

    static yearRange(date: Date): DateToken {
        const start = new Date(date.getFullYear(), 0, 1);
        const end = new Date(start.getFullYear() + 1, 0, 1);
        return { start: start.getTime(), end: end.getTime() - 1 };
    }
}
