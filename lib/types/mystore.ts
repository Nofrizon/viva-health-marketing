export interface Store {
  id: string
  store_id: string // e.g., VIVA-001
  name: string
  regional: string
  city: string
  rating: number
  address?: string
  created_at?: string
}

export interface StoreKeyword {
  id: string
  store_id: string
  keyword: string
  current_rank: number
  current_stars: number
  previous_stars?: number
  trend: 'up' | 'down' | 'stable'
  last_checked: string
  created_at?: string
}

export interface StoreWithKeywords extends Store {
  keywords: StoreKeyword[]
}

export interface TrackResult {
  keyword: string
  rank: number
  stars: number
  store_name: string
  timestamp: string
}