
import React, { useState, useEffect, useMemo } from 'react';
import { TrendData, AIResult, FilterOptions } from './types';
import { fetchAndParseData } from './services/dataService';
import { findRelevantStats, generateSummary } from './services/aiService';
import { Header } from './components/Header';
import { LoaderIcon, InfoIcon, SparklesIcon, SearchIcon, XIcon } from './components/Icons';
import { StatsTable } from './components/StatsTable';
import { StatDetailModal } from './components/StatDetailModal';
import { FilterSidebar } from './components/FilterSidebar';

const App: React.FC = () => {
    const [allData, setAllData] = useState<TrendData[]>([]);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const [dataError, setDataError] = useState<string | null>(null);

    // AI Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [aiResults, setAiResults] = useState<AIResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // AI Summary State
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    // Client-side Filter State
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedStat, setSelectedStat] = useState<(TrendData & { reason?: string }) | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsDataLoading(true);
                const data = await fetchAndParseData();
                setAllData(data);
                setDataError(null);
            } catch (err) {
                setDataError('Failed to load the cybersecurity data trends. The AI assistant needs this data to function.');
                console.error(err);
            } finally {
                setIsDataLoading(false);
            }
        };
        loadData();
    }, []);

    const filterOptions = useMemo<FilterOptions>(() => {
        const topics = new Set<string>();
        const companies = new Set<string>();
        const dates = new Set<string>();
        allData.forEach(item => {
            if (item.Topic) topics.add(item.Topic);
            if (item.Company) companies.add(item.Company);
            if (item.Date) dates.add(item.Date);
        });
        return {
            topics: Array.from(topics).sort(),
            companies: Array.from(companies).sort(),
            dates: Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
        };
    }, [allData]);

    const filteredData = useMemo(() => {
        return allData.filter(item => {
            const topicMatch = selectedTopics.length === 0 || selectedTopics.includes(item.Topic);
            const companyMatch = selectedCompanies.length === 0 || selectedCompanies.includes(item.Company);
            const dateMatch = selectedDates.length === 0 || selectedDates.includes(item.Date);
            
            const searchLower = searchTerm.toLowerCase();
            const termMatch = searchTerm === '' ||
                item.stat.toLowerCase().includes(searchLower) ||
                item.ResourceName.toLowerCase().includes(searchLower) ||
                item.Company.toLowerCase().includes(searchLower) ||
                item.Topic.toLowerCase().includes(searchLower) ||
                item.Technology.toLowerCase().includes(searchLower);

            return topicMatch && companyMatch && dateMatch && termMatch;
        });
    }, [allData, selectedTopics, selectedCompanies, selectedDates, searchTerm]);

    const handleClearSummary = () => {
        setSummary(null);
        setSummaryError(null);
    };

    const handleAiSearch = async () => {
        if (!searchQuery.trim() || isSearching) return;

        setIsSearching(true);
        setAiError(null);
        setAiResults([]);
        setSelectedStat(null);
        handleClearSummary();

        try {
            const results = await findRelevantStats(searchQuery, allData);
            setAiResults(results);
        } catch (err) {
            setAiError((err as Error).message || 'An unknown error occurred during the AI search.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearAiSearch = () => {
        setAiResults([]);
        setAiError(null);
        setSearchQuery('');
        handleClearSummary();
    };
    
    const handleStatSelect = (stat: TrendData | AIResult) => {
        setSelectedStat(stat);
    };

    const handleCloseModal = () => {
        setSelectedStat(null);
    };

    // Filter handlers
    const handleTopicToggle = (topic: string) => setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
    const handleCompanyToggle = (company: string) => setSelectedCompanies(prev => prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]);
    const handleDateToggle = (date: string) => setSelectedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
    const handleResetFilters = () => {
        setSelectedTopics([]);
        setSelectedCompanies([]);
        setSelectedDates([]);
        setSearchTerm('');
        handleClearSummary();
    };

    const handleGenerateSummary = async () => {
        if (aiResults.length === 0) return;

        setIsSummarizing(true);
        setSummary(null);
        setSummaryError(null);

        try {
            const result = await generateSummary(aiResults);
            setSummary(result);
        } catch (err) {
            setSummaryError((err as Error).message);
        } finally {
            setIsSummarizing(false);
        }
    };

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200">
                <LoaderIcon className="w-12 h-12 animate-spin text-cyan-400" />
                <p className="mt-4 text-lg">Loading Trend Database...</p>
            </div>
        );
    }
    
    if (dataError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-red-400">
                <p className="text-xl">{dataError}</p>
            </div>
        );
    }

    const showAiResults = aiResults.length > 0 || isSearching || aiError;

    return (
        <div className="min-h-screen bg-slate-900 font-sans">
            <Header />
            <main className="max-w-screen-2xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
                <FilterSidebar
                    filterOptions={filterOptions}
                    selectedTopics={selectedTopics}
                    onTopicToggle={handleTopicToggle}
                    selectedCompanies={selectedCompanies}
                    onCompanyToggle={handleCompanyToggle}
                    selectedDates={selectedDates}
                    onDateToggle={handleDateToggle}
                    onResetFilters={handleResetFilters}
                />
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Describe your research needs</h2>
                        <p className="text-slate-400 mt-2 max-w-2xl">
                            Enter a topic, question, or an outline for a white paper. Our AI will scan our database for relevant stats to support your work.
                        </p>
                        <div className="mt-6 max-w-3xl">
                            <textarea
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="e.g., I need statistics about the most common phishing attack vectors..."
                                className="w-full h-24 p-4 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none resize-y transition-colors"
                                aria-label="AI Search Query Input"
                            />
                            <button
                                onClick={handleAiSearch}
                                disabled={isSearching || !searchQuery.trim()}
                                className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
                            >
                                {isSearching ? (
                                    <><LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> Searching...</>
                                ) : (
                                    <><SparklesIcon className="w-5 h-5 mr-2" /> Find Relevant Stats</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* AI Summary Section */}
                    <div className="my-6">
                        {isSummarizing && (
                            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center animate-pulse">
                                <LoaderIcon className="w-5 h-5 mr-3 animate-spin text-cyan-400" />
                                <span className="text-slate-300">Generating Executive Analysis...</span>
                            </div>
                        )}
                        {summaryError && (
                            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-red-300">Error Generating Summary</h4>
                                        <p className="text-red-400 mt-1 text-sm">{summaryError}</p>
                                    </div>
                                    <button onClick={handleClearSummary} aria-label="Clear summary error" className="text-slate-400 hover:text-white flex-shrink-0 ml-4">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {summary && !isSummarizing && (
                            <div className="p-6 bg-slate-900/50 rounded-lg border border-cyan-500/30 shadow-lg relative">
                                <h3 className="text-lg font-bold text-cyan-400 flex items-center mb-3">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Executive Analysis
                                </h3>
                                <button onClick={handleClearSummary} aria-label="Clear summary" className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                    <XIcon className="w-6 h-6" />
                                </button>
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
                            </div>
                        )}
                        {!summary && !isSummarizing && !summaryError && aiResults.length > 0 && (
                            <div className="flex justify-start">
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={isSummarizing}
                                    className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Generate Executive Analysis
                                </button>
                            </div>
                        )}
                    </div>


                    <div id="results-section">
                        {isSearching && (
                            <div className="flex flex-col items-center justify-center text-center p-12">
                                <LoaderIcon className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
                                <h3 className="text-xl font-semibold text-slate-200">AI is thinking...</h3>
                                <p className="text-slate-400 mt-2">Analyzing your request and searching the database.</p>
                            </div>
                        )}
                        {aiError && (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-red-900/20 border border-red-500/30 rounded-lg">
                                <InfoIcon className="w-12 h-12 text-red-400 mb-4" />
                                <h3 className="text-xl font-semibold text-red-300">Search Failed</h3>
                                <p className="text-red-400 mt-2">{aiError}</p>
                                <button onClick={handleClearAiSearch} className="mt-4 text-sm text-slate-300 hover:underline">Back to database view</button>
                            </div>
                        )}
                        {aiResults.length > 0 && !isSearching && (
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-slate-200">
                                        AI Found <span className="text-cyan-400">{aiResults.length}</span> Relevant Stat{aiResults.length > 1 ? 's' : ''}
                                    </h3>
                                    <button onClick={handleClearAiSearch} className="flex items-center text-sm text-slate-400 hover:text-white">
                                        <XIcon className="w-4 h-4 mr-1" />
                                        Clear AI Results
                                    </button>
                                </div>
                               <StatsTable stats={aiResults} onStatSelect={handleStatSelect} />
                            </div>
                        )}
                        {!showAiResults && (
                            <div className="mt-6">
                                <div className="relative mb-4">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by keyword, resource, company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-200 mb-4">
                                    Browse Database <span className="text-base font-normal text-slate-400">({filteredData.length} stats found)</span>
                                </h3>
                                {filteredData.length > 0 ? (
                                    <StatsTable stats={filteredData} onStatSelect={handleStatSelect} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <InfoIcon className="w-12 h-12 text-slate-500 mb-4" />
                                        <h3 className="text-xl font-semibold text-slate-200">No Results Found</h3>
                                        <p className="text-slate-400 mt-2">Try adjusting your filters or search term.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {selectedStat && (
                <StatDetailModal stat={selectedStat} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default App;