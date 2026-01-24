<template>
  <div class="p-6 space-y-8 min-h-full pb-20">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-stream-text">Recent Watching</h1>
      <p class="text-stream-text-muted">All your recently watched content.</p>
    </div>

    <!-- Items -->
    <div v-if="items.length > 0" class="space-y-4">
      <MediaGrid
        :items="items"
        empty-message="No recent watching history."
        @item-click="handleMediaClick"
      />
      <!-- Load More Button -->
      <div v-if="hasMore" class="flex justify-center">
        <UiButton
          @click="loadMore"
          :disabled="isLoadingMore"
          variant="outline"
        >
          {{ isLoadingMore ? 'Loading...' : 'Load More' }}
        </UiButton>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 space-y-4">
      <h3 class="text-lg font-semibold text-stream-text">No recent watching history</h3>
      <p class="text-stream-text-muted">
        Start watching some content to see it here!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MediaGrid from '@/components/media/MediaGrid.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useMediaClickHandler } from '@/composables/useMediaClickHandler'
import { recentWatchingService } from '@/services/recentWatchingService'
import type { FavOrRecentlyItem } from '@/types/stream'

const { handleMediaClick } = useMediaClickHandler()

const items = ref<FavOrRecentlyItem[]>([])
const isLoadingMore = ref(false)
const hasMore = ref(true)
const pageSize = 20
let currentOffset = 0

const loadItems = async (offset: number, limit: number) => {
  try {
    const newItems = await recentWatchingService.loadRecentWatching({ offset, limit })
    if (newItems.length < limit) {
      hasMore.value = false
    }
    items.value.push(...newItems)
    currentOffset += newItems.length
  } catch (error) {
    console.error('Failed to load recent watching items:', error)
  }
}

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  isLoadingMore.value = true
  await loadItems(currentOffset, pageSize)
  isLoadingMore.value = false
}

onMounted(async () => {
  await loadItems(0, pageSize)
})
</script>