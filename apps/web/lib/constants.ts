// Demo entity/book IDs - in production these would come from user session
export const DEFAULT_ENTITY_ID = 'cmgse2ohw0007u3ul72swgakn'
export const DEFAULT_BOOK_ID = 'cmgse2oi10009u3ulid8q3lra'

export const ACCOUNT_IDS = {
  CASH: 'cmgse2oij000hu3ul3jk7dlok',
  AR: 'cmgse2oip000ju3ulwovbu0uq',
  AP: 'cmgse2oj4000pu3uljqu5js02',
  RETAINED_EARNINGS: 'cmgse2oje000tu3ulagu8ptin',
  PRODUCT_REVENUE: 'cmgse2ojn000xu3ulnlez7rnv',
  SALARIES: 'cmgse2ojv0011u3ulj55m5y3k',
  RENT: 'cmgse2ojz0013u3ulelx4yxg3',
}

export const ACCOUNTS = [
  { id: ACCOUNT_IDS.CASH, code: '1110', name: 'Cash and Cash Equivalents', type: 'ASSET' },
  { id: ACCOUNT_IDS.AR, code: '1120', name: 'Accounts Receivable', type: 'ASSET' },
  { id: ACCOUNT_IDS.AP, code: '2110', name: 'Accounts Payable', type: 'LIABILITY' },
  { id: ACCOUNT_IDS.RETAINED_EARNINGS, code: '3100', name: 'Retained Earnings', type: 'EQUITY' },
  { id: ACCOUNT_IDS.PRODUCT_REVENUE, code: '4100', name: 'Product Revenue', type: 'REVENUE' },
  { id: ACCOUNT_IDS.SALARIES, code: '5100', name: 'Salaries and Wages', type: 'EXPENSE' },
  { id: ACCOUNT_IDS.RENT, code: '5200', name: 'Rent Expense', type: 'EXPENSE' },
]
