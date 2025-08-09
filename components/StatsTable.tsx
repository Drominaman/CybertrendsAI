
import React from 'react';
import { AIResult, TrendData } from '../types';

interface StatsTableProps {
    stats: (TrendData | AIResult)[];
    onStatSelect: (stat: TrendData | AIResult) => void;
}

export const StatsTable: React.FC<StatsTableProps> = ({ stats, onStatSelect }) => {
    return (
        <div className="overflow-x-auto bg-slate-800/50 border border-slate-700 rounded-lg">
            <table className="min-w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 w-2/5">
                            Stat
                        </th>
                        <th scope="col" className="px-6 py-3 w-1/5">
                            Resource
                        </th>
                        <th scope="col" className="px-6 py-3 w-1/5">
                            Topic
                        </th>
                        <th scope="col" className="px-6 py-3 w-1/5">
                            Company
                        </th>
                         <th scope="col" className="px-6 py-3">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((stat, index) => (
                        <tr
                            key={`${stat.ResourceName}-${index}`}
                            className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
                            onClick={() => onStatSelect(stat)}
                            tabIndex={0}
                            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onStatSelect(stat)}
                        >
                            <td className="px-6 py-4 font-semibold text-slate-100">
                                {stat.stat}
                            </td>
                            <td className="px-6 py-4">
                                {stat.ResourceName}
                            </td>
                            <td className="px-6 py-4">
                                {stat.Topic}
                            </td>
                            <td className="px-6 py-4">
                                {stat.Company}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                {stat.Date}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
