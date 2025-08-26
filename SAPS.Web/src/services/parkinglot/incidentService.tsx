import axios from 'axios';
import { apiUrl } from '@/config/base';
import type { IncidentReport, IncidentStatus } from '@/types/IncidentReport';

export interface IncidentListItem {
    id: string;
    header: string;
    reportedDate: string;
    priority: string; // API returns string labels
    status: string;   // API returns string labels
}

export interface PaginatedIncidentResponse {
    items: IncidentListItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
});

export const fetchIncidents = async (
    parkingLotId: string,
    pageSize: number = 10,
    pageNumber: number = 1,
    searchCriteria?: string,
    startDate?: string,
    endDate?: string,
    status?: string,
    priority?: string,
    order?: string,
    sortBy?: string,
): Promise<PaginatedIncidentResponse> => {
    try {
        const params = new URLSearchParams();
        params.append('PageNumber', pageNumber.toString());
        params.append('PageSize', pageSize.toString());
        params.append('ParkingLotId', parkingLotId);
        if (priority) params.append('Priority', priority);
        if (status) params.append('Status', status);
        if (startDate) params.append('StartDate', startDate);
        if (endDate) params.append('EndDate', endDate);
        if (order) params.append('Order', order);
        if (sortBy) params.append('SortBy', sortBy);
        if (searchCriteria && searchCriteria.trim()) params.append('SearchCriteria', searchCriteria.trim());

        
        const url = `${apiUrl}/api/incidentreport/page?${params.toString()}`;
        console.log("url", url);
        const response = await axios.get(url, { headers: getAuthHeaders() });
        return response.data as PaginatedIncidentResponse;
    } catch (error) {
        console.error('Error fetching incidents:', error);
        throw error;
    }
}; 

export interface IncidentReportStatistics {
    openIncidents: number;
    inProgress: number;
    thisMonth: number;
    resolved: number;
}
export const fetchIncidentStatistics = async (parkingLotId: string): Promise<IncidentReportStatistics> => {
    const response = await axios.get(`${apiUrl}/api/incident/${parkingLotId}/statistics`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const fetchIncidentById = async (incidentId: string): Promise<IncidentReport> => {
    try {
        const response = await axios.get(`${apiUrl}/api/incidentReport/${incidentId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching incident:', error);
        throw error;
    }
};

export const updateIncidentStatus = async (incidentId: string, status: string): Promise<void> => {
    try {
        await axios.put(`${apiUrl}/api/incidentReport/status`, 
            { 
                id: incidentId,
                status: status 
            },
            { headers: getAuthHeaders() }
        );
    } catch (error) {
        console.error('Error updating incident status:', error);
        throw error;
    }
};