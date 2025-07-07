/**
 * Test the DateParser functionality
 */

import { DateParser } from './core/DateParser'
import moment from 'moment'

console.log('Testing DateParser...')

// Test parsing object-based dates
const testDate1 = { year: '2023', month: '6', day: '15' }
const parsed1 = DateParser.parseDate(testDate1)
console.log('Parsed date 1:', parsed1.format('YYYY-MM-DD'))

// Test parsing string dates
const testDate2 = '2023-06-15'
const parsed2 = DateParser.parseDate(testDate2)
console.log('Parsed date 2:', parsed2.format('YYYY-MM-DD'))

// Test parsing with display_date
const testDate3 = { year: '2023', month: '6', day: '15', display_date: '2023-06-15' }
const parsed3 = DateParser.parseDate(testDate3)
console.log('Parsed date 3:', parsed3.format('YYYY-MM-DD'))

// Test date comparison
const date1 = moment('2023-06-15')
const date2 = moment('2023-06-20')
console.log('Date 1 is before Date 2:', DateParser.isBefore(date1, date2))

// Test date formatting
const formatted = DateParser.formatDate(date1, 'MMMM D, YYYY')
console.log('Formatted date:', formatted)

console.log('DateParser tests completed!')
