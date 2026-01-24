<template>
  <Card
    :class="
      cn(
        'group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-accent bg-gradient-card border-stream-border',
        className,
      )
    "
    @click="handleCardClick"
  >
    <div class="p-0">
      <div class="relative aspect-video overflow-hidden rounded-t-lg">
        <img
          v-if="!imageError && media.thumbnail"
          :src="media.thumbnail"
          :alt="media.title"
          :class="
            cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )
          "
          @load="imageLoaded = true"
          @error="imageError = true"
        />
        <div v-else class="w-full h-full bg-stream-surface flex items-center justify-center">
          <Play class="w-12 h-12 text-stream-text-muted" />
        </div>

        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <Button size="sm" class="bg-gradient-primary hover:bg-stream-accent-hover">
            <Play class="w-4 h-4 mr-2" />
            Play
          </Button>
        </div>

        <!-- Type Badge -->
        <div
          class="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded border-none"
        >
          {{ media.type.toUpperCase() }}
        </div>

        <!-- Duration/Time Remaining -->
        <div
          v-if="timeLabel"
          class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center"
        >
          <Clock class="w-3 h-3 mr-1" />
          {{ timeLabel }}
        </div>
      </div>

      <div class="p-4 space-y-2">
        <h3
          class="font-semibold text-stream-text line-clamp-2 group-hover:text-stream-accent transition-colors"
        >
          {{ media.title }}
        </h3>

        <p v-if="media.description" class="text-sm text-stream-text-muted line-clamp-2">
          {{ media.description }}
        </p>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span
              v-if="media.category"
              class="text-xs border border-stream-border text-stream-text-muted px-2 py-1 rounded"
            >
              {{ media.category }}
            </span>
            <span v-if="media.year" class="text-xs text-stream-text-muted">{{ media.year }}</span>
          </div>

          <div v-if="media.rating" class="flex items-center space-x-1">
            <Star class="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span class="text-xs text-stream-text-muted">{{ media.rating }}</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Play, Clock, Star } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Card from '@/components/ui/UiCard.vue'
import Button from '@/components/ui/UiButton.vue'
import type { FavOrRecentlyItem } from '@/types/stream'

interface Props {
  media: FavOrRecentlyItem
  className?: string
}

const props = defineProps<Props>()

const imageLoaded = ref(false)
const imageError = ref(false)

const emit = defineEmits<{
  click: [item: FavOrRecentlyItem]
}>()

const timeLabel = computed(() => {
  const media = props.media as FavOrRecentlyItem & { lastPosition?: number }
  if (media.lastPosition) {
    const minutes = Math.floor(media.lastPosition / 60)
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m played`
    }
    return `${minutes}min played`
  }
  return props.media.duration
})

const handleCardClick = (): void => {
  emit('click', props.media)
}
</script>
