import axios from 'axios';
import { apiUrl } from '@/config/base';
import type { IncidentReport, IncidentStatus, IncidentPriority } from '@/types/IncidentReport';
import { PaginationInfo } from '@/types/Whitelist';

export interface PaginatedIncidentResponse {
    data: IncidentReport[];
    pagination: PaginationInfo;
}

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json',
});

export const fetchIncidents = async (
    parkingLotId: string,
    pageSize: number = 10,
    currentPage: number = 1,
    searchKey?: string,
    dateRangeStart?: string,
    dateRangeEnd?: string,
    status?: IncidentStatus,
    priority?: IncidentPriority
): Promise<PaginatedIncidentResponse> => {
    try {
        const params = new URLSearchParams({
            pageSize: pageSize.toString(),
            currentPage: currentPage.toString(),
        });
        if (searchKey && searchKey.trim()) params.append('searchKey', searchKey.trim());
        if (dateRangeStart) params.append('dateRangeStart', dateRangeStart);
        if (dateRangeEnd) params.append('dateRangeEnd', dateRangeEnd);
        if (status !== undefined && status !== null) params.append('status', status.toString());
        if (priority !== undefined && priority !== null) params.append('priority', priority.toString());

        console.log(`${apiUrl}/api/incident/${parkingLotId}?${params.toString()}`);
        const response = await axios.get(`${apiUrl}/api/incident/${parkingLotId}?${params.toString()}`, {
            headers: getAuthHeaders(),
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching incidents:', error);
        throw error;
    }
}; 