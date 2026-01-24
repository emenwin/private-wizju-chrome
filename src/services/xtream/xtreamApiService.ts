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
  rating?: string | number
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
  rating?: string | number
  rating_mpaa?: string
  backdrop_path?: string
  youtube_trailer?: string
  episode_run_time?: number
  category_id?: string
  tmdb_id?: number
}

interface XtreamSeriesInfoSeasonResponse {
  season_number?: number
  name?: string
  cover?: string
  cover_big?: string
  overview?: string
  air_date?: string
  episode_count?: number
}

interface XtreamSeriesInfoEpisodeResponse {
  id?: number
  episode_num?: number
  title?: string
  container_extension?: string
  info?: {
    tmdb_id?: number
    releasedate?: string
    plot?: string
    duration_secs?: number
    duration?: string
    movie_image?: string
    video?: any
    audio?: any
    bitrate?: number
    rating?: number
    season?: string
    [key: string]: any
  }
  custom_sid?: string
  added?: string
  season?: number
  direct_source?: string
}

interface XtreamSeriesInfoResponse {
  info?: XtreamSeriesResponse
  seasons?: XtreamSeriesInfoSeasonResponse[]
  episodes?: Record<string, XtreamSeriesInfoEpisodeResponse[]>
}

interface XtreamVodInfoResponse {
  info?: {
    kinopoisk_url?: string
    tmdb_id?: string
    name?: string
    o_name?: string
    original_name?: string
    cover_big?: string
    movie_image?: string
    releasedate?: string
    release_date?: string
    episode_run_time?: number
    youtube_trailer?: string
    director?: string
    actors?: string
    cast?: string
    description?: string
    plot?: string
    age?: string
    mpaa_rating?: string
    rating_count_kinopoisk?: number
    country?: string
    genre?: string
    backdrop_path?: string[]
    duration_secs?: number
    duration?: string
    bitrate?: number
    rating?: string | number
  }
  movie_data?: {
    stream_id?: number
    name?: string
    title?: string
    year?: string
    added?: string
    category_id?: string
    category_ids?: number[]
    container_extension?: string
    custom_sid?: string
    direct_source?: string
  }
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

const buildXtreamApiUrlWithParams = (
  baseUrl: string,
  username: string,
  password: string,
  action: string,
  params: Record<string, string | number | undefined>,
): string => {
  const url = new URL('/player_api.php', baseUrl)
  url.searchParams.set('username', username)
  url.searchParams.set('password', password)
  url.searchParams.set('action', action)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })
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
  fetchSeriesInfo: async (
    baseUrl: string,
    username: string,
    password: string,
    seriesId: string,
  ): Promise<XtreamSeriesInfoResponse> => {
    const url = buildXtreamApiUrlWithParams(baseUrl, username, password, 'get_series_info', {
      series_id: seriesId,
    })
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Xtream API request failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as XtreamSeriesInfoResponse
  },
  fetchVodInfo: async (
    baseUrl: string,
    username: string,
    password: string,
    vodId: number,
  ): Promise<XtreamVodInfoResponse> => {
    const url = buildXtreamApiUrlWithParams(baseUrl, username, password, 'get_vod_info', {
      vod_id: vodId,
    })
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Xtream API request failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as XtreamVodInfoResponse
  },
}

export type {
  XtreamCategoryResponse,
  XtreamLiveStreamResponse,
  XtreamVodStreamResponse,
  XtreamSeriesResponse,
  XtreamSeriesInfoResponse,
  XtreamSeriesInfoSeasonResponse,
  XtreamSeriesInfoEpisodeResponse,
  XtreamVodInfoResponse,
}
