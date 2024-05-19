# DateRangeParser

DateRangeParser is a TypeScript library for parsing and handling date ranges. It supports various date formats and relative time expressions, making it suitable for a wide range of date processing scenarios.

## Features

- Supports keywords such as `now`, `today`, `thisweek`, `thismonth`, `thisyear`, etc.
- Supports relative time expressions like `6h`, `-6h`, `2d`, `-3d`, etc.
- Handles complex date range operations using operators like `->` and `<>`.

## Installation

To install DateRangeParser, use npm:

```bash
npm install daterangeparser
```

## Usage

### Importing the Library

```typescript
import DateRangeParser from 'daterangeparser';
```

### Parsing Date Inputs

```typescript
const result1 = DateRangeParser.parseDateInput('now');
console.log(result1); // { start: [current timestamp], end: [current timestamp] }

const result2 = DateRangeParser.parseDateInput('today');
console.log(result2); // { start: [start of today], end: [end of today] }

const result3 = DateRangeParser.parseDateInput('now -> 6h');
console.log(result3); // { start: [current timestamp], end: [current timestamp + 6 hours] }

const result4 = DateRangeParser.parseDateInput('now -> -6h');
console.log(result4); // { start: [current timestamp - 6 hours], end: [current timestamp] }
```

### Handling Errors

```typescript
const result = DateRangeParser.parseDateInput('invalid input');
if ('error' in result) {
    console.error(result.error); // Outputs: "Unknown keyword: invalidinput"
}
```
