export interface PaginatedResponse<T> {
  items: T[];
  "total-count": number;
  "page-number": number;
  "page-size": number;
  "total-pages": number;
  "has-previous-page": boolean;
  "has-next-page": boolean;
}
