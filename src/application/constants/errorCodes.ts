export const ERROR_CODES = {
  VALIDATION: '01',
  DUPLICATED: '02',
  NOT_FOUND: '03',
  INSUFFICIENT_FUNDS: '04',
  TOKEN_INVALID: '05',
  SESSION_EXPIRED: '06',
  INTERNAL: '99',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
