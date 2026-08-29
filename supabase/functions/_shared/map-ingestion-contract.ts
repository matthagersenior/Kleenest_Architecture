export type IngestionStage = 'acquisition' | 'normalization' | 'persistence' | 'job_accounting';

export type IngestionError = {
  code: string;
  stage: IngestionStage;
  message: string;
  provider?: string;
  retryable?: boolean;
  details?: unknown;
};

export type IngestionResult = {
  ok: boolean;
  acquisition_status: 'success' | 'empty' | 'failed';
  persistence_status: 'succeeded' | 'not_started' | 'failed';
  job_status: 'completed' | 'failed';
  discovered: number;
  imported: number;
  updated: number;
  observations_upserted: number;
  errors: IngestionError[];
};

export function ingestionError(stage: IngestionStage, code: string, message: string, extra: Partial<IngestionError> = {}): IngestionError {
  return { code, stage, message, ...extra };
}

export function scheduledResult(input: Omit<IngestionResult, 'ok'>): IngestionResult {
  const ok = input.job_status === 'completed' && input.persistence_status === 'succeeded' && input.errors.length === 0;
  return { ok, ...input };
}

export function emptyAcquisitionResult(): Pick<IngestionResult, 'acquisition_status' | 'persistence_status' | 'job_status' | 'errors'> {
  return {
    acquisition_status: 'empty',
    persistence_status: 'succeeded',
    job_status: 'completed',
    errors: [],
  };
}
