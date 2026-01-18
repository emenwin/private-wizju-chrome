<template>
  <div v-if="items.length === 0" class="text-center py-12">
    <p class="text-stream-text-muted">
      {{ searchQuery ? `No results for "${searchQuery}".` : 'No content available.' }}
    </p>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <XtreamItemCard
      v-for="item in items"
      :key="item.id"
      :title="item.name"
      :description="item.description"
      :thumbnail="item.thumbnail"
      :category="item.categoryName"
      :rating="item.rating"
      :badge="tabLabel"
      :action-label="item.actionLabel"
      @click="emit('item-click', item)"
    />
  </div>

  <div v-if="canLoadMore" class="flex justify-center py-6">
    <button
      class="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-stream-accent text-white hover:bg-stream-accent/90"
      @click="emit('load-more')"
    >
      Load more
    </button>
  </div>
</template>

<script setup lang="ts">
import XtreamItemCard from '@/components/xtream/XtreamItemCard.vue'
import type { XtreamViewItem } from '@/views/xtream/useXtreamView'

type XtreamGridProps = {
  items: XtreamViewItem[]
  searchQuery: string
  tabLabel: string
  canLoadMore: boolean
}

defineProps<XtreamGridProps>()

const emit = defineEmits<{
  (event: 'item-click', item: XtreamViewItem): void
  (event: 'load-more'): void
}>()
</script>
