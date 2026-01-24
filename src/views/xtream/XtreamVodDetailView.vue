<template>
  <div class="min-h-screen bg-stream-bg relative">
    <!-- Navigation Header (Floating/Sticky) -->
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="[
        isScrolled 
          ? 'bg-stream-bg/95 backdrop-blur-md shadow-sm py-2' 
          : 'bg-transparent py-4 bg-gradient-to-b from-black/50 to-transparent'
      ]"
      style="padding-top: max(env(safe-area-inset-top), 16px)"
    >
      <div class="px-4 md:px-6 flex items-center justify-between">
        <!-- Back Button -->
        <Button 
          @click="navigationService.goBack()" 
          variant="ghost" 
          size="icon"
          class="rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
          :class="
            isScrolled 
              ? 'hover:bg-stream-text/10 text-stream-text' 
              : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10'
          "
          title="Go Back"
        >
          <ArrowLeft class="w-5 h-5" />
        </Button>
        
        <!-- Title in header (scales in when scrolled) -->
        <div 
          class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[50%] transition-opacity duration-300"
          :class="isScrolled ? 'opacity-100' : 'opacity-0'"
          style="padding-top: max(env(safe-area-inset-top), 16px)"
        >
           <span class="font-semibold text-stream-text truncate block text-sm md:text-base">
             {{ vod?.name }}
           </span>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
            <!-- Placeholder for future actions -->
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div class="w-12 h-12 border-4 border-stream-accent border-t-transparent rounded-full animate-spin"></div>
      <p class="text-stream-text-muted">Loading VOD details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!vod" class="flex flex-col items-center justify-center min-h-screen space-y-6">
       <h2 class="text-2xl font-semibold text-stream-text">VOD not found</h2>
        <Button @click="navigationService.goBack()" variant="outline">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Go Back
        </Button>
    </div>

    <!-- Content -->
    <div v-else class="pb-20 pt-24 md:pt-28 px-6 md:px-12 lg:px-16 space-y-8">
      
      <!-- Top Info Section (Title + Meta) -->
      <div class="max-w-5xl animate-fade-in-up">
          <div class="flex flex-col md:flex-row md:items-end gap-x-6 gap-y-4">
            <!-- Title -->
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-stream-text tracking-tight leading-none font-display">
              {{ vod.name }}
            </h1>

            <!-- Meta Tags -->
            <div class="flex flex-wrap items-center gap-3 text-sm font-medium tracking-wide pb-2">
               <span class="bg-stream-accent/10 border border-stream-accent/20 text-stream-accent px-2.5 py-0.5 rounded-full text-xs uppercase shadow-sm whitespace-nowrap">
                VOD
               </span>
               <span v-if="vod.releaseDate" class="text-stream-text-muted font-semibold whitespace-nowrap">{{ vod.releaseDate }}</span>
               <div v-if="vod.rating" class="flex items-center text-yellow-500 gap-1 font-semibold whitespace-nowrap">
                 <Star class="w-3.5 h-3.5 fill-current" /> {{ vod.rating }}
               </div>
               <span v-if="vod.genre" class="text-stream-text-muted px-2 border-l border-stream-border/30 whitespace-nowrap">{{ vod.genre }}</span>
               <span v-if="vod.ratingMpaa" class="text-stream-text-muted px-2 border-l border-stream-border/30 whitespace-nowrap">{{ vod.ratingMpaa }}</span>
            </div>
          </div>
      </div>

      <!-- Video Player / Backdrop Section -->
      <div class="relative w-full aspect-video md:aspect-[21/9] max-h-[700px] overflow-hidden rounded-2xl shadow-2xl bg-black border border-stream-border/50 group">
        
        <!-- Background Image (Backdrop) -->
        <div 
          v-if="!isPlaying"
          class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          :style="backdropStyle"
        >
          <!-- Subtle overlay for depth -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <!-- Large Play Button Overlay -->
          <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
              <button 
                @click="handlePlay"
                class="bg-white/20 hover:bg-stream-accent text-white p-6 rounded-full backdrop-blur-md transition-all transform scale-100 group-hover:scale-110 shadow-2xl"
              >
                <Play class="w-12 h-12 fill-current ml-1" />
              </button>
          </div>
        </div>

        <!-- Video Player Overlay (When Playing) -->
        <div v-if="isPlaying" class="absolute inset-0 z-20 bg-black animate-fade-in">
           <video
              ref="videoPlayer"
              class="video-js vjs-theme-forest w-full h-full"
              controls
              preload="auto"
              data-setup="{}"
            />
             <!-- Close Player Button -->
             <button 
              @click="handleStop"
              class="absolute top-6 right-6 z-50 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10 hover:scale-105"
             >
               <X class="w-6 h-6" />
             </button>
        </div>
      </div>

      <!-- Details Section (Below fold) -->
      <div class="grid lg:grid-cols-12 gap-12 lg:gap-16 pt-8">
           <!-- Main Info (Left) -->
           <div class="lg:col-span-8 space-y-10 animate-fade-in-up delay-100">
              
              <!-- Actions -->
              <div class="flex items-center gap-5">
                 <Button
                  @click="handlePlay"
                  size="lg"
                  class="bg-stream-accent hover:bg-stream-accent-hover text-white rounded-full px-8 py-6 text-lg font-bold shadow-xl shadow-stream-accent/20 transition-all transform hover:scale-105 active:scale-95 group"
                >
                  <Play class="w-6 h-6 mr-3 fill-current group-hover:scale-110 transition-transform" />
                  Watch Now
                </Button>
              </div>

              <div class="prose prose-invert max-w-none border-t border-stream-border/30 pt-8">
                <h3 class="text-2xl font-bold text-stream-text mb-4">Synopsis</h3>
                <p class="text-stream-text-muted leading-relaxed text-lg lg:text-xl font-light">
                  {{ vod.plot || 'No description available for this content.' }}
                </p>
              </div>
              
              <div v-if="vod.cast" class="pt-8 border-t border-stream-border/30">
                 <h3 class="text-sm font-semibold text-stream-text-muted uppercase tracking-wider mb-4">Cast</h3>
                 <p class="text-stream-text leading-relaxed">{{ vod.cast }}</p>
              </div>
                 
              <div v-if="vod.director" class="pt-8 border-t border-stream-border/30">
                 <h3 class="text-sm font-semibold text-stream-text-muted uppercase tracking-wider mb-4">Director</h3>
                 <p class="text-stream-text">{{ vod.director }}</p>
              </div>
           </div>

           <!-- Sidebar Meta (Right) -->
           <div class="lg:col-span-4 space-y-6 animate-fade-in-up delay-200">
              <Card class="bg-stream-surface/30 border-stream-border/40 backdrop-blur-xl p-8 space-y-5 rounded-2xl shadow-lg">
                 <h4 class="text-lg font-semibold text-stream-text mb-2">Details</h4>
                 
                 <div class="flex items-center justify-between py-3 border-b border-stream-border/30 group hover:border-stream-border/60 transition-colors">
                    <span class="text-stream-text-muted flex items-center gap-3"><Calendar class="w-4 h-4 text-stream-accent/80"/> Release Date</span>
                    <span class="text-stream-text font-medium">{{ vod.releaseDate || 'N/A' }}</span>
                 </div>
                 <div class="flex items-center justify-between py-3 border-b border-stream-border/30 group hover:border-stream-border/60 transition-colors">
                    <span class="text-stream-text-muted flex items-center gap-3"><Star class="w-4 h-4 text-yellow-500"/> Rating</span>
                    <span class="text-stream-text font-medium">{{ vod.rating || 'N/A' }}/10</span>
                 </div>
              </Card>

              <!-- Technical Info -->
               <div v-if="vodUrl" class="group">
                  <div class="p-5 rounded-xl border border-stream-border/30 bg-stream-surface/20 text-xs overflow-hidden transition-all hover:bg-stream-surface/40">
                      <div class="uppercase tracking-widest text-stream-text-muted mb-2 font-semibold">Source URL</div>
                      <div class="text-stream-text font-mono break-all opacity-70 group-hover:opacity-100 transition-opacity">
                        {{ vodUrl }}
                      </div>
                  </div>
              </div>
           </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Play, Star, Calendar, X } from 'lucide-vue-next'
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
import '@videojs/themes/dist/forest/index.css'
import '@videojs/http-streaming'

const route = useRoute()
const navigationService = useNavigationService()
const streamSourcesStore = useStreamSourcesStore()
const vodStorage = new XtreamVodStreamsStorageV2()

const vod = ref<XtreamVodStream | null>(null)
const source = ref<StreamSource | null>(null)
const isLoading = ref(false)
const isPlaying = ref(false)
const videoPlayer = ref<HTMLVideoElement | null>(null)
let player: ReturnType<typeof videojs> | null = null

// Scroll state for header
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const vodId = computed(() => String(route.params.id || ''))
const vodUrl = computed(() => getVideoUrl())

const backdropStyle = computed(() => {
  const backdrop = vod.value?.backdrop
  const streamIcon = vod.value?.streamIcon
  
  if (backdrop) {
    return `background-image: url(${backdrop});`
  }
  if (streamIcon) {
    return `background-image: url(${streamIcon});`
  }
  return 'background: radial-gradient(circle at top, #1f2937, #0f172a);'
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
  window.addEventListener('scroll', handleScroll)
  loadVod()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  cleanupPlayer()
})
</script>

<style scoped>
.h-safe-top {
  height: env(safe-area-inset-top, 20px);
}

/* Enhancements for VideoJS theme if needed */
:deep(.video-js .vjs-big-play-button) {
  top: 50%;
  left: 50%;
  border: none;
  background: rgba(var(--stream-accent), 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  width: 2em;
  height: 2em;
  line-height: 2em;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}
</style>
