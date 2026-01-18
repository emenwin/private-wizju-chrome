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
        <p class="text-stream-text-muted">Loading VOD details...</p>
      </div>

      <div v-else-if="!vod" class="text-center py-12">
        <h2 class="text-xl font-semibold text-stream-text mb-4">VOD not found</h2>
        <Button @click="navigationService.goBack()" variant="outline">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>

      <div v-else>
        <div class="relative overflow-hidden">
          <div
            class="absolute inset-0 bg-cover bg-center"
            :style="backdropStyle"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-r from-stream-bg via-stream-bg/90 to-stream-bg/20"></div>
          <div class="relative z-10 p-6">
            <div class="flex flex-col lg:flex-row gap-8">
              <div class="w-full lg:w-1/3">
                <div class="relative aspect-[2/3] rounded-2xl overflow-hidden border border-stream-border bg-stream-surface">
                  <img
                    v-if="vod.streamIcon && !imageLoadError"
                    :src="vod.streamIcon"
                    :alt="vod.name"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-stream-text-muted">
                    No poster
                  </div>
                </div>
              </div>

              <div class="flex-1 space-y-6">
                <div class="space-y-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="bg-stream-accent text-white text-xs px-3 py-1 rounded-full">VOD</span>
                    <span v-if="vod.genre" class="text-xs text-stream-text-muted border border-stream-border px-3 py-1 rounded-full">
                      {{ vod.genre }}
                    </span>
                    <span v-if="vod.ratingMpaa" class="text-xs text-stream-text-muted border border-stream-border px-3 py-1 rounded-full">
                      {{ vod.ratingMpaa }}
                    </span>
                  </div>
                  <h1 class="text-4xl font-bold leading-tight">
                    {{ vod.name }}
                  </h1>
                  <p v-if="vod.plot" class="text-stream-text-muted text-lg leading-relaxed">
                    {{ vod.plot }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-3">
                  <Button
                    v-if="!isPlaying"
                    @click="handlePlay"
                    class="bg-gradient-primary hover:bg-stream-accent-hover"
                  >
                    <Play class="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button
                    v-else
                    @click="handleStop"
                    variant="outline"
                    class="border-stream-border"
                  >
                    Stop
                  </Button>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div v-if="vod.rating" class="flex items-center gap-2 text-sm text-stream-text">
                    <Star class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{{ vod.rating }}/10</span>
                  </div>
                  <div v-if="vod.releaseDate" class="flex items-center gap-2 text-sm text-stream-text">
                    <Calendar class="w-4 h-4 text-stream-text-muted" />
                    <span>{{ vod.releaseDate }}</span>
                  </div>
                  <div v-if="vod.director" class="flex items-center gap-2 text-sm text-stream-text">
                    <Film class="w-4 h-4 text-stream-text-muted" />
                    <span>{{ vod.director }}</span>
                  </div>
                  <div v-if="vod.cast" class="flex items-center gap-2 text-sm text-stream-text">
                    <Users class="w-4 h-4 text-stream-text-muted" />
                    <span>{{ vod.cast }}</span>
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
                    Play Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card class="bg-stream-surface border-stream-border">
            <div class="p-4 space-y-2 text-sm text-stream-text-muted">
              <p v-if="vod.genre">Genre: {{ vod.genre }}</p>
              <p v-if="vod.categoryId">Category: {{ vod.categoryId }}</p>
              <p v-if="vodUrl">Source: {{ vodUrl }}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Play, Star, Calendar, Users, Film } from 'lucide-vue-next'
import Card from '@/components/ui/UiCard.vue'
import Button from '@/components/ui/UiButton.vue'
import { useStreamSourcesStore } from '@/stores/streamSources'
import { useNavigationService } from '@/services/navigationService'
import { XtreamVodStreamsStorageV2 } from '@/services/indexedDb/xtreamStorageV2'
import { buildXtreamVodUrl } from '@/services/xtream/xtreamUrlBuilder'
import type { XtreamVodStream } from '@/types/xtream'
import type { StreamSource } from '@/types/stream'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@videojs/http-streaming'

const route = useRoute()
const navigationService = useNavigationService()
const streamSourcesStore = useStreamSourcesStore()
const vodStorage = new XtreamVodStreamsStorageV2()

const vod = ref<XtreamVodStream | null>(null)
const source = ref<StreamSource | null>(null)
const isLoading = ref(false)
const isPlaying = ref(false)
const imageLoadError = ref(false)
const videoPlayer = ref<HTMLVideoElement | null>(null)
let player: ReturnType<typeof videojs> | null = null

const vodId = computed(() => String(route.params.id || ''))
const vodUrl = computed(() => getVideoUrl())

const backdropStyle = computed(() => {
  const backdrop = vod.value?.backdrop
  if (!backdrop) {
    return 'background: radial-gradient(circle at top, #1f2937, #0f172a);'
  }
  return `background-image: url(${backdrop});`
})

const loadVod = async () => {
  if (!vodId.value) return
  isLoading.value = true
  try {
    const item = await vodStorage.getItemById(vodId.value)
    vod.value = item || null
    if (item) {
      source.value = streamSourcesStore.getSourceById(item.sourceId) || null
    }
  } catch (error) {
    console.error('Failed to load VOD detail:', error)
  } finally {
    isLoading.value = false
  }
}

const getVideoUrl = (): string | null => {
  if (!vod.value || !source.value) return null
  if (vod.value.directSource) return vod.value.directSource
  return buildXtreamVodUrl(source.value, vod.value)
}

const getVideoType = (url: string): string => {
  if (url.includes('.m3u8')) return 'application/x-mpegURL'
  if (url.includes('.mp4')) return 'video/mp4'
  if (url.includes('.webm')) return 'video/webm'
  if (url.includes('.ogg')) return 'video/ogg'
  return 'application/x-mpegURL'
}

const initializePlayer = async () => {
  const url = getVideoUrl()
  if (!videoPlayer.value || !url) return

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
  const url = getVideoUrl()
  if (!url) {
    alert('No video URL available')
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

onMounted(() => {
  loadVod()
})

onUnmounted(() => {
  cleanupPlayer()
})
</script>
