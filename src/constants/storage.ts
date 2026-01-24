/**
 * Storage Constants
 *
 * Centralized storage-related constants used across the application.
 * This includes IndexedDB store names, localStorage keys, and database configurations.
 */

/**
 * IndexedDB Configuration
 */
export const INDEXEDDB_CONFIG = {
  /** Database name */
  DB_NAME: 'WizjuIPTVDB',
  /** Database version */
  DB_VERSION: 3,
} as const

// Export shorthand for convenience
export const { DB_NAME, DB_VERSION } = INDEXEDDB_CONFIG

/**
 * IndexedDB Object Store Names
 */
export const STORE_NAMES = {
  /** Stream sources store */
  STREAM_SOURCES: 'streamSources',
  /** Media items store (M3U media items) */
  MEDIA_ITEMS: 'm3uMediaItems',
  /** Xtream categories store */
  XTREAM_CATEGORIES: 'xtreamCategories',
  /** Xtream live streams store */
  XTREAM_LIVE_STREAMS: 'xtreamLiveStreams',
  /** Xtream VOD streams store */
  XTREAM_VOD_STREAMS: 'xtreamVodStreams',
  /** Xtream VOD info store */
  XTREAM_VOD_INFO: 'xtreamVodInfo',
  /** Xtream series store */
  XTREAM_SERIES: 'xtreamSeries',
  /** Xtream episodes store */
  XTREAM_EPISODES: 'xtreamEpisodes',
  /** Favorites store */
  FAVORITES: 'favorites',
  /** Recent watching history store */
  RECENT_WATCHING: 'recentWatching',
} as const

/**
 * IndexedDB Index Names
 */
export const INDEX_NAMES = {
  // StreamSources indexes
  STREAM_SOURCES_BY_DATE_ADDED: 'by-dateAdded',
  STREAM_SOURCES_BY_IS_ACTIVE: 'by-isActive',

  // MediaItems indexes
  MEDIA_ITEMS_BY_SOURCE_ID: 'by-sourceId',
  MEDIA_ITEMS_BY_DATE_ADDED: 'by-dateAdded',
  MEDIA_ITEMS_BY_CATEGORY_NUM: 'by-category_num',
  MEDIA_ITEMS_BY_TYPE: 'by-type',
  MEDIA_ITEMS_BY_SOURCE_AND_CATEGORY: 'by-sourceId-and-category_num',
  MEDIA_ITEMS_BY_SOURCE_AND_TYPE: 'by-sourceId-and-type',

  // Xtream categories indexes
  XTREAM_CATEGORIES_BY_SOURCE_ID: 'by-sourceId',
  XTREAM_CATEGORIES_BY_SOURCE_AND_TYPE: 'by-sourceId-and-type',
  XTREAM_CATEGORIES_BY_SOURCE_AND_CATEGORY_ID: 'by-sourceId-and-categoryId',

  // Xtream live streams indexes
  XTREAM_LIVE_BY_SOURCE_ID: 'by-sourceId',
  XTREAM_LIVE_BY_SOURCE_AND_CATEGORY_ID: 'by-sourceId-and-categoryId',
  XTREAM_LIVE_BY_STREAM_ID: 'by-streamId',

  // Xtream VOD streams indexes
  XTREAM_VOD_BY_SOURCE_ID: 'by-sourceId',
  XTREAM_VOD_BY_SOURCE_AND_CATEGORY_ID: 'by-sourceId-and-categoryId',
  XTREAM_VOD_BY_STREAM_ID: 'by-streamId',

  // Xtream VOD info indexes
  XTREAM_VOD_INFO_BY_SOURCE_ID: 'by-sourceId',
  XTREAM_VOD_INFO_BY_VOD_ID: 'by-vodId',
  XTREAM_VOD_INFO_BY_SOURCE_AND_VOD_ID: 'by-sourceId-and-vodId',

  // Xtream series indexes
  XTREAM_SERIES_BY_SOURCE_ID: 'by-sourceId',
  XTREAM_SERIES_BY_SOURCE_AND_CATEGORY_ID: 'by-sourceId-and-categoryId',
  XTREAM_SERIES_BY_SERIES_ID: 'by-seriesId',

  // Xtream episodes indexes
  XTREAM_EPISODES_BY_SERIES_ID: 'by-seriesId',
  XTREAM_EPISODES_BY_SERIES_AND_SEASON: 'by-seriesId-and-seasonNum',

  // Favorites indexes
  FAVORITES_BY_SOURCE_ID: 'by-sourceId',
  FAVORITES_BY_DATE_ADDED: 'by-dateAdded',
  FAVORITES_BY_ITEM_AND_SOURCE: 'by-itemId-and-sourceId',

  // RecentWatching indexes
  RECENT_WATCHING_BY_SOURCE_ID: 'by-sourceId',
  RECENT_WATCHING_BY_WATCHED_AT: 'by-watchedAt',
  RECENT_WATCHING_BY_ITEM_AND_SOURCE: 'by-itemId-and-sourceId',
} as const

/**
 * LocalStorage Keys (Legacy)
 * Used for backward compatibility and migration
 */
export const LOCALSTORAGE_KEYS = {
  /** Legacy stream sources key */
  STREAM_SOURCES: 'Wizju_sources',
  /** Legacy media items key prefix (actual key is Wizju_media_items_{sourceId}) */
  MEDIA_ITEMS_PREFIX: 'Wizju_media_items_',
  /** Legacy favorites key */
  FAVORITES: 'Wizju_favorites',
  /** Legacy recent watching key */
  RECENT_WATCHING: 'Wizju_recent_watching',
} as const

/**
 * Chrome Storage Keys
 * Used for Chrome extension storage (chrome.storage.local)
 */
export const CHROME_STORAGE_KEYS = {
  /** Stream sources key */
  STREAM_SOURCES: 'Wizju_sources',
  /** Media items key prefix (actual key is Wizju_media_items_{sourceId}) */
  MEDIA_ITEMS_PREFIX: 'Wizju_media_items_',
  /** Favorites key */
  FAVORITES: 'Wizju_favorites',
  /** Recent watching key */
  RECENT_WATCHING: 'Wizju_recent_watching',
} as const

/**
 * Migration-related LocalStorage Keys
 */
export const MIGRATION_KEYS = {
  /** Migration status key (for localStorage) */
  STATUS: 'wizju-migration-status',
  /** Migration backup key (for localStorage) */
  BACKUP: 'wizju-migration-backup',
  /** Chrome storage migration status key */
  CHROME_STATUS: 'wizju-chrome-migration-status',
  /** Chrome storage migration backup key */
  CHROME_BACKUP: 'wizju-chrome-migration-backup',
} as const

/**
 * Type-safe store name type
 */
export type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES]

/**
 * Type-safe index name type
 */
export type IndexName = (typeof INDEX_NAMES)[keyof typeof INDEX_NAMES]

/**
 * Type-safe localStorage key type
 */
export type LocalStorageKey = (typeof LOCALSTORAGE_KEYS)[keyof typeof LOCALSTORAGE_KEYS]

/**
 * Type-safe migration key type
 */
export type MigrationKey = (typeof MIGRATION_KEYS)[keyof typeof MIGRATION_KEYS]

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  /** VOD info cache expiry in hours */
  VOD_INFO_CACHE_EXPIRY_HOURS: 24,
} as const

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  /** Scroll threshold for header changes in pixels */
  HEADER_SCROLL_THRESHOLD: 50,
  /** Animation duration for fade in effects in milliseconds */
  FADE_IN_DURATION_MS: 800,
  /** Animation delay for staggered effects in milliseconds */
  STAGGER_DELAY_MS: 100,
  /** Video player initialization timeout in milliseconds */
  VIDEO_INIT_TIMEOUT_MS: 100,
} as const

// Export shorthand for convenience
export const { VOD_INFO_CACHE_EXPIRY_HOURS } = CACHE_CONFIG
export const {
  HEADER_SCROLL_THRESHOLD,
  FADE_IN_DURATION_MS,
  STAGGER_DELAY_MS,
  VIDEO_INIT_TIMEOUT_MS,
} = UI_CONFIG
