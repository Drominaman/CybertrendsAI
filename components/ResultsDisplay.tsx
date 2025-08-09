
import React, { useState, useEffect } from 'react';
import { TrendData } from '../types';
import { TrendCard } from './TrendCard';
import { SearchIcon, InfoIcon } from './Icons';

interface ResultsDisplayProps {
    data: TrendData[];
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

const RESULTS_PER_PAGE = 10;

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, searchTerm, onSearchTermChange }) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [data, searchTerm]);

    const totalPages = Math.ceil(data.length / RESULTS_PER_PAGE);
    const paginatedData = data.slice(
        (currentPage - 1) * RESULTS_PER_PAGE,
        currentPage * RESULTS_PER_PAGE
    );

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    
    return (
        <div className="flex-1 min-w-0">
            <div className="relative mb-6">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by resource, company, topic..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
            </div>

            {data.length > 0 ? (
                <>
                    <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-slate-200">
                            Results <span className="text-base font-normal text-slate-400">({data.length} found)</span>
                        </h3>
                         {totalPages > 1 && (
                            <div className="flex items-center space-x-2 text-sm">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                                    aria-label="Previous page"
                                >
                                    Prev
                                </button>
                                <span className="text-slate-400" aria-live="polite">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                                    aria-label="Next page"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {paginatedData.map((item, index) => (
                            <TrendCard key={`${item.Source || index}-${item.ResourceName}`} trend={item} />
                        ))}
                    </div>
                     {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-2 text-sm mt-6">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                                    aria-label="Previous page"
                                >
                                    Prev
                                </button>
                                <span className="text-slate-400" aria-live="polite">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                                    aria-label="Next page"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-800/50 rounded-lg border border-slate-700">
                    <InfoIcon className="w-12 h-12 text-slate-500 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-200">No Results Found</h3>
                    <p className="text-slate-400 mt-2">Try adjusting your filters or search term.</p>
                </div>
            )}
        </div>
    );
};