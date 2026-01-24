/**
 * Media source type
 * Supports M3U playlists, Xtream Codes API, and Emby server
 */
import type { XtreamCategoryType } from './xtream'

export type MediaSourceType = 'm3u' | 'xtreamcode' | 'emby'

export interface StreamSource {
  readonly id: string
  readonly name: string
  readonly url: string
  readonly type: MediaSourceType
  readonly username?: string
  readonly password?: string
  readonly dateAdded: string
  readonly isActive: boolean
  readonly categories: string[]
}

export interface M3UMediaItem {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly thumbnail?: string
  readonly duration?: string
  readonly category: string
  readonly url: string
  readonly type: 'live' | 'vod' | 'series'
  readonly genre?: string
  readonly year?: number
  readonly rating?: number
  readonly timeRemaining?: string
  readonly tvgName?: string
  readonly groupTitle?: string
}

/**
 * Type field used by favorites / resume-watching items.
 *
 * - For M3U sources: uses `M3UMediaItem['type']` ('live' | 'vod' | 'series')
 * - For Xtream sources: uses `XtreamCategoryType` ('livestream' | 'vod' | 'series')
 * - Legacy/compat: may still contain `MediaSourceType` values
 */
export type FavOrRecentItemType = MediaSourceType | M3UMediaItem['type'] | XtreamCategoryType

// Channel is an alias for M3UMediaItem, the type is exactly the same
export type Channel = M3UMediaItem

export interface M3UCategory {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly count: number
}

export type CreateStreamSource = Omit<StreamSource, 'id' | 'dateAdded'>

export type CreateStreamSourceInput = Omit<StreamSource, 'id' | 'dateAdded' | 'categories'>

export interface FavOrRecentlyItem {
  readonly id: string
  readonly itemId: string // Reference to the original media item ID
  readonly sourceId: string // Associated StreamSource ID
  readonly type: FavOrRecentItemType
  readonly dateAdded: string

  // Essential fields for display (copied from media item)
  readonly title: string
  readonly description?: string
  readonly thumbnail?: string
  readonly duration?: string
  readonly category: string
  readonly tvgName?: string
  readonly groupTitle?: string

  // Optional fields for richer display
  readonly year?: number
  readonly rating?: number
}
