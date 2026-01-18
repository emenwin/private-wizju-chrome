import type { XtreamCategoryType } from '@/types/xtream'

interface XtreamCategoryResponse {
  category_id?: string
  category_name?: string
  parent_id?: string
}

interface XtreamLiveStreamResponse {
  stream_id?: number
  name?: string
  stream_icon?: string
  epg_channel_id?: string
  tv_archive?: number
  tv_archive_duration?: number
  direct_source?: string
  custom_sid?: string
  category_id?: string
}

interface XtreamVodStreamResponse {
  stream_id?: number
  name?: string
  stream_icon?: string
  added?: string
  rating?: number
  rating_mpaa?: string
  container_extension?: string
  direct_source?: string
  custom_sid?: string
  tmdb_id?: number
  releaseDate?: string
  release_date?: string
  plot?: string
  cast?: string
  director?: string
  genre?: string
  backdrop_path?: string
  youtube_trailer?: string
  category_id?: string
}

interface XtreamSeriesResponse {
  series_id?: string
  name?: string
  cover?: string
  plot?: string
  cast?: string
  director?: string
  genre?: string
  releaseDate?: string
  release_date?: string
  last_modified?: string
  rating?: number
  rating_mpaa?: string
  backdrop_path?: string
  youtube_trailer?: string
  episode_run_time?: number
  category_id?: string
  tmdb_id?: number
}

const ACTIONS: Record<XtreamCategoryType, string> = {
  livestream: 'get_live_categories',
  vod: 'get_vod_categories',
  series: 'get_series_categories',
}

const STREAM_ACTIONS = {
  livestream: 'get_live_streams',
  vod: 'get_vod_streams',
  series: 'get_series',
} as const

const normalizeBaseUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!/^https?:\/\//.test(trimmed)) {
    throw new Error('Xtream URL must start with http:// or https://')
  }
  const parsed = new URL(trimmed)
  if (parsed.pathname.includes('player_api.php')) {
    parsed.pathname = parsed.pathname.replace(/\/?player_api\.php.*/, '')
    parsed.search = ''
  }
  return parsed.toString().replace(/\/$/, '')
}

const buildXtreamApiUrl = (
  baseUrl: string,
  username: string,
  password: string,
  action?: string,
): string => {
  const url = new URL('/player_api.php', baseUrl)
  url.searchParams.set('username', username)
  url.searchParams.set('password', password)
  if (action) {
    url.searchParams.set('action', action)
  }
  return url.toString()
}

const fetchXtreamJson = async <T>(
  baseUrl: string,
  username: string,
  password: string,
  action?: string,
): Promise<T> => {
  const url = buildXtreamApiUrl(baseUrl, username, password, action)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Xtream API request failed: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as T
}

export const xtreamApiService = {
  normalizeBaseUrl,
  fetchCategories: async (
    baseUrl: string,
    username: string,
    password: string,
    type: XtreamCategoryType,
  ): Promise<XtreamCategoryResponse[]> => {
    const action = ACTIONS[type]
    return fetchXtreamJson<XtreamCategoryResponse[]>(baseUrl, username, password, action)
  },
  fetchLiveStreams: async (
    baseUrl: string,
    username: string,
    password: string,
  ): Promise<XtreamLiveStreamResponse[]> => {
    return fetchXtreamJson<XtreamLiveStreamResponse[]>(
      baseUrl,
      username,
      password,
      STREAM_ACTIONS.livestream,
    )
  },
  fetchVodStreams: async (
    baseUrl: string,
    username: string,
    password: string,
  ): Promise<XtreamVodStreamResponse[]> => {
    return fetchXtreamJson<XtreamVodStreamResponse[]>(
      baseUrl,
      username,
      password,
      STREAM_ACTIONS.vod,
    )
  },
  fetchSeries: async (
    baseUrl: string,
    username: string,
    password: string,
  ): Promise<XtreamSeriesResponse[]> => {
    return fetchXtreamJson<XtreamSeriesResponse[]>(
      baseUrl,
      username,
      password,
      STREAM_ACTIONS.series,
    )
  },
}

export type {
  XtreamCategoryResponse,
  XtreamLiveStreamResponse,
  XtreamVodStreamResponse,
  XtreamSeriesResponse,
}
