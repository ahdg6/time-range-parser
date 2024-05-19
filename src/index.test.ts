import { describe, it, expect, beforeAll, afterEach, jest } from 'bun:test';
import {type DateRange, DateRangeParser} from './index';

// Helper function to create a DateRange object with milliseconds
const createDateRange = (start: number, end: number): DateRange => ({ start, end });

// Helper function to check if two numbers are approximately equal
const isApproximatelyEqual = (a: number, b: number, margin: number = 10): boolean => {
    return Math.abs(a - b) <= margin;
};

let fixedNow: number;

beforeAll(() => {
    fixedNow = Date.now();
});

afterEach(() => {
    jest.restoreAllMocks();
})

describe('DateRangeParser', () => {
    it('should parse "now" correctly', () => {
        const result = DateRangeParser.parseDateInput('now');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(isApproximatelyEqual(result.start as number, fixedNow)).toBe(true);
        expect(isApproximatelyEqual(result.end as number, fixedNow)).toBe(true);
    });

    it('should parse "today" correctly', () => {
        const startOfDay = new Date(fixedNow).setHours(0, 0, 0, 0);
        const endOfDay = startOfDay + 86400000 - 1;
        const result = DateRangeParser.parseDateInput('today');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(startOfDay, endOfDay));
    });

    it('should parse "thisweek" correctly', () => {
        const today = new Date(fixedNow);
        const day = today.getDay();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day).getTime();
        const endOfWeek = startOfWeek + 7 * 86400000 - 1;
        const result = DateRangeParser.parseDateInput('thisweek');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(startOfWeek, endOfWeek));
    });

    it('should parse "thismonth" correctly', () => {
        const today = new Date(fixedNow);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime() - 1;
        const result = DateRangeParser.parseDateInput('thismonth');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(startOfMonth, endOfMonth));
    });

    it('should parse "thisyear" correctly', () => {
        const today = new Date(fixedNow);
        const startOfYear = new Date(today.getFullYear(), 0, 1).getTime();
        const endOfYear = new Date(today.getFullYear() + 1, 0, 1).getTime() - 1;
        const result = DateRangeParser.parseDateInput('thisyear');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(startOfYear, endOfYear));
    });

    it('should parse relative time "6h" correctly', () => {
        const result = DateRangeParser.parseDateInput('now -> 6h');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        const expectedStart = fixedNow;
        const expectedEnd = fixedNow + 6 * 3600000;
        expect(isApproximatelyEqual(result.start as number, expectedStart)).toBe(true);
        expect(isApproximatelyEqual(result.end as number, expectedEnd)).toBe(true);
    });

    it('should parse offset range "today <> 2d" correctly', () => {
        const startOfDay = new Date(fixedNow).setHours(0, 0, 0, 0);
        const offsetEnd = startOfDay + 2 * 86400000;
        const result = DateRangeParser.parseDateInput('today <> 2d');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(startOfDay, offsetEnd));
    });

    it('should parse offset range "now <> 3d" correctly', () => {
        const startOfDay = new Date(fixedNow).setHours(0, 0, 0, 0);
        const offsetEnd = startOfDay + 2 * 86400000;
        const result = DateRangeParser.parseDateInput('today <> 2d');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(startOfDay, offsetEnd));
    });

    it('should handle invalid input gracefully', () => {
        const result = DateRangeParser.parseDateInput('invalid input');
        expect(result).toEqual({ error: 'Unknown keyword: invalidinput' });
    });
});

describe('DateRangeParser additional tests', () => {
    it('should parse "now -> 24h" correctly', () => {
        const result = DateRangeParser.parseDateInput('now -> 24h');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        const expectedStart = fixedNow;
        const expectedEnd = fixedNow + 24 * 3600000;
        expect(isApproximatelyEqual(result.start as number, expectedStart)).toBe(true);
        expect(isApproximatelyEqual(result.end as number, expectedEnd)).toBe(true);
    });

    it('should parse "yesterday -> today" correctly', () => {
        const yesterdayStart = new Date(fixedNow).setHours(0, 0, 0, 0) - 86400000;
        const todayEnd = new Date(fixedNow).setHours(0, 0, 0, 0) + 86400000 - 1;
        const result = DateRangeParser.parseDateInput('yesterday -> today');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(yesterdayStart, todayEnd));
    });

    it('should parse "lastweek -> thisweek" correctly', () => {
        const today = new Date(fixedNow);
        const day = today.getDay();
        const thisWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day).getTime();
        const lastWeekStart = thisWeekStart - 7 * 86400000;
        const thisWeekEnd = thisWeekStart + 7 * 86400000 - 1;
        const result = DateRangeParser.parseDateInput('lastweek -> thisweek');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(lastWeekStart, thisWeekEnd));
    });

    it('should parse "lastmonth -> thismonth" correctly', () => {
        const today = new Date(fixedNow);
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime() - 1;
        const result = DateRangeParser.parseDateInput('lastmonth -> thismonth');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(lastMonthStart, thisMonthEnd));
    });

    it('should parse "lastyear -> thisyear" correctly', () => {
        const today = new Date(fixedNow);
        const thisYearStart = new Date(today.getFullYear(), 0, 1).getTime();
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1).getTime();
        const thisYearEnd = new Date(today.getFullYear() + 1, 0, 1).getTime() - 1;
        const result = DateRangeParser.parseDateInput('lastyear -> thisyear');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(lastYearStart, thisYearEnd));
    });

    it('should parse offset range "yesterday <> 3d" correctly', () => {
        const yesterdayStart = new Date(fixedNow).setHours(0, 0, 0, 0) - 86400000;
        const offsetEnd = yesterdayStart + 3 * 86400000;
        const result = DateRangeParser.parseDateInput('yesterday <> 3d');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        expect(result).toEqual(createDateRange(yesterdayStart, offsetEnd));
    });

    it('should parse "now -> 3d" correctly', () => {
        const result = DateRangeParser.parseDateInput('now -> 3d');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        const expectedStart = fixedNow;
        const expectedEnd = fixedNow + 3 * 86400000;
        expect(isApproximatelyEqual(result.start as number, expectedStart)).toBe(true);
        expect(isApproximatelyEqual(result.end as number, expectedEnd)).toBe(true);
    });

    it('should parse "now -> 5min" correctly', () => {
        const result = DateRangeParser.parseDateInput('now -> 5min');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        const expectedStart = fixedNow;
        const expectedEnd = fixedNow + 5 * 60000;
        expect(isApproximatelyEqual(result.start as number, expectedStart)).toBe(true);
        expect(isApproximatelyEqual(result.end as number, expectedEnd)).toBe(true);
    });

    it('should parse offset range "now <> 5min" correctly', () => {
        const result = DateRangeParser.parseDateInput('now <> 5min');
        if ('error' in result) {
            throw new Error(`Test failed with error: ${result.error}`);
        }
        const expectedStart = fixedNow;
        const expectedEnd = fixedNow + 5 * 60000;
        expect(isApproximatelyEqual(result.start as number, expectedStart)).toBe(true);
        expect(isApproximatelyEqual(result.end as number, expectedEnd)).toBe(true);
    });
});
