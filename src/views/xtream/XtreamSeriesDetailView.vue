<template>
  <div class="min-h-screen bg-stream-bg text-stream-text">
    <div
      class="fixed top-10 left-0 right-0 z-50 px-3 py-0 bg-stream-bg/95 backdrop-blur-sm border-b border-stream-border/50"
    >
      <Button @click="navigationService.goBack()" variant="ghost" class="mb-4">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back
      </Button>
    </div>

    <div class="pt-24 md:pt-20">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="w-12 h-12 border-4 border-stream-accent border-t-transparent rounded-full animate-spin"></div>
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
        <div class="relative overflow-hidden">
          <div class="absolute inset-0 bg-cover bg-center" :style="backdropStyle"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-stream-bg via-stream-bg/90 to-stream-bg/30"></div>
          <div class="relative z-10 p-6">
            <div class="flex flex-col lg:flex-row gap-8">
              <div class="w-full lg:w-1/3">
                <div class="relative aspect-[2/3] rounded-2xl overflow-hidden border border-stream-border bg-stream-surface">
                  <img
                    v-if="series.cover && !imageLoadError"
                    :src="series.cover"
                    :alt="series.name"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-stream-text-muted">
                    No cover
                  </div>
                </div>
              </div>

              <div class="flex-1 space-y-6">
                <div class="space-y-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="bg-stream-accent text-white text-xs px-3 py-1 rounded-full">Series</span>
                    <span v-if="series.genre" class="text-xs text-stream-text-muted border border-stream-border px-3 py-1 rounded-full">
                      {{ series.genre }}
                    </span>
                    <span v-if="series.ratingMpaa" class="text-xs text-stream-text-muted border border-stream-border px-3 py-1 rounded-full">
                      {{ series.ratingMpaa }}
                    </span>
                  </div>
                  <h1 class="text-4xl font-bold leading-tight">
                    {{ series.name }}
                  </h1>
                  <p v-if="series.plot" class="text-stream-text-muted text-lg leading-relaxed">
                    {{ series.plot }}
                  </p>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div v-if="series.rating" class="flex items-center gap-2 text-sm text-stream-text">
                    <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{{ series.rating }}/10</span>
                  </div>
                  <div v-if="series.releaseDate" class="flex items-center gap-2 text-sm text-stream-text">
                    <Calendar class="w-4 h-4 text-stream-text-muted" />
                    <span>{{ series.releaseDate }}</span>
                  </div>
                  <div v-if="series.director" class="flex items-center gap-2 text-sm text-stream-text">
                    <Film class="w-4 h-4 text-stream-text-muted" />
                    <span>{{ series.director }}</span>
                  </div>
                  <div v-if="series.cast" class="flex items-center gap-2 text-sm text-stream-text">
                    <Users class="w-4 h-4 text-stream-text-muted" />
                    <span>{{ series.cast }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <Card class="overflow-hidden bg-stream-surface border-stream-border">
            <div class="p-0">
              <div class="relative aspect-video max-h-[55vh]" id="video-container">
                <div v-if="isPlaying" class="w-full h-full">
                  <video
                    ref="videoPlayer"
                    class="video-js vjs-default-skin w-full h-full"
                    controls
                    preload="auto"
                    data-setup="{}"
                  />
                </div>

                <div v-else class="relative w-full h-full bg-black/70 flex items-center justify-center">
                  <Button
                    @click="handlePlay"
                    size="lg"
                    class="bg-gradient-primary hover:bg-stream-accent-hover"
                  >
                    <Play class="w-6 h-6 mr-2" />
                    Play Selected Episode
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card class="bg-stream-surface border-stream-border">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold">Seasons</h2>
                <span v-if="seasonOptions.length" class="text-sm text-stream-text-muted">
                  {{ seasonOptions.length }} seasons
                </span>
              </div>
              <div v-if="seasonOptions.length" class="flex flex-wrap gap-2">
                <button
                  v-for="season in seasonOptions"
                  :key="season.seasonNumber"
                  class="px-3 py-2 text-sm rounded-full border transition-colors"
                  :class="
                    selectedSeason === season.seasonNumber
                      ? 'bg-stream-accent text-white border-stream-accent'
                      : 'border-stream-border text-stream-text-muted hover:text-stream-text hover:bg-stream-accent/10'
                  "
                  @click="selectSeason(season.seasonNumber)"
                >
                  {{ season.name || `Season ${season.seasonNumber}` }}
                </button>
              </div>
              <p v-else class="text-sm text-stream-text-muted">No seasons data available.</p>
            </div>
          </Card>

          <Card class="bg-stream-surface border-stream-border">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold">Episodes</h2>
                <span v-if="episodesForSelectedSeason.length" class="text-sm text-stream-text-muted">
                  {{ episodesForSelectedSeason.length }} episodes
                </span>
              </div>

              <div v-if="episodesForSelectedSeason.length" class="grid gap-3">
                <button
                  v-for="episode in episodesForSelectedSeason"
                  :key="episode.id"
                  class="flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors text-left"
                  :class="
                    selectedEpisode?.id === episode.id
                      ? 'border-stream-accent bg-stream-accent/10'
                      : 'border-stream-border hover:border-stream-accent/60'
                  "
                  @click="selectEpisode(episode)"
                >
                  <div>
                    <p class="font-semibold">
                      {{ episode.title || `Episode ${episode.episodeNum || episode.id}` }}
                    </p>
                    <p v-if="episode.info" class="text-sm text-stream-text-muted line-clamp-2">
                      {{ episode.info }}
                    </p>
                  </div>
                  <span class="text-xs text-stream-text-muted">#{{ episode.episodeNum || episode.id }}</span>
                </button>
              </div>
              <p v-else class="text-sm text-stream-text-muted">No episodes found for this season.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Play, Star, Calendar, Users, Film } from 'lucide-vue-next'
import Card from '@/components/ui/UiCard.vue'
import Button from '@/components/ui/UiButton.vue'
import { useStreamSourcesStore } from '@/stores/streamSources'
import { useNavigationService } from '@/services/navigationService'
import { XtreamSeriesStorageV2 } from '@/services/indexedDb/xtreamStorageV2'
import { buildXtreamSeriesEpisodeUrl } from '@/services/xtream/xtreamUrlBuilder'
import { xtreamApiService } from '@/services/xtream/xtreamApiService'
import type { XtreamSeries } from '@/types/xtream'
import type { StreamSource } from '@/types/stream'
import type { XtreamSeriesInfoResponse } from '@/services/xtream/xtreamApiService'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@videojs/http-streaming'

type SeriesEpisode = {
  id: number
  episodeNum?: number
  title?: string
  containerExtension?: string
  info?: string
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

const series = ref<XtreamSeries | null>(null)
const source = ref<StreamSource | null>(null)
const seriesInfo = ref<XtreamSeriesInfoResponse | null>(null)
const isLoading = ref(false)
const isPlaying = ref(false)
const imageLoadError = ref(false)
const videoPlayer = ref<HTMLVideoElement | null>(null)
const selectedSeason = ref<number | null>(null)
const selectedEpisode = ref<SeriesEpisode | null>(null)
let player: ReturnType<typeof videojs> | null = null

const seriesId = computed(() => String(route.params.id || ''))

const backdropStyle = computed(() => {
  const backdrop = series.value?.backdrop || series.value?.cover
  if (!backdrop) {
    return 'background: radial-gradient(circle at top, #1f2937, #0f172a);'
  }
  return `background-image: url(${backdrop});`
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
      .filter((season) => season.season_number !== undefined)
      .map((season) => ({
        seasonNumber: Number(season.season_number),
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
    const baseUrl = xtreamApiService.normalizeBaseUrl(source.value.url)
    seriesInfo.value = await xtreamApiService.fetchSeriesInfo(
      baseUrl,
      source.value.username,
      source.value.password,
      item.seriesId,
    )
  } catch (error) {
    console.error('Failed to load series info:', error)
  }
}

const getEpisodeUrl = (episode: SeriesEpisode): string | null => {
  if (!source.value) return null
  if (episode.directSource) return episode.directSource
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
      fluid: true,
      fill: true,
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
  selectedEpisode.value = episode
  if (isPlaying.value) {
    handleStop()
  }
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
  selectedEpisode.value = episodes[0] || null
  if (isPlaying.value) {
    handleStop()
  }
})

onMounted(() => {
  loadSeries()
})

onUnmounted(() => {
  cleanupPlayer()
})
</script>
