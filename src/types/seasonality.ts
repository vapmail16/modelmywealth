// Seasonality Data Types
export interface SeasonalityDetails {
  id?: string;
  project_id: string;
  january?: number | null;
  february?: number | null;
  march?: number | null;
  april?: number | null;
  may?: number | null;
  june?: number | null;
  july?: number | null;
  august?: number | null;
  september?: number | null;
  october?: number | null;
  november?: number | null;
  december?: number | null;
  seasonal_working_capital?: number | null;
  seasonality_pattern?: string | null;
  version?: number;
  created_by?: string;
  updated_by?: string;
  change_reason?: string;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
}

// Form data interface (for frontend forms)
export interface SeasonalityFormData {
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  seasonal_working_capital: string;
  seasonality_pattern: string;
}

// API request interface for updates
export interface SeasonalityUpdateRequest {
  fieldUpdates: Partial<SeasonalityDetails>;
  changeReason?: string;
}

// API response interface
export interface SeasonalityApiResponse {
  success: boolean;
  data: SeasonalityDetails | null;
  audit?: {
    changesDetected: boolean;
    changedFields: string[];
    version: number;
    isNewRecord: boolean;
  };
  message: string;
  error?: string;
}

// Audit entry interface
export interface SeasonalityAuditEntry {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  change_reason: string;
  created_at: string;
  old_values: Partial<SeasonalityDetails>;
  new_values: Partial<SeasonalityDetails>;
  changed_fields: string[];
  created_by: string;
  ip_address: string | null;
}

// Validation errors interface
export interface SeasonalityValidationErrors {
  [key: string]: string;
}

// Save state interface
export interface SeasonalitySaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

// Field change tracking
export interface SeasonalityFieldChange {
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
  timestamp: Date;
}

// Data transformation interfaces
export interface SeasonalityDataTransforms {
  formToApi: (formData: SeasonalityFormData) => SeasonalityDetails;
  apiToForm: (apiData: SeasonalityDetails) => SeasonalityFormData;
}

// Field configuration for UI
export interface SeasonalityFieldConfig {
  name: keyof SeasonalityFormData;
  label: string;
  type: 'number' | 'text' | 'select';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  category: 'months' | 'additional';
  description?: string;
}

// Field configurations for UI rendering
export const SEASONALITY_FIELD_CONFIGS: SeasonalityFieldConfig[] = [
  // Monthly percentages
  { name: 'january', label: 'January (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in January' },
  { name: 'february', label: 'February (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in February' },
  { name: 'march', label: 'March (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in March' },
  { name: 'april', label: 'April (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in April' },
  { name: 'may', label: 'May (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in May' },
  { name: 'june', label: 'June (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in June' },
  { name: 'july', label: 'July (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in July' },
  { name: 'august', label: 'August (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in August' },
  { name: 'september', label: 'September (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in September' },
  { name: 'october', label: 'October (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in October' },
  { name: 'november', label: 'November (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in November' },
  { name: 'december', label: 'December (%)', type: 'number', placeholder: '0.0000', min: 0, max: 100, step: 0.0001, category: 'months', description: 'Percentage of annual revenue in December' },
  
  // Additional fields
  { name: 'seasonal_working_capital', label: 'Seasonal Working Capital', type: 'number', placeholder: '0.00', min: 0, step: 0.01, category: 'additional', description: 'Additional working capital needed for seasonal variations' },
  { name: 'seasonality_pattern', label: 'Seasonality Pattern', type: 'text', placeholder: 'e.g., Q4 Peak, Summer Dip', category: 'additional', description: 'Description of the seasonality pattern' }
];

// Month names for display
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Month field names
export const MONTH_FIELDS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]; 