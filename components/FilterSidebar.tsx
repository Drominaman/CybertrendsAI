
import React, { useState, useEffect, useRef } from 'react';
import { FilterOptions } from '../types';
import { 
    FilterIcon, RefreshCwIcon, TagIcon, BuildingIcon, 
    CalendarIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon, XIcon 
} from './Icons';

interface FilterSidebarProps {
    filterOptions: FilterOptions;
    selectedTopics: string[];
    onTopicToggle: (value: string) => void;
    selectedCompanies: string[];
    onCompanyToggle: (value: string) => void;
    selectedDates: string[];
    onDateToggle: (value: string) => void;
    onResetFilters: () => void;
}

const DropdownFilter: React.FC<{
    label: string;
    icon: React.ReactNode;
    options: string[];
    selectedOptions: string[];
    onToggle: (option: string) => void;
}> = ({ label, icon, options, selectedOptions, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const filteredOptions = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectionText = selectedOptions.length > 0 ? `${label} (${selectedOptions.length})` : `All ${label}s`;
    
    return (
        <div className="mb-6 relative" ref={dropdownRef}>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                {icon}
                <span className="ml-2">{label}</span>
            </h3>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-600 hover:border-slate-500 transition-colors"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span>{selectionText}</span>
                {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10">
                    <div className="p-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={`Search ${label.toLowerCase()}...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-1 focus:ring-cyan-500 outline-none"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <ul className="max-h-60 overflow-y-auto p-2">
                        {filteredOptions.map(option => (
                            <li key={option} 
                                className="flex items-center p-2 rounded-md hover:bg-slate-700 cursor-pointer"
                                onClick={() => onToggle(option)}
                                role="option"
                                aria-selected={selectedOptions.includes(option)}
                            >
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={selectedOptions.includes(option)}
                                    className="w-4 h-4 bg-slate-600 border-slate-500 rounded text-cyan-500 focus:ring-cyan-500 mr-3 pointer-events-none"
                                />
                                <span className="text-sm text-slate-300">{option}</span>
                            </li>
                        ))}
                        {filteredOptions.length === 0 && (
                            <li className="text-center text-sm text-slate-400 p-2">No options found.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    filterOptions,
    selectedTopics,
    onTopicToggle,
    selectedCompanies,
    onCompanyToggle,
    selectedDates,
    onDateToggle,
    onResetFilters
}) => {
    
    return (
        <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700 sticky top-24">
                <h2 className="text-xl font-semibold mb-6 flex items-center"><FilterIcon className="w-5 h-5 mr-2"/> Filters</h2>
                
                <DropdownFilter
                    label="Topic"
                    icon={<TagIcon className="w-4 h-4 text-slate-400" />}
                    options={filterOptions.topics}
                    selectedOptions={selectedTopics}
                    onToggle={onTopicToggle}
                />
                <DropdownFilter
                    label="Company"
                    icon={<BuildingIcon className="w-4 h-4 text-slate-400" />}
                    options={filterOptions.companies}
                    selectedOptions={selectedCompanies}
                    onToggle={onCompanyToggle}
                />
                <DropdownFilter
                    label="Date"
                    icon={<CalendarIcon className="w-4 h-4 text-slate-400" />}
                    options={filterOptions.dates}
                    selectedOptions={selectedDates}
                    onToggle={onDateToggle}
                />
                
                <div className="flex flex-col space-y-3 mt-4 border-t border-slate-700 pt-6">
                    <button
                        onClick={onResetFilters}
                        className="flex items-center justify-center w-full px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors duration-200"
                    >
                        <RefreshCwIcon className="w-4 h-4 mr-2"/>
                        Reset All Filters
                    </button>
                </div>
            </div>
        </aside>
    );
};
