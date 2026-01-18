import { ref, computed, onMounted, watch } from 'vue'
import { useNavigationStore } from '@/stores/navigation'
import { useStreamSourcesStore } from '@/stores/streamSources'
import { useNavigationService } from '@/services/navigationService'
import {
  XtreamCategoriesStorageV2,
  XtreamLiveStreamsStorageV2,
  XtreamVodStreamsStorageV2,
  XtreamSeriesStorageV2,
} from '@/services/indexedDb/xtreamStorageV2'
import { buildXtreamLiveUrl } from '@/services/xtream/xtreamUrlBuilder'
import type {
  XtreamCategory,
  XtreamCategoryType,
  XtreamLiveStream,
  XtreamVodStream,
  XtreamSeries,
} from '@/types/xtream'
import type { M3UMediaItem } from '@/types/stream'

export type XtreamViewItem = {
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

export const useXtreamView = () => {
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
  const currentPage = ref(1)
  const pageSize = ref(48)

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

  const pagedItems = computed(() => {
    const visibleCount = currentPage.value * pageSize.value
    return filteredItems.value.slice(0, visibleCount)
  })

  const canLoadMore = computed(() => filteredItems.value.length > pagedItems.value.length)

  const loadMore = () => {
    if (canLoadMore.value) {
      currentPage.value += 1
    }
  }

  const selectTab = (tab: XtreamCategoryType) => {
    selectedTab.value = tab
    selectedCategoryId.value = 'all'
    searchQuery.value = ''
    currentPage.value = 1
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
      currentPage.value = 1
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
    let url = ''
    if (item.sourceType === 'livestream') {
      url = buildXtreamLiveUrl(currentSource.value, item.raw as XtreamLiveStream)
    }
    if (item.sourceType === 'vod') {
      navigationService.navigateToXtreamVodDetail(item.id)
      return
    }
    if (item.sourceType === 'series') {
      navigationService.navigateToXtreamSeriesDetail(item.id)
      return
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

  watch([selectedTab, searchQuery, selectedCategoryId], () => {
    currentPage.value = 1
  })

  onMounted(() => {
    if (navigationStore.currentSourceId) {
      loadXtreamContent(navigationStore.currentSourceId)
    }
  })

  return {
    tabs,
    selectedTab,
    searchQuery,
    selectedCategoryId,
    isLoading,
    currentSource,
    hasConfiguredSources,
    hasCurrentSource,
    navigationError,
    tabLabel,
    categoryOptions,
    filteredItems,
    pagedItems,
    canLoadMore,
    selectTab,
    loadMore,
    handleItemClick,
  }
}
