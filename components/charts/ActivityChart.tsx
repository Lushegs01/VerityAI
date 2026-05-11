import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { mockChartData } from '@/src/mock/dashboardData';

export function ActivityChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF85" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00FF85" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#4B5568" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#4B5568" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0E1117', 
              borderColor: '#1E2535', 
              borderRadius: '12px',
              fontSize: '12px',
              color: '#F0F4FF'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="verified" 
            stroke="#00D4FF" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVerified)" 
          />
          <Area 
            type="monotone" 
            dataKey="flagged" 
            stroke="#00FF85" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorFlagged)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
