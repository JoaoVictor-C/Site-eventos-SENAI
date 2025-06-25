import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

interface DashboardStatsProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  title,
  value,
  icon,
  className = '',
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <Text variant="small" className="font-medium">
            {title}
          </Text>
          <Text variant="large" className="font-bold mt-1">
            {value}
          </Text>
        </div>
        {icon && (
          <div className="text-4xl opacity-20">{icon}</div>
        )}
      </div>
    </Card>
  );
};
