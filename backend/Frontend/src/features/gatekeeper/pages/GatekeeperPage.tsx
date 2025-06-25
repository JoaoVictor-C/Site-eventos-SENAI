import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/providers';
import { validateTicket } from '../api/gatekeeperService';
import { QRScanner } from '../components/QRScanner';
import { ValidationResultCard } from '../components/ValidationResultCard';
import type { TicketValidationResult } from '../types/validation';
import type { ScannerState } from '../types/scanner';
import { Text } from '@/components/ui/Text';
import { ErrorFallback } from '@/components/ui/ErrorFallback';

export const GatekeeperPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [scannerState, setScannerState] = useState<ScannerState>({
    isScanning: false,
    validationResult: null,
    error: null,
  });
  const validateTicketMutation = useMutation({
    mutationFn: validateTicket,
    onSuccess: (result: TicketValidationResult) => {
      setScannerState((prev: ScannerState) => ({
        ...prev,
        validationResult: result,
        error: null,
      }));
    },
    onError: (error: Error) => {
      setScannerState((prev: ScannerState) => ({
        ...prev,
        error: error,
      }));
    },
  });
  const handleStartScan = () => {
    setScannerState((prev: ScannerState) => ({
      ...prev,
      isScanning: true,
      lastResult: null,
      error: null,
    }));
    // In a real app, initialize QR scanner library here
  };
  const handleStopScan = () => {
    setScannerState((prev: ScannerState) => ({
      ...prev,
      isScanning: false,
    }));
    // In a real app, stop QR scanner library here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Text as="h1" variant="large" className="text-senai-red mb-6 text-center">
        Acesso Portaria
      </Text>

      <div className="flex flex-col items-center justify-center">
        {currentUser && (
          <Text variant="lead" className="text-center mb-6">
            Bem-vindo, <span className="font-semibold">{currentUser.name}</span>!
          </Text>
        )}

        <QRScanner
          isScanning={scannerState.isScanning}
          onStartScan={handleStartScan}
          onStopScan={handleStopScan}
        />

        {scannerState.error && (
          <ErrorFallback
            error={scannerState.error}
            resetErrorBoundary={() => setScannerState((prev: ScannerState) => ({ ...prev, error: null }))}
          />
        )}

        {scannerState.validationResult && (
          <ValidationResultCard result={scannerState.validationResult} />
        )}
      </div>
    </div>
  );
};
