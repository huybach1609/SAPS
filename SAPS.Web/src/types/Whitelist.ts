import { User } from "./User";

export interface Whitelist {
    parkingLotId: string;
    clientId: string;
    addedDate: string;
    expiredDate?: string;
    client?: User; // Optional client details
}

export interface WhitelistStatus {
    tottalWhitelistUsers: number;
    activeUser: number;
    expiringThisWeek: number;
}

export interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface PaginatedWhitelistResponse {
    data: Whitelist[];
    pagination: PaginationInfo;
}
