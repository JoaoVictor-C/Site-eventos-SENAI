import React from 'react';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

interface ChartData {
  label: string;
  value: number;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  valueLabel?: string;
}

export const Chart: React.FC<ChartProps> = ({ title, data, valueLabel = 'Valor' }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <Card className="p-4">
      <Text variant="lead" className="font-semibold mb-4">
        {title}
      </Text>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <Text variant="small">{item.label}</Text>
                <Text variant="small" className="font-medium">
                  {valueLabel === 'R$' ? `R$ ${item.value.toFixed(2)}` : item.value}
                </Text>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-senai-red rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
