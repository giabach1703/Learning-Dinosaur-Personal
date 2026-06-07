import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface WeeklyStat {
  date: string;
  count: number;
}

interface ChartProps {
  data: WeeklyStat[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 320, background: '#ffffff', borderRadius: 16, padding: '16px 20px 8px 8px', border: '1px solid #e8ecea' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196f3" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2196f3" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0ee" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ background: '#ffffff', border: '1px solid #e8ecea', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
            labelStyle={{ fontWeight: 600, color: '#374151' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
          <Area
            type="monotone"
            name="Lượt Thẻ Đã Học"
            dataKey="count"
            stroke="#2196f3"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorReviews)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
