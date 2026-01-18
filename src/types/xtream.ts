export type XtreamCategoryType = 'livestream' | 'vod' | 'series'

export interface XtreamCategory {
  readonly id: string
  readonly sourceId: string
  readonly categoryId: string
  readonly categoryName: string
  readonly type: XtreamCategoryType
  readonly parentCategoryId?: string
  readonly dateAdded: string
}

export interface XtreamLiveStream {
  readonly id: string
  readonly sourceId: string
  readonly categoryId?: string
  readonly streamId: number
  readonly name: string
  readonly streamIcon?: string
  readonly epgChannelId?: string
  readonly tvArchive: number
  readonly tvArchiveDuration: number
  readonly directSource?: string
  readonly customSid?: string
  readonly dateAdded: string
}

export interface XtreamVodStream {
  readonly id: string
  readonly sourceId: string
  readonly categoryId?: string
  readonly streamId: number
  readonly name: string
  readonly streamIcon?: string
  readonly added?: string
  readonly rating?: number
  readonly ratingMpaa?: string
  readonly containerExtension?: string
  readonly directSource?: string
  readonly customSid?: string
  readonly tmdbId?: number
  readonly releaseDate?: string
  readonly plot?: string
  readonly cast?: string
  readonly director?: string
  readonly genre?: string
  readonly backdrop?: string
  readonly youtubeTrailer?: string
  readonly dateAdded: string
}

export interface XtreamSeries {
  readonly id: string
  readonly sourceId: string
  readonly seriesId: string
  readonly name: string
  readonly cover?: string
  readonly plot?: string
  readonly cast?: string
  readonly director?: string
  readonly genre?: string
  readonly releaseDate?: string
  readonly lastModified?: string
  readonly rating?: number
  readonly ratingMpaa?: string
  readonly backdrop?: string
  readonly youtubeTrailer?: string
  readonly episodeRunTime?: number
  readonly categoryId?: string
  readonly tmdbId?: number
  readonly dateAdded: string
}

export interface XtreamEpisode {
  readonly id: string
  readonly seriesId: string
  readonly episodeNum: number
  readonly seasonNum: number
  readonly title?: string
  readonly containerExtension?: string
  readonly info?: string
  readonly customSid?: string
  readonly added?: string
  readonly directSource?: string
  readonly dateAdded: string
}

export type CreateXtreamCategory = Omit<XtreamCategory, 'id' | 'dateAdded'>
export type CreateXtreamLiveStream = Omit<XtreamLiveStream, 'id' | 'dateAdded'>
export type CreateXtreamVodStream = Omit<XtreamVodStream, 'id' | 'dateAdded'>
export type CreateXtreamSeries = Omit<XtreamSeries, 'id' | 'dateAdded'>
export type CreateXtreamEpisode = Omit<XtreamEpisode, 'id' | 'dateAdded'>
