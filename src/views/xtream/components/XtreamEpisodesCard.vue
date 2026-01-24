<template>
  <Card :class="[SURFACE_COLOR, BORDER_COLOR, SHADOW_SMALL, TRANSITION_DURATION]">
    <div :class="[CARD_PADDING, 'space-y-4']">
      <div class="flex items-center justify-between">
        <h2 :class="[SUBTITLE_SIZE, 'font-semibold', TEXT_COLOR]">Episodes</h2>
        <span v-if="episodesForSelectedSeason.length" :class="[SMALL_SIZE, TEXT_MUTED_COLOR]">
          {{ episodesForSelectedSeason.length }} episodes
        </span>
      </div>

      <div v-if="episodesForSelectedSeason.length" class="grid gap-4">
        <button
          v-for="episode in episodesForSelectedSeason"
          :key="episode.id"
          :class="[
            'flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 text-left group',
            selectedEpisode?.id === episode.id
              ? 'border-stream-accent bg-stream-accent/10 shadow-md'
              : 'border-stream-border hover:border-stream-accent/60 hover:bg-stream-surface/50'
          ]"
          @click="selectEpisode(episode)"
        >
          <!-- Episode Thumbnail -->
          <div class="flex-shrink-0">
            <div class="w-20 h-12 rounded-md overflow-hidden bg-stream-surface border border-stream-border/50">
              <img
                v-if="episode.info?.movie_image"
                :src="episode.info.movie_image"
                :alt="episode.title"
                class="w-full h-full object-cover"
                @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-stream-text-muted text-xs">
                <Play class="w-4 h-4" />
              </div>
            </div>
          </div>

          <!-- Episode Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-2">
              <h3 class="font-semibold text-stream-text truncate group-hover:text-stream-accent transition-colors">
                {{ episode.title || `Episode ${episode.episodeNum || episode.id}` }}
              </h3>
              <span :class="['text-xs px-2 py-1 rounded-full flex-shrink-0', selectedEpisode?.id === episode.id ? 'bg-stream-accent text-white' : 'bg-stream-surface text-stream-text-muted']">
                #{{ episode.episodeNum || episode.id }}
              </span>
            </div>

            <!-- Episode Info -->
            <div class="space-y-1">
              <p v-if="episode.info?.plot" :class="[SMALL_SIZE, TEXT_MUTED_COLOR, 'line-clamp-2 leading-relaxed']">
                {{ episode.info.plot }}
              </p>

              <!-- Meta Info -->
              <div class="flex items-center gap-4 text-xs text-stream-text-muted">
                <div v-if="episode.info?.duration" class="flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  <span>{{ episode.info.duration }}</span>
                </div>
                <div v-if="episode.info?.releasedate" class="flex items-center gap-1">
                  <Calendar class="w-3 h-3" />
                  <span>{{ formatDate(episode.info.releasedate) }}</span>
                </div>
                <div v-if="episode.info?.rating" class="flex items-center gap-1">
                  <Star class="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span>{{ episode.info.rating }}/10</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Play Indicator -->
          <div class="flex-shrink-0 self-center">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center transition-all', selectedEpisode?.id === episode.id ? 'bg-stream-accent text-white' : 'bg-stream-surface text-stream-text-muted group-hover:bg-stream-accent group-hover:text-white']">
              <Play class="w-4 h-4 ml-0.5" />
            </div>
          </div>
        </button>
      </div>
      <p v-else :class="[SMALL_SIZE, TEXT_MUTED_COLOR]">No episodes found for this season.</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/ui/UiCard.vue'
import { Play, Clock, Calendar, Star } from 'lucide-vue-next'
import {
  CARD_PADDING,
  GAP_MEDIUM,
  BORDER_RADIUS_SMALL,
  SHADOW_SMALL,
  TRANSITION_DURATION,
  HOVER_SHADOW,
  SUBTITLE_SIZE,
  SMALL_SIZE,
  EXTRA_SMALL_SIZE,
  SURFACE_COLOR,
  BORDER_COLOR,
  TEXT_COLOR,
  TEXT_MUTED_COLOR,
} from '@/constants/ui'

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

interface Props {
  episodesForSelectedSeason: SeriesEpisode[]
  selectedEpisode: SeriesEpisode | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectEpisode: [episode: SeriesEpisode]
}>()

const selectEpisode = (episode: SeriesEpisode) => {
  emit('selectEpisode', episode)
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}
</script>