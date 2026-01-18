<template>
  <Card
    :class="
      cn(
        'group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-accent bg-gradient-card border-stream-border',
        className,
      )
    "
    @click="handleClick"
  >
    <div class="p-0">
      <div class="relative aspect-video overflow-hidden rounded-t-lg">
        <img
          v-if="!imageError && thumbnail"
          :src="thumbnail"
          :alt="title"
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

        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <Button size="sm" class="bg-gradient-primary hover:bg-stream-accent-hover">
            <Play class="w-4 h-4 mr-2" />
            {{ actionLabel }}
          </Button>
        </div>

        <div
          v-if="badge"
          class="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded border-none"
        >
          {{ badge }}
        </div>
      </div>

      <div class="p-4 space-y-2">
        <h3
          class="font-semibold text-stream-text line-clamp-2 group-hover:text-stream-accent transition-colors"
        >
          {{ title }}
        </h3>

        <p v-if="description" class="text-sm text-stream-text-muted line-clamp-2">
          {{ description }}
        </p>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span
              v-if="category"
              class="text-xs border border-stream-border text-stream-text-muted px-2 py-1 rounded"
            >
              {{ category }}
            </span>
          </div>

          <div v-if="rating" class="flex items-center space-x-1">
            <Star class="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span class="text-xs text-stream-text-muted">{{ rating }}</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Play, Star } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Card from '@/components/ui/UiCard.vue'
import Button from '@/components/ui/UiButton.vue'

interface Props {
  title: string
  description?: string
  thumbnail?: string
  category?: string
  rating?: number
  badge?: string
  actionLabel?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  actionLabel: 'Play',
  className: '',
})

const emit = defineEmits<{
  click: []
}>()

const imageLoaded = ref(false)
const imageError = ref(false)

const handleClick = (): void => {
  if (props.actionLabel !== 'Unavailable') {
    emit('click')
  }
}
</script>
