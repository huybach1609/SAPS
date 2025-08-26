import { User } from "./User";

export interface Whitelist {
    clientId: string;
    parkingLotId: string;
    email: string;
    fullName: string;
    addedDate: string;
    expiredDate?: string;
    client?: User; // Optional client details for backward compatibility
}

export interface WhitelistStatus {
    tottalWhitelistUsers: number;
    activeUser: number;
    expiringThisWeek: number;
}

export interface PaginationInfo {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface PaginatedWhitelistResponse {
    items: Whitelist[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
