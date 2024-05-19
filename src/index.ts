import { DateRangeHandlers } from './DateRangeHandlers';

// 定义DateRange和DateToken类型
export type DateRange = { start: Date | number | null; end: Date | number | null };
export type DateToken = { rel?: number; start?: number; end?: number; now?: number };

// 处理时间单位和别名
class TimeUnitHandler {
    private static readonly TIME_UNITS = DateRangeHandlers.TIME_UNITS;

    private static readonly TIME_ALIASES: Record<string, string[]> = {
        yr: ["y", "yr", "yrs", "year", "years"],
        mon: ["mo", "mon", "mos", "mons", "month", "months"],
        day: ["d", "dy", "dys", "day", "days"],
        hr: ["h", "hr", "hrs", "hour", "hours"],
        min: ["m", "min", "mins", "minute", "minutes"],
        sec: ["s", "sec", "secs", "second", "seconds"],
    };

    static parseAlias(alias: string): number {
        for (const key in TimeUnitHandler.TIME_ALIASES) {
            if (TimeUnitHandler.TIME_ALIASES[key].includes(alias)) {
                return TimeUnitHandler.TIME_UNITS[key];
            }
        }
        throw new Error(`Unknown time alias: ${alias}`);
    }
}

// 处理关键词
class KeywordHandler {
    static handleKeyword(keyword: string, origin: number): DateToken {
        const originDate = new Date(origin);
        switch (keyword) {
            case "now":
                return { start: origin, end: origin };
            case "today":
                return DateRangeHandlers.dayRange(originDate);
            case "thisweek":
                return DateRangeHandlers.weekRange(originDate);
            case "thismonth":
                return DateRangeHandlers.monthRange(originDate);
            case "thisyear":
                return DateRangeHandlers.yearRange(originDate);
            case "yesterday":
                originDate.setDate(originDate.getDate() - 1);
                return DateRangeHandlers.dayRange(originDate);
            case "tomorrow":
                originDate.setDate(originDate.getDate() + 1);
                return DateRangeHandlers.dayRange(originDate);
            case "lastweek":
                originDate.setDate(originDate.getDate() - 7);
                return DateRangeHandlers.weekRange(originDate);
            case "lastmonth":
                originDate.setMonth(originDate.getMonth() - 1);
                return DateRangeHandlers.monthRange(originDate);
            case "lastyear":
                originDate.setFullYear(originDate.getFullYear() - 1);
                return DateRangeHandlers.yearRange(originDate);
            default:
                throw new Error(`Unknown keyword: ${keyword}`);
        }
    }
}

// 处理时间术语
class TermProcessor {
    static processTerm(term: string, origin: number): DateToken {
        const cleanedTerm = term.replace(/\s/g, "").toLowerCase();
        const match = cleanedTerm.match(/^([a-z]+)$|(-?\d+)([a-z]+)$/);

        if (!match) throw new Error(`Unknown term: ${term}`);

        if (match[1]) {
            return KeywordHandler.handleKeyword(match[1], origin);
        } else if (match[2] && match[3]) {
            const value = parseInt(match[2], 10);
            const unit = TimeUnitHandler.parseAlias(match[3]);
            const relativeMillis = value * unit;
            if (relativeMillis < 0) {
                return { rel: relativeMillis, start: origin + relativeMillis, end: origin };
            } else {
                return { rel: relativeMillis, start: origin, end: origin + relativeMillis };
            }
        }
        throw new Error(`Unknown term format: ${term}`);
    }
}

// 解析日期输入和生成日期范围
export default class DateRangeParser {
    static parseDateInput(input: string | null): DateRange | { error: string } {
        if (!input || input === "No filter") {
            return { error: "Invalid or empty time range" };
        }

        try {
            const now = Date.now();
            const terms = input.split(/\s*([^<>]*[^<>-])?\s*(->|<>|<)?\s*([^<>]+)?\s*/);
            const term1 = terms[1] ? TermProcessor.processTerm(terms[1], now) : null;
            const op = terms[2] || "";
            const term2 = terms[3] ? TermProcessor.processTerm(terms[3], now) : null;

            return DateRangeParser.getRange(op, term1, term2, now);
        } catch (error: any) {
            return { error: error.message };
        }
    }

    private static getRange(op: string, term1: DateToken | null, term2: DateToken | null, origin: number): DateRange | { error: string } {
        if (op === "" && term1) {
            return { start: term1.start ?? origin, end: term1.end ?? term1.start ?? origin };
        } else if (op === "->" && term1 && term2) {
            // 确保 start 小于等于 end
            const start = Math.min(term1.start ?? origin, term2.start ?? origin);
            const end = Math.max(term1.end ?? term1.start ?? origin, term2.end ?? term2.start ?? origin);
            return { start, end };
        } else if (op === "<>" && term1 && term2) {
            return DateRangeParser.offsetRange(term1, term2);
        } else {
            return { error: "Unsupported or unimplemented operation: " + op };
        }
    }

    private static offsetRange(term1: DateToken, term2: DateToken): DateRange {
        if (term1.start === undefined || term2.rel === undefined) {
            throw new Error("Offset range requires a start time and a relative time");
        }
        const offsetStart = term1.start;
        const offsetEnd = offsetStart + term2.rel;
        return { start: offsetStart, end: offsetEnd };
    }
}
