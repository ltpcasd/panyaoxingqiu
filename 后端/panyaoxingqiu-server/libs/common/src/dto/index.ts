export class PaginationDto {
  page?: number = 1;
  pageSize?: number = 20;
}

export class ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
  requestId: string;

  constructor(data: T, message = 'success', code = 200) {
    this.code = code;
    this.data = data;
    this.message = message;
    this.timestamp = Date.now();
    this.requestId = this.generateRequestId();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };

  constructor(list: T[], total: number, page: number, pageSize: number) {
    this.list = list;
    this.pagination = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    };
  }
}

export class ErrorResponse {
  code: number;
  error: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: number;
  requestId: string;

  constructor(error: string, message: string, code = 400, details?: Record<string, string[]>) {
    this.code = code;
    this.error = error;
    this.message = message;
    this.details = details;
    this.timestamp = Date.now();
    this.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
