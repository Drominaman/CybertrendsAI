import React from 'react';
import { ChartBarIcon } from './Icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <ChartBarIcon className="h-8 w-8 text-cyan-400" />
                        <h1 className="ml-3 text-2xl font-bold text-slate-100">CyberTrends</h1>
                    </div>
                    <p className="hidden md:block text-slate-400">Your AI-Powered Strategic Advisor</p>
                </div>
            </div>
        </header>
    );
};