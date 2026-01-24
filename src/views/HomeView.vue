<template>
  <div class="p-6 space-y-8 min-h-full pb-20">
    <!-- Show setup if first time -->
    <SetupWelcome v-if="streamSourcesStore.sources.length === 0" @complete="handleSetupComplete" />

    <!-- Loading state -->
    <div v-else-if="isLoading" class="flex flex-col items-center justify-center py-12 space-y-4">
      <div class="w-12 h-12 border-4 border-stream-accent border-t-transparent rounded-full animate-spin"></div>
      <p class="text-stream-text-muted">Loading your content...</p>
    </div>

    <!-- Show home content if sources configured -->
    <template v-else>
      <!-- Header -->
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-stream-text">Home</h1>
        <p class="text-stream-text-muted">Wizju - Online IPTV Player.</p>
      </div>

      <!-- Resume Watching -->
      <CategorySection
        title="Resume watching"
        :items="resumeWatching"
        empty-message="No recent watching history. Start watching some content to see it here!"
        @item-click="handleMediaClick"
      />

      <!-- Favorites -->
      <CategorySection
        title="Favorites"
        :items="favorites"
        empty-message="No favorites yet. Add some content to your favorites from the media detail page!"
        @item-click="handleMediaClick"
      />

      <!-- Scroll Test Hint (Development Environment) -->
      <div v-if="isDev" class="mt-12 p-4 bg-stream-surface border border-stream-border rounded-lg">
        <h3 class="text-lg font-semibold text-stream-text mb-2">Scroll Test Area</h3>
        <p class="text-stream-text-muted mb-4">
          This section is added to test scrolling functionality. If you can see this and scroll to
          see content above/below, then scrolling is working correctly.
        </p>
        <div class="space-y-2">
          <div class="h-20 bg-stream-accent/10 rounded flex items-center justify-center">
            <span class="text-stream-accent">Test Content Block 1</span>
          </div>
          <div class="h-20 bg-stream-accent/10 rounded flex items-center justify-center">
            <span class="text-stream-accent">Test Content Block 2</span>
          </div>
          <div class="h-20 bg-stream-accent/10 rounded flex items-center justify-center">
            <span class="text-stream-accent">Test Content Block 3</span>
          </div>
        </div>
      </div>

      <!-- Message when no sources -->
      <div v-if="streamSourcesStore.sources.length === 0" class="text-center py-12 space-y-4">
        <h3 class="text-lg font-semibold text-stream-text">No streaming sources configured</h3>
        <p class="text-stream-text-muted">
          Add your first IPTV or M3U source to start watching content.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import CategorySection from '@/components/media/CategorySection.vue'
import SetupWelcome from '@/components/setup/SetupWelcome.vue'
import { useStreamSourcesStore } from '@/stores/streamSources'
import { useMediaItemsStore } from '@/stores/mediaItems'
import { useNavigationService } from '@/services/navigationService'
import { recentWatchingService } from '@/services/recentWatchingService'
import { favoritesService } from '@/services/favoritesService'
import { INDEX_NAMES } from '@/constants/storage'
import {
  XtreamLiveStreamsStorageV2,
  XtreamVodStreamsStorageV2,
  XtreamSeriesStorageV2,
} from '@/services/indexedDb/xtreamStorageV2'
import { buildXtreamLiveUrl } from '@/services/xtream/xtreamUrlBuilder'
import type { XtreamLiveStream, XtreamVodStream, XtreamSeries } from '@/types/xtream'
import type { FavOrRecentlyItem, M3UMediaItem, StreamSource } from '@/types/stream'

const streamSourcesStore = useStreamSourcesStore()
const mediaItemsStore = useMediaItemsStore()
const navigationService = useNavigationService()

// Development environment check
const isDev = import.meta.env.DEV

// Loading state
const isLoading = ref(false)

// Recent watching data and favorites data
const resumeWatching = ref<FavOrRecentlyItem[]>([])
const favorites = ref<FavOrRecentlyItem[]>([])

const xtreamLiveStorage = new XtreamLiveStreamsStorageV2()
const xtreamVodStorage = new XtreamVodStreamsStorageV2()
const xtreamSeriesStorage = new XtreamSeriesStorageV2()

// Load recent watching data
const loadRecentWatching = async () => {
  try {
    const recentItems = await recentWatchingService.loadRecentWatching()
    resumeWatching.value = recentItems
    console.log('Loaded recent watching items:', resumeWatching.value.length)
  } catch (error) {
    console.error('Failed to load recent watching items:', error)
    resumeWatching.value = []
  }
}

// Load favorites data
const loadFavorites = async () => {
  try {
    favorites.value = await favoritesService.getFavorites()
    console.log('Loaded favorites:', favorites.value.length)
  } catch (error) {
    console.error('Failed to load favorites:', error)
    favorites.value = []
  }
}

// Load all data
const loadAllData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      loadRecentWatching(),
      loadFavorites()
    ])
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

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

const findXtreamSeries = async (sourceId: string, itemId: string): Promise<XtreamSeries | null> => {
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

const normalizeXtreamItemType = (type: FavOrRecentlyItem['type']): 'livestream' | 'vod' | 'series' | 'unknown' => {
  if (type === 'livestream' || type === 'live') return 'livestream'
  if (type === 'vod') return 'vod'
  if (type === 'series') return 'series'
  return 'unknown'
}

const buildXtreamLiveMediaItem = (source: StreamSource, stream: XtreamLiveStream): M3UMediaItem => {
  return {
    id: stream.streamId.toString(),
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

const handleSetupComplete = (): void => {
  streamSourcesStore.setIsFirstTime(false)
}

// Load data when the component is mounted
onMounted(() => {
  loadAllData()
})

// Refresh data when the component is activated (e.g., returning from another page)
onActivated(() => {
  loadAllData()
})
</script>
