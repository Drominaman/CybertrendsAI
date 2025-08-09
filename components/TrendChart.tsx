
import React, { useMemo } from 'react';
import { TrendData } from '../types';

// Since we are using CDN, we access Recharts from the window object.
// We will destructure it inside the component to ensure the library has loaded.

interface TrendChartProps {
    data: TrendData[];
}

interface ChartData {
    name: string;
    count: number;
}

const COLORS = [
  '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63', 
  '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314'
];

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const chartData = useMemo<ChartData[]>(() => {
        const topicCounts = new Map<string, number>();
        data.forEach(item => {
            if (item.Topic) {
                topicCounts.set(item.Topic, (topicCounts.get(item.Topic) || 0) + 1);
            }
        });

        return Array.from(topicCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [data]);

    const Recharts = (window as any).Recharts;

    if (!Recharts) {
        return (
            <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center">
                <p className="text-slate-400">Chart library loading...</p>
            </div>
        );
    }
    
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } = Recharts;

    if (!chartData || chartData.length === 0) {
        return <p className="text-slate-400">Not enough data to display chart.</p>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#94a3b8" 
                        width={120} 
                        tick={{ fontSize: 12 }} 
                        interval={0}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                        contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            borderColor: '#334155',
                            color: '#e2e8f0'
                        }}
                    />
                    <Bar dataKey="count" name="Mentions">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
