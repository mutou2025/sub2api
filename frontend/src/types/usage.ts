export interface UsageLog {
    id: number
    user_id: number
    api_key_id: number
    model: string
    total_tokens: number
    input_tokens: number
    output_tokens: number
    total_cost: number        // Standard cost
    actual_cost: number       // Billed cost (with multiplier)
    duration_ms: number
    first_token_ms: number | null
    stream: boolean
    user_agent: string
    cache_read_tokens: number
    cache_creation_tokens: number
    created_at: string
    api_key?: {
        id: number
        name: string
    }
}

export interface UsageStats {
    total_requests: number
    total_tokens: number
    total_input_tokens: number
    total_output_tokens: number
    total_cost: number
    total_actual_cost: number
    average_duration_ms: number
}

export interface UsageQueryParams {
    page?: number
    page_size?: number
    start_date?: string
    end_date?: string
    api_key_id?: number
}

export interface UserDashboardStats {
    total_requests: number
    total_cost: number
    total_tokens: number
    request_count_trend: number // Percentage change or similar
    cost_trend: number
}

export interface TrendDataPoint {
    date: string
    requests: number
    cost: number
    tokens: number
}

export interface ModelStat {
    model: string
    total_requests: number
    total_cost: number
    total_tokens: number
}

export interface DashboardTrendResponse {
    trend: TrendDataPoint[]
}

export interface DashboardModelsResponse {
    models: ModelStat[]
}
