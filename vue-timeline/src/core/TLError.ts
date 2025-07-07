/**
 * Custom error class for Timeline
 */
export class TLError extends Error {
  message_key: string;
  detail: string;
  constructor(message_key: string, detail: string) {
    super();
    this.name = 'TLError';
    this.message_key = message_key;
    this.message = message_key;
    this.detail = detail;
    
    Error.captureStackTrace?.(this, TLError);
  }
}
