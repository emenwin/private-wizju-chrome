import { xtreamApiService } from './xtreamApiService'
import {
  XtreamCategoriesStorageV2,
  XtreamLiveStreamsStorageV2,
  XtreamVodStreamsStorageV2,
  XtreamSeriesStorageV2,
} from '@/services/indexedDb/xtreamStorageV2'
import type {
  CreateXtreamCategory,
  CreateXtreamLiveStream,
  CreateXtreamVodStream,
  CreateXtreamSeries,
  XtreamCategoryType,
} from '@/types/xtream'

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }
  return chunks
}

const importCategories = async (
  sourceId: string,
  baseUrl: string,
  username: string,
  password: string,
  type: XtreamCategoryType,
  categoryStorage: XtreamCategoriesStorageV2,
): Promise<void> => {
  const categories = await xtreamApiService.fetchCategories(baseUrl, username, password, type)
  const mapped: CreateXtreamCategory[] = categories.map((category) => ({
    sourceId,
    categoryId: category.category_id ? String(category.category_id) : '0',
    categoryName: category.category_name || 'Unknown',
    type,
    parentCategoryId: category.parent_id ? String(category.parent_id) : undefined,
  }))
  for (const chunk of chunkArray(mapped, 500)) {
    await categoryStorage.addItems(chunk)
  }
}

export const xtreamImportService = {
  async importSource(sourceId: string, url: string, username: string, password: string) {
    const baseUrl = xtreamApiService.normalizeBaseUrl(url)
    const categoryStorage = new XtreamCategoriesStorageV2()
    const liveStorage = new XtreamLiveStreamsStorageV2()
    const vodStorage = new XtreamVodStreamsStorageV2()
    const seriesStorage = new XtreamSeriesStorageV2()

    await categoryStorage.clearBySource(sourceId)
    await liveStorage.clearBySource(sourceId)
    await vodStorage.clearBySource(sourceId)
    await seriesStorage.clearBySource(sourceId)

    await importCategories(sourceId, baseUrl, username, password, 'livestream', categoryStorage)
    await importCategories(sourceId, baseUrl, username, password, 'vod', categoryStorage)
    await importCategories(sourceId, baseUrl, username, password, 'series', categoryStorage)

    const liveStreams = await xtreamApiService.fetchLiveStreams(baseUrl, username, password)
    const mappedLive: CreateXtreamLiveStream[] = liveStreams.map((stream) => ({
      sourceId,
      categoryId: stream.category_id ? String(stream.category_id) : undefined,
      streamId: stream.stream_id || 0,
      name: stream.name || 'Unknown',
      streamIcon: stream.stream_icon || undefined,
      epgChannelId: stream.epg_channel_id || undefined,
      tvArchive: stream.tv_archive || 0,
      tvArchiveDuration: stream.tv_archive_duration || 0,
      directSource: stream.direct_source || undefined,
      customSid: stream.custom_sid || undefined,
    }))
    for (const chunk of chunkArray(mappedLive, 500)) {
      await liveStorage.addItems(chunk)
    }

    const vodStreams = await xtreamApiService.fetchVodStreams(baseUrl, username, password)
    const mappedVod: CreateXtreamVodStream[] = vodStreams.map((stream) => ({
      sourceId,
      categoryId: stream.category_id ? String(stream.category_id) : undefined,
      streamId: stream.stream_id || 0,
      name: stream.name || 'Unknown',
      streamIcon: stream.stream_icon || undefined,
      added: stream.added || undefined,
      rating: stream.rating || undefined,
      ratingMpaa: stream.rating_mpaa || undefined,
      containerExtension: stream.container_extension || undefined,
      directSource: stream.direct_source || undefined,
      customSid: stream.custom_sid || undefined,
      tmdbId: stream.tmdb_id || undefined,
      releaseDate: stream.releaseDate || stream.release_date || undefined,
      plot: stream.plot || undefined,
      cast: stream.cast || undefined,
      director: stream.director || undefined,
      genre: stream.genre || undefined,
      backdrop: stream.backdrop_path || undefined,
      youtubeTrailer: stream.youtube_trailer || undefined,
    }))
    for (const chunk of chunkArray(mappedVod, 500)) {
      await vodStorage.addItems(chunk)
    }

    const seriesList = await xtreamApiService.fetchSeries(baseUrl, username, password)
    const mappedSeries: CreateXtreamSeries[] = seriesList.map((series) => ({
      sourceId,
      seriesId: series.series_id ? String(series.series_id) : '0',
      name: series.name || 'Unknown',
      cover: series.cover || undefined,
      plot: series.plot || undefined,
      cast: series.cast || undefined,
      director: series.director || undefined,
      genre: series.genre || undefined,
      releaseDate: series.releaseDate || series.release_date || undefined,
      lastModified: series.last_modified || undefined,
      rating: series.rating || undefined,
      ratingMpaa: series.rating_mpaa || undefined,
      backdrop: series.backdrop_path || undefined,
      youtubeTrailer: series.youtube_trailer || undefined,
      episodeRunTime: series.episode_run_time || undefined,
      categoryId: series.category_id ? String(series.category_id) : undefined,
      tmdbId: series.tmdb_id || undefined,
    }))
    for (const chunk of chunkArray(mappedSeries, 500)) {
      await seriesStorage.addItems(chunk)
    }
  },
}
