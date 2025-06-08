import React from 'react';

interface BarChartProps {
  data: { month: string; amount: number }[];
  title: string;
  subtitle?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  subtitle,
  height = 160 
}) => {
  const maxAmount = Math.max(...data.map(item => item.amount));
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && (
          <div className="text-sm bg-gray-100 rounded-md px-3 py-1">
            {subtitle}
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-gray-500">Total Revenue</p>
        <h4 className="text-2xl font-bold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(data.reduce((sum, item) => sum + item.amount, 0))}
        </h4>
      </div>
      
      <div className={`h-${height / 4} flex items-end space-x-2`} style={{ height: `${height}px` }}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-primary rounded-md" 
              style={{ 
                height: `${(item.amount / maxAmount) * 100}%`,
                opacity: index % 2 === 0 ? 1 : 0.7
              }}
            ></div>
            <span className="text-xs mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DonutChartProps {
  percentage: number;
  title: string;
  subtitle?: string;
  size?: number;
  data?: { label: string; value: number; color: string }[];
}

export const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  title,
  subtitle,
  size = 128,
  data = []
}) => {
  const radius = 15.91549430918954;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && (
          <div className="text-sm bg-gray-100 rounded-md px-3 py-1">
            {subtitle}
          </div>
        )}
      </div>
      
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <p className="text-gray-500">Total</p>
          <h4 className="text-2xl font-bold">
            {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </h4>
        </div>
        
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <circle cx="18" cy="18" r={radius} fill="transparent" stroke="#e9ecef" strokeWidth="3.8"></circle>
            <circle 
              cx="18" 
              cy="18" 
              r={radius} 
              fill="transparent" 
              stroke="#E94DCA" 
              strokeWidth="3.8" 
              strokeDasharray={strokeDasharray} 
              strokeDashoffset="25"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{percentage}%</span>
          </div>
        </div>
      </div>
      
      {data.length > 0 && (
        <div className="space-y-4 mt-6">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-2 h-12 rounded-full mr-3" 
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle
}) => {
  const colorClasses = {
    primary: 'text-primary bg-primary',
    secondary: 'text-secondary bg-secondary',
    accent: 'text-accent bg-accent',
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        {icon && (
          <div className={`w-12 h-12 ${colorClasses[color]} bg-opacity-20 rounded-full flex items-center justify-center mr-4`}>
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-2">
          <span className="text-secondary">{subtitle}</span>
        </div>
      )}
    </div>
  );
};

interface ProgressBarProps {
  title: string;
  value: number;
  max: number;
  percentage: number;
  color?: 'primary' | 'secondary' | 'accent' | 'gray';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  value,
  max,
  percentage,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    gray: 'bg-gray-500',
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>{title}</span>
        <span className="text-gray-500">{value.toLocaleString()} {max > 0 && `/ ${max.toLocaleString()}`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}; 