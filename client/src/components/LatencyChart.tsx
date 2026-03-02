import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { time: "00:00", legacy: 4.5, optimized: 1.2, fpga: 0.1 },
  { time: "04:00", legacy: 5.2, optimized: 1.3, fpga: 0.12 },
  { time: "08:00", legacy: 8.5, optimized: 1.8, fpga: 0.15 },
  { time: "12:00", legacy: 12.4, optimized: 2.5, fpga: 0.2 },
  { time: "16:00", legacy: 15.2, optimized: 3.1, fpga: 0.25 },
  { time: "20:00", legacy: 6.5, optimized: 1.5, fpga: 0.12 },
  { time: "24:00", legacy: 4.2, optimized: 1.1, fpga: 0.1 },
];

export function LatencyChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLegacy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorFpga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}ms`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area 
            type="monotone" 
            dataKey="legacy" 
            name="Legacy Stack"
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorLegacy)" 
          />
          <Area 
            type="monotone" 
            dataKey="optimized" 
            name="Optimized Software"
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorOptimized)" 
          />
          <Area 
            type="monotone" 
            dataKey="fpga" 
            name="FPGA/Hardware"
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorFpga)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}