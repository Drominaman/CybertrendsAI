export interface TrendData {
    Date: string;
    Company: string; // Mapped from 'Publisher'
    Topic: string; // Mapped from 'Tag 1'
    Technology: string; // Mapped from 'Tag 2'
    Source: string; // Mapped from 'link'
    stat: string;
    ResourceName: string; // Mapped from 'Resource Name'
}

export interface AIResult extends TrendData {
    reason: string;
}

export interface FilterOptions {
    topics: string[];
    companies: string[];
    dates: string[];
}
