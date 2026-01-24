<template>
  <div class="min-h-screen bg-background">
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 space-y-4">
      <div
        class="w-12 h-12 border-4 border-stream-accent border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="text-stream-text-muted">Loading series details...</p>
    </div>

    <div v-else-if="!series" class="text-center py-12">
      <h2 class="text-xl font-semibold text-stream-text mb-4">Series not found</h2>
      <Button @click="navigationService.goBack()" variant="outline">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Go Back
      </Button>
    </div>

    <div v-else>
      <!-- Hero Section with Backdrop -->
      <div class="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <!-- Backdrop Image -->
        <div class="absolute inset-0 bg-cover bg-center" :style="backdropStyle">
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
          />
          <div
            class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent"
          />
          <div
            class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
          />
        </div>

        <!-- Content -->
        <div
          class="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12 md:pb-16"
        >
          <!-- Back Button -->
          <div class="absolute top-4 left-4 z-10">
            <Button
              @click="navigationService.goBack()"
              variant="ghost"
              size="icon"
              class="rounded-full w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10"
              title="Go Back"
            >
              <ArrowLeft class="w-5 h-5" />
            </Button>
          </div>

          <div class="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
            <!-- Poster -->
            <div class="hidden md:block flex-shrink-0">
              <div
                class="w-48 lg:w-56 h-72 lg:h-80 bg-cover bg-center rounded-lg shadow-2xl border border-border/20"
                :style="posterStyle"
              ></div>
            </div>

            <!-- Info -->
            <div class="flex-1 space-y-4">
              <h1
                class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-balance"
                style="text-shadow: 0 0 10px rgba(0, 0, 0, 0.8)"
              >
                {{ series.name }}
              </h1>

              <div class="flex flex-wrap items-center gap-4 text-sm">
                <div class="flex items-center gap-1.5">
                  <Star class="w-5 h-5 fill-primary text-primary" />
                  <span
                    class="text-lg font-semibold text-white"
                    style="text-shadow: 0 0 10px rgba(0, 0, 0, 0.8)"
                    >{{ series.rating }}/10</span
                  >
                  <span class="text-white/80" style="text-shadow: 0 0 10px rgba(0, 0, 0, 0.8)"
                    >({{ series.rating ? '1 rating' : 'No ratings' }})</span
                  >
                </div>

                <span class="text-white/80" style="text-shadow: 0 0 10px rgba(0, 0, 0, 0.8)">{{
                  series.releaseDate
                }}</span>
                <span class="text-white/80" style="text-shadow: 0 0 10px rgba(0, 0, 0, 0.8)"
                  >{{ seasonOptions.length }} Seasons</span
                >
                <span class="text-white/80" style="text-shadow: 0 0 10px rgba(0, 0, 0, 0.8)"
                  >Ongoing</span
                >
              </div>

              <div class="flex flex-wrap gap-2">
                <span
                  class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Series
                </span>
                <span
                  v-if="series.genre"
                  class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  {{ series.genre }}
                </span>
              </div>

              <p
                class="text-base text-white/90 max-w-3xl leading-relaxed text-pretty"
                style="text-shadow: 0 0 10px rgba(0, 0, 0, 0.8)"
              >
                {{ series.plot }}
              </p>

              <div class="flex flex-wrap gap-3 pt-2">
                <Button size="lg" class="gap-2" @click="playFirstEpisode">
                  <Play class="w-5 h-5" />
                  Play S1 E1
                </Button>
                <!-- <Button size="lg" variant="outline" class="gap-2 bg-transparent">
                  <Plus class="w-5 h-5" />
                  My List
                </Button>
                <Button size="lg" variant="outline" class="gap-2 bg-transparent">
                  <ThumbsUp class="w-5 h-5" />
                  Rate
                </Button> -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Episodes Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <XtreamSeasonsCard
          :season-options="seasonOptions"
          :selected-season="selectedSeason"
          @select-season="selectSeason"
        />
        <XtreamEpisodesCard
          :episodes-for-selected-season="episodesForSelectedSeason"
          :selected-episode="selectedEpisode"
          @select-episode="selectEpisode"
        />
      </div>
    </div>
  </div>

  <!-- Video Player Modal -->
  <Teleport to="body">
    <div v-if="isPlayerOpen" class="fixed inset-0 z-50 bg-black/90" @click.self="closePlayer">
      <div class="relative h-full w-full flex flex-col">
        <div
          class="flex items-start justify-between gap-4 px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        >
          <div class="min-w-0">
            <p class="text-white font-semibold truncate">{{ series?.name }}</p>
            <p class="text-white/70 text-sm truncate">{{ playerEpisodeTitle }}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="text-white hover:bg-white/15"
            title="Close"
            @click="closePlayer"
          >
            <X class="w-5 h-5" />
          </Button>
        </div>

        <div class="flex-1 px-4 pb-4">
          <div class="h-full w-full max-w-6xl mx-auto flex flex-col justify-center">
            <div id="video-container" class="w-full aspect-video rounded-lg overflow-hidden bg-black">
              <video ref="videoPlayer" class="video-js vjs-big-play-centered w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Play, Star, Plus, ThumbsUp, X } from 'lucide-vue-next'
import Button from '@/components/ui/UiButton.vue'
import XtreamSeasonsCard from './components/XtreamSeasonsCard.vue'
import XtreamEpisodesCard from './components/XtreamEpisodesCard.vue'
import { useStreamSourcesStore } from '@/stores/streamSources'
import { useNavigationService } from '@/services/navigationService'
import {
  XtreamSeriesStorageV2,
  XtreamSeriesInfoStorageV2,
} from '@/services/indexedDb/xtreamStorageV2'
import { buildXtreamSeriesEpisodeUrl } from '@/services/xtream/xtreamUrlBuilder'
import { xtreamApiService } from '@/services/xtream/xtreamApiService'
import type { XtreamSeries } from '@/types/xtream'
import type { StreamSource } from '@/types/stream'
import type { XtreamSeriesInfoResponse } from '@/services/xtream/xtreamApiService'
import {
  BACKDROP_HEIGHT,
  POSTER_ASPECT_RATIO,
  VIDEO_MAX_HEIGHT,
  SECTION_PADDING,
  CARD_PADDING,
  EPISODE_PADDING,
  GAP_SMALL,
  GAP_MEDIUM,
  GAP_LARGE,
  GAP_EXTRA_LARGE,
  BORDER_RADIUS_SMALL,
  BORDER_RADIUS_MEDIUM,
  BORDER_RADIUS_LARGE,
  SHADOW_SMALL,
  SHADOW_MEDIUM,
  SHADOW_LARGE,
  BACKDROP_GRADIENT,
  OVERLAY_GRADIENT,
  TRANSITION_DURATION,
  HOVER_SCALE,
  HOVER_SHADOW,
  TITLE_SIZE,
  SUBTITLE_SIZE,
  BODY_SIZE,
  SMALL_SIZE,
  EXTRA_SMALL_SIZE,
  ACCENT_COLOR,
  SURFACE_COLOR,
  BORDER_COLOR,
  TEXT_COLOR,
  TEXT_MUTED_COLOR,
  BUTTON_VARIANT_OUTLINE,
  BUTTON_VARIANT_SELECTED,
  BUTTON_GRADIENT_PRIMARY,
  BUTTON_HOVER_ACCENT,
} from '@/constants/ui'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@videojs/http-streaming'

type SeriesEpisode = {
  id: number
  episodeNum?: number
  title?: string
  containerExtension?: string
  info?: {
    plot?: string
    duration?: string
    releasedate?: string
    movie_image?: string
    rating?: number
    [key: string]: any
  }
  directSource?: string
}

type SeasonOption = {
  seasonNumber: number
  name?: string
  cover?: string
  overview?: string
  airDate?: string
  episodeCount?: number
}

const route = useRoute()
const navigationService = useNavigationService()
const streamSourcesStore = useStreamSourcesStore()
const seriesStorage = new XtreamSeriesStorageV2()
const seriesInfoStorage = new XtreamSeriesInfoStorageV2()

const series = ref<XtreamSeries | null>(null)
const source = ref<StreamSource | null>(null)
const seriesInfo = ref<XtreamSeriesInfoResponse | null>(null)
const isLoading = ref(false)
const isPlaying = ref(false)
const imageLoadError = ref(false)
const videoPlayer = ref<HTMLVideoElement | null>(null)
const selectedSeason = ref<number | null>(null)
const selectedEpisode = ref<SeriesEpisode | null>(null)
const lastPlayedEpisodeId = ref<number | null>(null)
const activeTab = ref('episodes')
let player: ReturnType<typeof videojs> | null = null

const isPlayerOpen = computed(() => isPlaying.value && !!selectedEpisode.value)

const playerEpisodeTitle = computed(() => {
  const episode = selectedEpisode.value
  if (!episode) return ''
  const season = selectedSeason.value
  const episodeNumber = episode.episodeNum || episode.id
  if (season) return `S${season} · E${episodeNumber}${episode.title ? ` · ${episode.title}` : ''}`
  return `E${episodeNumber}${episode.title ? ` · ${episode.title}` : ''}`
})

const seriesId = computed(() => String(route.params.id || ''))

const backdropStyle = computed(() => {
  const backdrop = series.value?.backdrop || series.value?.cover
  if (!backdrop) {
    return 'background: radial-gradient(circle at top, #1f2937, #0f172a);'
  }
  return `background-image: url(${backdrop});`
})

const posterStyle = computed(() => {
  const poster = series.value?.cover
  if (!poster) {
    return 'background: #374151;'
  }
  return `background-image: url(${poster});`
})

const episodesBySeason = computed(() => {
  const map = new Map<number, SeriesEpisode[]>()
  const episodes = seriesInfo.value?.episodes || {}

  Object.entries(episodes).forEach(([seasonKey, list]) => {
    const seasonNumber = Number(seasonKey)
    const normalized = (list || [])
      .filter((episode) => episode.id !== undefined)
      .map((episode) => ({
        id: Number(episode.id),
        episodeNum: episode.episode_num,
        title: episode.title,
        containerExtension: episode.container_extension,
        info: episode.info,
        directSource: episode.direct_source,
      }))
    map.set(seasonNumber, normalized)
  })

  return map
})

const seasonOptions = computed<SeasonOption[]>(() => {
  const seasons = seriesInfo.value?.seasons || []
  if (seasons.length) {
    return seasons
      .filter(
        (season: any) => season.season_number !== undefined || season.seasonNumber !== undefined,
      )
      .map((season: any) => ({
        seasonNumber: Number(season.season_number || season.seasonNumber),
        name: season.name,
        cover: season.cover_big || season.cover,
        overview: season.overview,
        airDate: season.air_date,
        episodeCount: season.episode_count,
      }))
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
  }

  const keys = Array.from(episodesBySeason.value.keys())
  return keys.sort((a, b) => a - b).map((seasonNumber) => ({ seasonNumber }))
})

const episodesForSelectedSeason = computed(() => {
  if (selectedSeason.value === null) return []
  return episodesBySeason.value.get(selectedSeason.value) || []
})

const loadSeries = async () => {
  if (!seriesId.value) return
  isLoading.value = true
  try {
    const item = await seriesStorage.getItemById(seriesId.value)
    series.value = item || null
    if (item) {
      source.value = streamSourcesStore.getSourceById(item.sourceId) || null
      await loadSeriesInfo(item)
    }
  } catch (error) {
    console.error('Failed to load series detail:', error)
  } finally {
    isLoading.value = false
  }
}

const loadSeriesInfo = async (item: XtreamSeries) => {
  if (!source.value?.username || !source.value?.password) {
    return
  }

  try {
    // 首先尝试从缓存获取
    const cachedInfo = await seriesInfoStorage.getBySourceAndSeriesId(
      source.value.id,
      item.seriesId,
    )
    if (cachedInfo) {
      // 检查缓存是否过期
      const now = new Date().toISOString()
      if (cachedInfo.expiresAt > now) {
        // 重建XtreamSeriesInfoResponse格式
        seriesInfo.value = {
          info: cachedInfo.info,
          seasons: cachedInfo.seasons,
          episodes: cachedInfo.episodes,
        }
        return
      }
    }

    // 缓存不存在或已过期，从API获取
    const baseUrl = xtreamApiService.normalizeBaseUrl(source.value.url)
    const freshInfo = await xtreamApiService.fetchSeriesInfo(
      baseUrl,
      source.value.username,
      source.value.password,
      item.seriesId,
    )

    // 缓存获取到的数据
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
    const infoForCache = freshInfo.info
      ? {
          ...freshInfo.info,
          rating:
            typeof freshInfo.info.rating === 'number'
              ? freshInfo.info.rating.toString()
              : freshInfo.info.rating,
        }
      : {}
    const seasonsForCache = (freshInfo.seasons || []).map((season) => ({
      seasonNumber: season.season_number || 0,
      name: season.name,
      cover: season.cover,
      overview: season.overview,
      airDate: season.air_date,
      episodeCount: season.episode_count,
    }))
    const episodesForCache: Record<
      string,
      Array<{
        id: number
        episodeNum?: number
        title?: string
        containerExtension?: string
        info?: {
          plot?: string
          duration?: string
          releasedate?: string
          movie_image?: string
          rating?: number
          [key: string]: any
        }
        directSource?: string
      }>
    > = {}
    if (freshInfo.episodes) {
      for (const [seasonKey, episodes] of Object.entries(freshInfo.episodes)) {
        episodesForCache[seasonKey] = episodes
          .filter((episode) => episode.id !== undefined)
          .map((episode) => ({
            id: episode.id!,
            episodeNum: episode.episode_num,
            title: episode.title,
            containerExtension: episode.container_extension,
            info: episode.info,
            directSource: episode.direct_source,
          }))
      }
    }
    await seriesInfoStorage.upsertSeriesInfo(
      source.value.id,
      item.seriesId,
      infoForCache,
      seasonsForCache,
      episodesForCache,
      expiresAt,
    )
    seriesInfo.value = freshInfo
  } catch (error) {
    console.error('Failed to load series info:', error)
    // 如果API调用失败但有缓存数据，使用缓存数据
    if (!seriesInfo.value) {
      try {
        const cachedInfo = await seriesInfoStorage.getBySourceAndSeriesId(
          source.value.id,
          item.seriesId,
        )
        if (cachedInfo) {
          // 重建XtreamSeriesInfoResponse格式
          seriesInfo.value = {
            info: cachedInfo.info,
            seasons: cachedInfo.seasons,
            episodes: cachedInfo.episodes,
          }
        }
      } catch (cacheError) {
        console.error('Failed to load cached series info:', cacheError)
      }
    }
  }
}

const getEpisodeUrl = (episode: SeriesEpisode): string | null => {
  if (!source.value) return null
  return buildXtreamSeriesEpisodeUrl(source.value, episode.id, episode.containerExtension)
}

const getVideoType = (url: string): string => {
  if (url.includes('.m3u8')) return 'application/x-mpegURL'
  if (url.includes('.mp4')) return 'video/mp4'
  if (url.includes('.webm')) return 'video/webm'
  if (url.includes('.ogg')) return 'video/ogg'
  return 'application/x-mpegURL'
}

const initializePlayer = async () => {
  const episode = selectedEpisode.value
  if (!videoPlayer.value || !episode) return

  const url = getEpisodeUrl(episode)
  if (!url) return

  try {
    player = videojs(videoPlayer.value, {
      controls: true,
      responsive: true,
      aspectRatio: '16:9',
      preload: 'auto',
      autoplay: true,
      sources: [
        {
          src: url,
          type: getVideoType(url),
        },
      ],
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
        },
      },
    })

    player.on('error', (error: Error) => {
      console.error('Video.js error:', error)
      console.error('Error details:', player?.error())
      alert('Failed to load video. Please check the stream URL.')
    })
  } catch (error) {
    console.error('Failed to initialize video player:', error)
  }
}

const handlePlay = async (): Promise<void> => {
  if (!selectedEpisode.value) {
    alert('Select an episode first')
    return
  }

  isPlaying.value = true
  await nextTick()
  setTimeout(() => {
    initializePlayer()
  }, 100)
}

const handleStop = (): void => {
  cleanupPlayer()
  isPlaying.value = false
}

const selectSeason = (seasonNumber: number) => {
  selectedSeason.value = seasonNumber
}

const selectEpisode = (episode: SeriesEpisode) => {
  playEpisode(episode)
}

const playFirstEpisode = () => {
  if (episodesForSelectedSeason.value.length === 0) return

  // 尝试播放上次播放的 episode
  const key = `lastPlayedEpisode_${seriesId.value}_${selectedSeason.value}`
  const lastIdStr = localStorage.getItem(key)
  if (lastIdStr) {
    const lastId = parseInt(lastIdStr)
    const lastPlayed = episodesForSelectedSeason.value.find(e => e.id === lastId)
    if (lastPlayed) {
      playEpisode(lastPlayed)
      return
    }
  }

  // 如果没有上次播放的，播放第一个
  playEpisode(episodesForSelectedSeason.value[0])
}

const playEpisode = (episode: SeriesEpisode) => {
  selectedEpisode.value = episode
  lastPlayedEpisodeId.value = episode.id
  // 保存到 localStorage
  const key = `lastPlayedEpisode_${seriesId.value}_${selectedSeason.value}`
  localStorage.setItem(key, episode.id.toString())
  isPlaying.value = true
}

const togglePlay = () => {
  // Placeholder for play/pause logic
}

const toggleMute = () => {
  // Placeholder for mute logic
}

const toggleFullscreen = () => {
  // Placeholder for fullscreen logic
}

const closePlayer = () => {
  cleanupPlayer()
  isPlaying.value = false
}

const handleImageError = () => {
  imageLoadError.value = true
}

const cleanupPlayer = () => {
  if (player) {
    try {
      player.dispose()
      player = null
    } catch (error) {
      console.error('Error disposing video player:', error)
    }
  }
}

watch(seasonOptions, (options) => {
  if (!options.length) {
    selectedSeason.value = null
    return
  }
  const hasSelection = options.some((season) => season.seasonNumber === selectedSeason.value)
  if (!hasSelection) {
    selectedSeason.value = options[0].seasonNumber
  }
})

watch(episodesForSelectedSeason, (episodes) => {
  if (isPlaying.value) {
    handleStop()
  }
  selectedEpisode.value = episodes[0] || null
})

watch(isPlayerOpen, async (open) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = open ? 'hidden' : ''
  }
  if (!open) {
    cleanupPlayer()
    return
  }

  await nextTick()
  cleanupPlayer()
  await nextTick()
  await initializePlayer()
})

watch(selectedEpisode, async () => {
  if (!isPlayerOpen.value) return
  cleanupPlayer()
  await nextTick()
  await initializePlayer()
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isPlayerOpen.value) {
    closePlayer()
  }
}

onMounted(() => {
  loadSeries()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  cleanupPlayer()
  window.removeEventListener('keydown', handleKeydown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>
