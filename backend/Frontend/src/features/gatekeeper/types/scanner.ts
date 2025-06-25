import type { TicketValidationResult } from './validation';

export interface ScannerState {
  isScanning: boolean;
  validationResult: TicketValidationResult | null;
  error: Error | null;
}
