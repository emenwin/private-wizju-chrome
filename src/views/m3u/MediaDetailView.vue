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
             {{ media?.title }}
           </span>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
           <Button
            @click="handleToggleFavorite"
            variant="ghost"
            size="icon"
            class="rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
            :class="
              (isScrolled 
                ? 'hover:bg-stream-text/10 ' 
                : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 ') +
              (isFavorite ? 'text-red-500' : (isScrolled ? 'text-stream-text' : 'text-white'))
            "
            :title="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
          >
            <Heart :class="['w-5 h-5', isFavorite ? 'fill-current' : '']" />
          </Button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div class="w-12 h-12 border-4 border-stream-accent border-t-transparent rounded-full animate-spin"></div>
      <p class="text-stream-text-muted">Loading media...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!media" class="flex flex-col items-center justify-center min-h-screen space-y-6">
       <h2 class="text-2xl font-semibold text-stream-text">Media not found</h2>
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
              {{ media.title }}
            </h1>

            <!-- Meta Tags (Now side-by-side with title on large screens) -->
            <div class="flex flex-wrap items-center gap-3 text-sm font-medium tracking-wide pb-2">
               <span class="bg-stream-accent/10 border border-stream-accent/20 text-stream-accent px-2.5 py-0.5 rounded-full text-xs uppercase shadow-sm whitespace-nowrap">
                {{ media.type }}
               </span>
               <span v-if="media.year" class="text-stream-text-muted font-semibold whitespace-nowrap">{{ media.year }}</span>
               <div v-if="media.rating" class="flex items-center text-yellow-500 gap-1 font-semibold whitespace-nowrap">
                 <Star class="w-3.5 h-3.5 fill-current" /> {{ media.rating }}
               </div>
               <span v-if="media.genre" class="text-stream-text-muted px-2 border-l border-stream-border/30 whitespace-nowrap">{{ media.genre }}</span>
            </div>
          </div>
      </div>

      <!-- Video Player / Backdrop Section -->
      <div class="relative w-full aspect-video md:aspect-[21/9] max-h-[700px] overflow-hidden rounded-2xl shadow-2xl bg-black border border-stream-border/50 group">
        
        <!-- Background Image (Backdrop) -->
        <div 
          v-if="!isPlaying"
          class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          :style="{ backgroundImage: `url(${media.thumbnail})` }"
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
           <!-- Main Info (Left) - Actions & Description -->
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
                 <Button
                  @click="handleToggleFavorite"
                  variant="outline"
                  size="lg"
                  class="rounded-full px-6 py-6 border-stream-border hover:bg-stream-surface text-stream-text transition-all hover:border-stream-text-muted/50"
                >
                  <component :is="isFavorite ? Heart : Heart" :class="['w-6 h-6', isFavorite ? 'fill-red-500 text-red-500' : '']" />
                </Button>
              </div>

              <div class="prose prose-invert max-w-none border-t border-stream-border/30 pt-8">
                <h3 class="text-2xl font-bold text-stream-text mb-4">Synopsis</h3>
                <p class="text-stream-text-muted leading-relaxed text-lg lg:text-xl font-light">
                  {{ media.description || 'No description available for this content.' }}
                </p>
              </div>
              <div v-if="media.category" class="pt-8 border-t border-stream-border/30">
                <h3 class="text-sm font-semibold text-stream-text-muted uppercase tracking-wider mb-4">Category / Tags</h3>
                 <div class="flex flex-wrap gap-2">
                    <span class="bg-stream-surface hover:bg-stream-surface-hover border border-stream-border hover:border-stream-text-muted/50 px-4 py-1.5 rounded-full text-sm text-stream-text transition-all cursor-default">
                      {{ media.category }}
                    </span>
                 </div>
              </div>
           </div>

           <!-- Sidebar Meta (Right) -->
           <div class="lg:col-span-4 space-y-6 animate-fade-in-up delay-200">
              <Card class="bg-stream-surface/30 border-stream-border/40 backdrop-blur-xl p-8 space-y-5 rounded-2xl shadow-lg">
                 <h4 class="text-lg font-semibold text-stream-text mb-2">Details</h4>
                 
                 <div class="flex items-center justify-between py-3 border-b border-stream-border/30 group hover:border-stream-border/60 transition-colors">
                    <span class="text-stream-text-muted flex items-center gap-3"><Clock class="w-4 h-4 text-stream-accent/80"/> Duration</span>
                    <span class="text-stream-text font-medium">{{ media.duration || 'N/A' }}</span>
                 </div>
                 <div class="flex items-center justify-between py-3 border-b border-stream-border/30 group hover:border-stream-border/60 transition-colors">
                    <span class="text-stream-text-muted flex items-center gap-3"><Calendar class="w-4 h-4 text-stream-accent/80"/> Release Year</span>
                    <span class="text-stream-text font-medium">{{ media.year || 'N/A' }}</span>
                 </div>
                 <div class="flex items-center justify-between py-3 border-b border-stream-border/30 group hover:border-stream-border/60 transition-colors">
                    <span class="text-stream-text-muted flex items-center gap-3"><Star class="w-4 h-4 text-yellow-500"/> Rating</span>
                    <span class="text-stream-text font-medium">{{ media.rating || 'N/A' }}/10</span>
                 </div>
                 
                 <div v-if="media.timeRemaining" class="mt-6 p-4 bg-stream-accent/10 border border-stream-accent/20 rounded-xl flex items-center gap-4">
                    <div class="p-2 bg-stream-accent/20 rounded-full text-stream-accent">
                       <Clock class="w-5 h-5" />
                    </div>
                     <div>
                       <div class="text-xs text-stream-text-muted uppercase tracking-wide">Time Remaining</div>
                       <div class="text-base font-bold text-stream-accent">{{ media.timeRemaining }}</div>
                     </div>
                 </div>
              </Card>

              <!-- Technical Info (Collapsible style but kept open for now) -->
               <div v-if="media.url" class="group">
                  <div class="p-5 rounded-xl border border-stream-border/30 bg-stream-surface/20 text-xs overflow-hidden transition-all hover:bg-stream-surface/40">
                      <div class="uppercase tracking-widest text-stream-text-muted mb-2 font-semibold">Source URL</div>
                      <div class="text-stream-text font-mono break-all opacity-70 group-hover:opacity-100 transition-opacity">
                        {{ media.url }}
                      </div>
                  </div>
              </div>
           </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ArrowLeft, Play, Star, Clock, Calendar, Heart, X } from 'lucide-vue-next'
import Card from '@/components/ui/UiCard.vue'
import Button from '@/components/ui/UiButton.vue'
import { useNavigationStore } from '@/stores/navigation'
import { useNavigationService } from '@/services/navigationService'
import { recentWatchingService } from '@/services/recentWatchingService'
import { favoritesService } from '@/services/favoritesService'
import type { M3UMediaItem } from '@/types/stream'
import type { FavoriteItem } from '@/types/indexeddb'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import '@videojs/themes/dist/forest/index.css'
import '@videojs/http-streaming'

const navigationStore = useNavigationStore()
const navigationService = useNavigationService()

const media = ref<M3UMediaItem | null>(null)
const isLoading = ref(false)
const isPlaying = ref(false)
const videoPlayer = ref<HTMLVideoElement | null>(null)
const imageLoadError = ref(false)
let player: ReturnType<typeof videojs> | null = null

// Scroll state for header
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// Favorite state
const isFavorite = ref(false)

const buildFavoriteItem = (mediaItem: M3UMediaItem, sourceId: string): FavoriteItem => {
  return {
    id: '',
    itemId: mediaItem.id,
    sourceId,
    type: mediaItem.type,
    dateAdded: '',
    title: mediaItem.title,
    description: mediaItem.description,
    thumbnail: mediaItem.thumbnail,
    category: mediaItem.category,
    duration: mediaItem.duration,
    tvgName: mediaItem.tvgName,
    groupTitle: mediaItem.groupTitle,
  }
}

const updateFavoriteStatus = async () => {
  if (!media.value || !navigationStore.currentSourceId) {
    isFavorite.value = false
    return
  }
  isFavorite.value = await favoritesService.isFavorite(
    buildFavoriteItem(media.value, navigationStore.currentSourceId),
  )
}

const handleToggleFavorite = async () => {
  if (!media.value || !navigationStore.currentSourceId) return
  const success = await favoritesService.toggleFavorite(
    buildFavoriteItem(media.value, navigationStore.currentSourceId),
  )
  if (success) {
    await updateFavoriteStatus()
  }
}

const loadMedia = async () => {
  isLoading.value = true
  try {
    const mediaValidation = navigationStore.validateCurrentMediaItem()
    if (!mediaValidation.isValid) {
      media.value = null
      return
    }
    media.value = navigationStore.currentMediaItem
    imageLoadError.value = false
    await updateFavoriteStatus()
    
    if (media.value && navigationStore.currentSourceId) {
       recentWatchingService.addToRecentWatching({
          mediaItem: media.value,
          sourceId: navigationStore.currentSourceId,
        }).catch(console.error)
    }
  } catch (error) {
    console.error('Failed to load media:', error)
  } finally {
    isLoading.value = false
  }
}

const initializePlayer = async () => {
  if (!videoPlayer.value || !media.value?.url) return

  try {
    player = videojs(videoPlayer.value, {
      controls: true,
      responsive: true,
      fluid: true,
      fill: true,
      preload: 'auto',
      autoplay: true,
      sources: [{
        src: media.value.url,
        type: getVideoType(media.value.url),
      }],
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
       html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
        },
      },
    })
    
    player.on('error', (error: unknown) => {
      console.error('Video.js error:', error)
      alert('Failed to load video.')
    })
  } catch (error) {
    console.error('Failed to initialize video player:', error)
  }
}

const getVideoType = (url: string): string => {
  if (url.includes('.m3u8')) return 'application/x-mpegURL'
  if (url.includes('.mp4')) return 'video/mp4'
  if (url.includes('.webm')) return 'video/webm'
  return 'application/x-mpegURL'
}

const handlePlay = async (): Promise<void> => {
  if (!media.value?.url) return
  if (media.value.url.startsWith('mock://')) {
    alert('This is a mock URL.')
    return
  }
  isPlaying.value = true
  await nextTick()
  setTimeout(() => initializePlayer(), 100)
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
    } catch (e) {
      console.error(e)
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadMedia()
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
</style>
