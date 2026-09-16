export type RequestArea = 
  | 'B1' | 'B2' | 'B3' | 'B6' | 'B7' | 'B8' 
  | 'B10' | 'B11' | 'B12' | 'B14' | 'B15' | 'Privado';

export type RequestPurpose = 
  | 'شراء قسط' 
  | 'شراء كاش' 
  | 'إيجار قانون' 
  | 'إيجار مفروش';

export interface ClientRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  area: RequestArea;
  size: number;
  purpose: RequestPurpose;
  notes?: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  createdAt?: any;
  createdBy: string;
  createdByName: string;
  updatedAt?: any;
}

export interface ClientRequestFilterParams {
  search?: string;
  area?: RequestArea;
  purpose?: RequestPurpose;
  status?: string;
}
