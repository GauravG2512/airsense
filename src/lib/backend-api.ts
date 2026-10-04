const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

export interface BackendOlapResponse {
  operation: string;
  source_file: string;
  rows: number;
  returned_rows?: number;
  columns: string[];
  data: Array<Record<string, string | number | null>>;
}

export interface BackendFeaturesResponse {
  rows: number;
  returned_rows: number;
  columns: string[];
  data: Array<Record<string, string | number | null>>;
}

async function request<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `AirSense API ${response.status}: ${text}`
    );
  }

  return response.json();
}

export async function getOlapData(
  operation:
    | 'rollup'
    | 'drilldown'
    | 'slice'
    | 'dice'
    | 'pivot'
    | 'cube'
    | 'grouping_sets',
  limit = 200,
  offset = 0
): Promise<BackendOlapResponse> {
  return request<BackendOlapResponse>(
    `/api/olap?operation=${encodeURIComponent(operation)}&limit=${limit}&offset=${offset}`
  );
}

export async function getFeatures(
  limit = 200,
  offset = 0
): Promise<BackendFeaturesResponse> {
  return request<BackendFeaturesResponse>(
    `/api/features?limit=${limit}&offset=${offset}`
  );
}

export async function getAirHistory(
  limit = 200,
  offset = 0,
  city?: string
): Promise<{ data: Array<Record<string, string | number | null>> }> {
  const query = city ? `&city=${encodeURIComponent(city)}` : '';
  return request<{ data: Array<Record<string, string | number | null>> }>(
    `/api/air/history?limit=${limit}&offset=${offset}${query}`
  );
}

export async function getAnomalies(
  limit = 200,
  offset = 0
): Promise<{ data: Array<Record<string, string | number | null>> }> {
  return request<{ data: Array<Record<string, string | number | null>> }>(
    `/api/air/anomalies?limit=${limit}&offset=${offset}`
  );
}

export async function getClusters(
  limit = 200,
  offset = 0
): Promise<{ data: Array<Record<string, string | number | null>> }> {
  return request<{ data: Array<Record<string, string | number | null>> }>(
    `/api/air/clusters?limit=${limit}&offset=${offset}`
  );
}

export async function getWarehouseTables(): Promise<{ data: Array<Record<string, string | number | null>> }> {
  return request<{ data: Array<Record<string, string | number | null>> }>(
    '/api/warehouse/tables'
  );
}

export async function getWarehouseTable(
  schema: string,
  table: string,
  limit = 50,
  offset = 0
): Promise<{ schema: string; table: string; columns: string[]; data: Array<Record<string, string | number | null>> }> {
  return request<{ schema: string; table: string; columns: string[]; data: Array<Record<string, string | number | null>> }>(
    `/api/warehouse/table?schema=${encodeURIComponent(schema)}&table=${encodeURIComponent(table)}&limit=${limit}&offset=${offset}`
  );
}

export async function getDataQuality(
  limit = 100
): Promise<Record<string, Array<Record<string, string | number | null>>>> {
  return request<Record<string, Array<Record<string, string | number | null>>>>(
    `/api/data-quality?limit=${limit}`
  );
}
