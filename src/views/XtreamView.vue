<template>
  <div class="p-6 h-screen flex flex-col">
    <div class="flex items-center justify-between mb-6 flex-shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-stream-text">Xtream Codes</h1>
        <p v-if="currentSource" class="text-sm text-stream-text-muted mt-1">
          Source: {{ currentSource.name }}
        </p>
      </div>
    </div>

    <div v-if="!hasConfiguredSources" class="text-center py-12">
      <p class="text-stream-text-muted mb-4">
        No streaming sources configured. Add your Xtream Codes source to get started.
      </p>
      <p class="text-sm text-stream-text-muted">Go to Settings to configure your sources.</p>
    </div>

    <div v-else-if="isLoading" class="flex flex-col items-center justify-center py-12 space-y-4">
      <div class="w-12 h-12 border-4 border-stream-accent border-t-transparent rounded-full animate-spin"></div>
      <p class="text-stream-text-muted">Loading Xtream content...</p>
    </div>

    <div v-else-if="!hasCurrentSource" class="text-center py-12">
      <p class="text-stream-text-muted mb-4">
        Please select a source from the sidebar to view Xtream content.
      </p>
    </div>

    <div v-else-if="navigationError" class="text-center py-12">
      <p class="text-red-400 mb-4">{{ navigationError }}</p>
      <p class="text-stream-text-muted mb-4">The selected source may have been removed.</p>
    </div>

    <div v-else class="flex flex-col flex-1">
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="
              cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                selectedTab === tab.key
                  ? 'bg-stream-accent text-white'
                  : 'text-stream-text-muted hover:text-stream-text hover:bg-stream-accent/10',
              )
            "
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[240px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search content..."
              class="pl-9 pr-8 py-2 text-sm bg-stream-surface border border-stream-border rounded-md text-stream-text placeholder-stream-text-muted focus:outline-none focus:ring-2 focus:ring-stream-accent focus:border-transparent w-full"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stream-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-stream-text-muted hover:text-stream-text transition-colors"
              title="Clear search"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categoryOptions"
              :key="category.id"
              :class="
                cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  selectedCategoryId === category.id
                    ? 'bg-stream-accent text-white'
                    : 'text-stream-text-muted hover:text-stream-text hover:bg-stream-accent/10',
                )
              "
              @click="selectedCategoryId = category.id"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredItems.length === 0" class="text-center py-12">
        <p class="text-stream-text-muted">
          {{ searchQuery ? `No results for \"${searchQuery}\".` : 'No content available.' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <XtreamItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :title="item.name"
          :description="item.description"
          :thumbnail="item.thumbnail"
          :category="item.categoryName"
          :rating="item.rating"
          :badge="tabLabel"
          :action-label="item.actionLabel"
          @click="handleItemClick(item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { cn } from '@/utils/cn'
import { useNavigationStore } from '@/stores/navigation'
import { useStreamSourcesStore } from '@/stores/streamSources'
import { useNavigationService } from '@/services/navigationService'
import XtreamItemCard from '@/components/xtream/XtreamItemCard.vue'
import {
  XtreamCategoriesStorageV2,
  XtreamLiveStreamsStorageV2,
  XtreamVodStreamsStorageV2,
  XtreamSeriesStorageV2,
} from '@/services/indexedDb/xtreamStorageV2'
import { buildXtreamLiveUrl, buildXtreamVodUrl } from '@/services/xtream/xtreamUrlBuilder'
import type { XtreamCategory, XtreamCategoryType, XtreamLiveStream, XtreamVodStream, XtreamSeries } from '@/types/xtream'
import type { M3UMediaItem } from '@/types/stream'

type XtreamViewItem = {
  id: string
  name: string
  description?: string
  thumbnail?: string
  categoryId?: string
  categoryName?: string
  rating?: number
  sourceType: XtreamCategoryType
  actionLabel?: string
  raw: XtreamLiveStream | XtreamVodStream | XtreamSeries
}

const tabs: { key: XtreamCategoryType; label: string }[] = [
  { key: 'livestream', label: 'Live' },
  { key: 'vod', label: 'VOD' },
  { key: 'series', label: 'Series' },
]

const navigationStore = useNavigationStore()
const streamSourcesStore = useStreamSourcesStore()
const navigationService = useNavigationService()

const categoryStorage = new XtreamCategoriesStorageV2()
const liveStorage = new XtreamLiveStreamsStorageV2()
const vodStorage = new XtreamVodStreamsStorageV2()
const seriesStorage = new XtreamSeriesStorageV2()

const selectedTab = ref<XtreamCategoryType>('livestream')
const searchQuery = ref('')
const selectedCategoryId = ref('all')
const isLoading = ref(false)

const categoriesByType = ref<Record<XtreamCategoryType, XtreamCategory[]>>({
  livestream: [],
  vod: [],
  series: [],
})

const itemsByType = ref<{
  livestream: XtreamLiveStream[]
  vod: XtreamVodStream[]
  series: XtreamSeries[]
}>({
  livestream: [],
  vod: [],
  series: [],
})

const currentSource = computed(() => navigationStore.currentSource)
const hasConfiguredSources = computed(() => streamSourcesStore.sources.length > 0)
const hasCurrentSource = computed(() => !!navigationStore.currentSource)
const navigationError = computed(() => navigationStore.getNavigationError())
const tabLabel = computed(() => tabs.find((tab) => tab.key === selectedTab.value)?.label ?? '')

const categoryOptions = computed(() => {
  const categories = categoriesByType.value[selectedTab.value]
  return [
    { id: 'all', name: 'All' },
    ...categories.map((category) => ({
      id: category.categoryId,
      name: category.categoryName,
    })),
  ]
})

const categoryNameMap = computed(() => {
  const map = new Map<string, string>()
  categoriesByType.value[selectedTab.value].forEach((category) => {
    map.set(category.categoryId, category.categoryName)
  })
  return map
})

const buildViewItems = computed<XtreamViewItem[]>(() => {
  if (selectedTab.value === 'livestream') {
    return itemsByType.value.livestream.map((item) => ({
      id: item.id,
      name: item.name,
      thumbnail: item.streamIcon,
      categoryId: item.categoryId,
      categoryName: item.categoryId ? categoryNameMap.value.get(item.categoryId) : undefined,
      sourceType: 'livestream',
      actionLabel: 'Play',
      raw: item,
    }))
  }
  if (selectedTab.value === 'vod') {
    return itemsByType.value.vod.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.plot || item.genre,
      thumbnail: item.streamIcon,
      rating: item.rating,
      categoryId: item.categoryId,
      categoryName: item.categoryId ? categoryNameMap.value.get(item.categoryId) : undefined,
      sourceType: 'vod',
      actionLabel: 'Play',
      raw: item,
    }))
  }
  return itemsByType.value.series.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.plot || item.genre,
    thumbnail: item.cover,
    rating: item.rating,
    categoryId: item.categoryId,
    categoryName: item.categoryId ? categoryNameMap.value.get(item.categoryId) : undefined,
    sourceType: 'series',
    actionLabel: 'Unavailable',
    raw: item,
  }))
})

const filteredItems = computed(() => {
  const categoryFilter = selectedCategoryId.value
  const query = searchQuery.value.trim().toLowerCase()

  return buildViewItems.value.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter
    const matchesQuery = !query || item.name.toLowerCase().includes(query)
    return matchesCategory && matchesQuery
  })
})

const selectTab = (tab: XtreamCategoryType) => {
  selectedTab.value = tab
  selectedCategoryId.value = 'all'
  searchQuery.value = ''
}

const loadXtreamContent = async (sourceId: string) => {
  isLoading.value = true
  try {
    const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
      categoryStorage.getCategoriesBySourceAndType(sourceId, 'livestream'),
      categoryStorage.getCategoriesBySourceAndType(sourceId, 'vod'),
      categoryStorage.getCategoriesBySourceAndType(sourceId, 'series'),
    ])
    categoriesByType.value = {
      livestream: liveCategories,
      vod: vodCategories,
      series: seriesCategories,
    }

    const [liveStreams, vodStreams, seriesItems] = await Promise.all([
      liveStorage.getBySource(sourceId),
      vodStorage.getBySource(sourceId),
      seriesStorage.getBySource(sourceId),
    ])
    itemsByType.value = {
      livestream: liveStreams,
      vod: vodStreams,
      series: seriesItems,
    }
  } catch (error) {
    console.error('Failed to load Xtream content:', error)
  } finally {
    isLoading.value = false
  }
}

const handleItemClick = (item: XtreamViewItem) => {
  if (!currentSource.value) {
    return
  }
  if (item.sourceType === 'series') {
    alert('Series playback is not available yet.')
    return
  }

  let url = ''
  if (item.sourceType === 'livestream') {
    url = buildXtreamLiveUrl(currentSource.value, item.raw as XtreamLiveStream)
  }
  if (item.sourceType === 'vod') {
    url = buildXtreamVodUrl(currentSource.value, item.raw as XtreamVodStream)
  }

  const mediaItem: M3UMediaItem = {
    id: item.id,
    title: item.name,
    description: item.description || '',
    thumbnail: item.thumbnail || '',
    category: item.categoryName || '',
    url,
    type: item.sourceType === 'livestream' ? 'live' : 'vod',
    rating: item.rating,
  }

  navigationService.navigateToMediaDetail(mediaItem, currentSource.value.id)
}

watch(
  () => navigationStore.currentSourceId,
  (sourceId) => {
    if (sourceId) {
      loadXtreamContent(sourceId)
    }
  },
)

onMounted(() => {
  if (navigationStore.currentSourceId) {
    loadXtreamContent(navigationStore.currentSourceId)
  }
})
</script>
