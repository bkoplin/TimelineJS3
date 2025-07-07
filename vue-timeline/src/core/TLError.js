/**
 * Custom error class for Timeline
 */
export class TLError extends Error {
  constructor(message_key, detail) {
    super();
    this.name = 'TLError';
    this.message_key = message_key;
    this.message = message_key;
    this.detail = detail;
    
    Error.captureStackTrace?.(this, TLError);
  }
}
