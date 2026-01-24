import { useStreamSourcesStore } from '@/stores/streamSources'
import { useMediaItemsStore } from '@/stores/mediaItems'
import { useNavigationService } from '@/services/navigationService'
import { INDEX_NAMES } from '@/constants/storage'
import {
  XtreamLiveStreamsStorageV2,
  XtreamVodStreamsStorageV2,
  XtreamSeriesStorageV2,
} from '@/services/indexedDb/xtreamStorageV2'
import { buildXtreamLiveUrl } from '@/services/xtream/xtreamUrlBuilder'
import type { XtreamLiveStream, XtreamVodStream, XtreamSeries } from '@/types/xtream'
import type { FavOrRecentlyItem, M3UMediaItem, StreamSource } from '@/types/stream'

export const useMediaClickHandler = () => {
  const streamSourcesStore = useStreamSourcesStore()
  const mediaItemsStore = useMediaItemsStore()
  const navigationService = useNavigationService()

  const xtreamLiveStorage = new XtreamLiveStreamsStorageV2()
  const xtreamVodStorage = new XtreamVodStreamsStorageV2()
  const xtreamSeriesStorage = new XtreamSeriesStorageV2()

  const findXtreamLiveStream = async (
    sourceId: string,
    itemId: string,
  ): Promise<XtreamLiveStream | null> => {
    const byId = await xtreamLiveStorage.getItemById(itemId)
    if (byId && byId.sourceId === sourceId) {
      return byId
    }

    const streamId = Number(itemId)
    if (!Number.isNaN(streamId)) {
      const candidates = await xtreamLiveStorage.loadItemsByIndex(
        INDEX_NAMES.XTREAM_LIVE_BY_STREAM_ID,
        streamId,
      )
      return candidates.find((item) => item.sourceId === sourceId) ?? null
    }

    return null
  }

  const findXtreamVodStream = async (
    sourceId: string,
    itemId: string,
  ): Promise<XtreamVodStream | null> => {
    const byId = await xtreamVodStorage.getItemById(itemId)
    if (byId && byId.sourceId === sourceId) {
      return byId
    }

    const streamId = Number(itemId)
    if (!Number.isNaN(streamId)) {
      const candidates = await xtreamVodStorage.loadItemsByIndex(
        INDEX_NAMES.XTREAM_VOD_BY_STREAM_ID,
        streamId,
      )
      return candidates.find((item) => item.sourceId === sourceId) ?? null
    }

    return null
  }

  const findXtreamSeries = async (
    sourceId: string,
    itemId: string,
  ): Promise<XtreamSeries | null> => {
    const byId = await xtreamSeriesStorage.getItemById(itemId)
    if (byId && byId.sourceId === sourceId) {
      return byId
    }

    const candidates = await xtreamSeriesStorage.loadItemsByIndex(
      INDEX_NAMES.XTREAM_SERIES_BY_SERIES_ID,
      itemId,
    )
    return candidates.find((item) => item.sourceId === sourceId) ?? null
  }

  const normalizeXtreamItemType = (
    type: FavOrRecentlyItem['type'],
  ): 'livestream' | 'vod' | 'series' | 'unknown' => {
    if (type === 'livestream' || type === 'live') return 'livestream'
    if (type === 'vod') return 'vod'
    if (type === 'series') return 'series'
    return 'unknown'
  }

  const buildXtreamLiveMediaItem = (
    source: StreamSource,
    stream: XtreamLiveStream,
  ): M3UMediaItem => {
    return {
      id: stream.id,
      title: stream.name,
      description: '',
      thumbnail: stream.streamIcon,
      category: '',
      url: buildXtreamLiveUrl(source, stream),
      type: 'live',
    }
  }

  const handleMediaClick = async (item: FavOrRecentlyItem): Promise<void> => {
    try {
      const source = streamSourcesStore.getSourceById(item.sourceId)
      if (!source) {
        console.warn('Stream source not found for favorite/recent entry:', item)
        alert('This source is no longer available.')
        return
      }

      if (source.type === 'm3u') {
        const media = await mediaItemsStore.getMediaItemById(item.sourceId, item.itemId)
        if (!media) {
          console.warn('M3U media item not found for favorite/recent entry:', item)
          alert('This item is no longer available in the current source.')
          return
        }

        console.log('Playing media:', media.title)
        if (media.type === 'live') {
          navigationService.navigateToChannelDetail(media, item.sourceId)
        } else {
          navigationService.navigateToMediaDetail(media, item.sourceId)
        }
        return
      }

      if (source.type === 'xtreamcode') {
        const kind = normalizeXtreamItemType(item.type)

        if (kind === 'vod') {
          const vod = await findXtreamVodStream(item.sourceId, item.itemId)
          if (!vod) {
            alert('This VOD is no longer available in the current source.')
            return
          }
          navigationService.navigateToXtreamVodDetail(vod.id)
          return
        }

        if (kind === 'series') {
          const series = await findXtreamSeries(item.sourceId, item.itemId)
          if (!series) {
            alert('This series is no longer available in the current source.')
            return
          }
          navigationService.navigateToXtreamSeriesDetail(series.id)
          return
        }

        if (kind === 'livestream') {
          const live = await findXtreamLiveStream(item.sourceId, item.itemId)
          if (!live) {
            alert('This live stream is no longer available in the current source.')
            return
          }
          const mediaItem = buildXtreamLiveMediaItem(source, live)
          navigationService.navigateToMediaDetail(mediaItem, item.sourceId)
          return
        }

        // Fallback: try to resolve by id/streamId across all Xtream stores
        const vod = await findXtreamVodStream(item.sourceId, item.itemId)
        if (vod) {
          navigationService.navigateToXtreamVodDetail(vod.id)
          return
        }

        const series = await findXtreamSeries(item.sourceId, item.itemId)
        if (series) {
          navigationService.navigateToXtreamSeriesDetail(series.id)
          return
        }

        const live = await findXtreamLiveStream(item.sourceId, item.itemId)
        if (live) {
          const mediaItem = buildXtreamLiveMediaItem(source, live)
          navigationService.navigateToMediaDetail(mediaItem, item.sourceId)
          return
        }

        alert('This item is no longer available in the current source.')
        return
      }

      alert('Unsupported source type.')
    } catch (error) {
      console.error('Failed to open media from favorite/recent entry:', error)
      alert('Failed to open this item. Please try again.')
    }
  }

  return { handleMediaClick }
}
