export interface SpecDetail {
  resolution?: string;
  fileSize?: string;
  format?: string[];
  duration?: string;
  ratio?: string;
  safeArea?: string;
  textLength?: {
    title?: number;
    description?: number;
    cta?: number;
  };
  minWidth?: string;
  minHeight?: string;
  additionalNotes?: string;
}

export interface MediaSpec {
  id: string;
  mediaName: string;
  productName: string;
  aliases: string[];
  specs: SpecDetail;
  guidelineUrl?: string;
  lastUpdated: string;
}

export interface ExcelRow {
  mediaName: string;
  productName: string;
  liveDate?: string;
  extractedSpecs?: Partial<SpecDetail>;
  rawText?: string;
}

export interface Discrepancy {
  field: string;
  fieldLabel: string;
  masterValue: string;
  excelValue: string;
  userChoice?: 'excel' | 'master';
}

export interface ValidationResult {
  id: string;
  mediaSpec: MediaSpec | null;
  excelRow: ExcelRow;
  matchScore: number;
  status: 'match' | 'mismatch' | 'not_found';
  discrepancies: Discrepancy[];
  finalSpecs?: SpecDetail;
}

export type WorkflowStep = 'upload' | 'validate' | 'review' | 'generate';

export interface WorkflowState {
  step: WorkflowStep;
  fileName?: string;
  excelRows?: ExcelRow[];
  validationResults?: ValidationResult[];
  isLoading?: boolean;
  error?: string;
}
