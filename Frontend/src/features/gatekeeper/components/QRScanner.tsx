import React from 'react';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface QRScannerProps {
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isScanning, onStartScan, onStopScan }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6">
        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 mb-6">
          {isScanning ? (
            <Text variant="muted">Escaneando QR Code...</Text>
          ) : (
            <Text variant="muted">Área de Escaneamento de QR Code</Text>
          )}
        </div>
        <Button
          onClick={isScanning ? onStopScan : onStartScan}
          variant={isScanning ? "outline" : "primary"}
          className="w-full"
        >
          {isScanning ? 'Parar Escaneamento' : 'Iniciar Escaneamento'}
        </Button>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-800 dark:bg-opacity-30 border border-blue-200 dark:border-blue-700 rounded-md">
          <Text as="h4" variant="lead" className="text-blue-700 dark:text-blue-300">
            Instruções:
          </Text>
          <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
            <li>Posicione o QR Code do ingresso dentro da área de escaneamento.</li>
            <li>Aguarde a validação automática.</li>
            <li>O sistema indicará se o ingresso é válido, já utilizado ou inválido.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
