import React, { useEffect, useState } from 'react';
import { TrendData } from '../types';
import { BuildingIcon, CalendarIcon, LinkIcon, TagIcon, CpuIcon, InfoIcon, XIcon, CopyIcon, CheckIcon } from './Icons';

interface StatDetailModalProps {
    stat: TrendData & { reason?: string };
    onClose: () => void;
}

const CardInfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start text-sm mb-3">
            <span className="text-slate-400 w-5 h-5 flex-shrink-0 mt-0.5">{icon}</span>
            <span className="font-semibold text-slate-300 mr-2 ml-2">{label}:</span>
            <span className="text-slate-300 break-words min-w-0">{value}</span>
        </div>
    );
};

export const StatDetailModal: React.FC<StatDetailModalProps> = ({ stat, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleCopy = () => {
        if (!stat.Source || isCopied) return;

        const textToCopy = `"${stat.stat}" (Source: ${stat.Source})`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2500);
        }).catch(err => {
            console.error('Failed to copy stat: ', err);
            // In a real app, we might want to show an error toast to the user
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 md:p-8 flex flex-col max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <XIcon className="w-6 h-6" />
                </button>
                
                <div>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-100 mb-3 break-words pr-8">{stat.stat || 'Stat not available'}</h3>
                    <p className="text-lg font-semibold text-cyan-400 mb-6">{stat.ResourceName || 'Untitled Resource'}</p>
                    
                    <CardInfoRow icon={<BuildingIcon />} label="Publisher" value={stat.Company} />
                    <CardInfoRow icon={<TagIcon />} label="Topic" value={stat.Topic} />
                    <CardInfoRow icon={<CpuIcon />} label="Technology" value={stat.Technology} />
                    <CardInfoRow icon={<CalendarIcon />} label="Date" value={stat.Date} />
                </div>

                {stat.reason && (
                    <div className="mt-6 pt-4 border-t border-slate-700 bg-slate-900/50 p-4 rounded-md">
                        <div className="flex items-start text-sm">
                            <span className="text-cyan-400 w-5 h-5 flex-shrink-0 mr-2 mt-0.5"><InfoIcon /></span>
                            <div>
                               <p className="font-semibold text-slate-300">AI's Reason for Selection:</p>
                               <p className="text-slate-400 italic mt-1">"{stat.reason}"</p>
                            </div>
                        </div>
                    </div>
                )}

                {stat.Source && (
                    <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between flex-wrap gap-4">
                        <a
                            href={stat.Source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                        >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            View Source
                        </a>
                        <button
                            onClick={handleCopy}
                            disabled={isCopied}
                            className={`inline-flex items-center text-sm px-3 py-2 rounded-md transition-all duration-200 font-semibold ${
                                isCopied
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            }`}
                            aria-live="polite"
                        >
                            {isCopied ? (
                                <>
                                    <CheckIcon className="w-5 h-5 mr-2" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <CopyIcon className="w-5 h-5 mr-2" />
                                    <span>Copy Stat & Source</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translate(0px, 10px) scale(0.98); }
                    to { opacity: 1; transform: translate(0px, 0px) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};