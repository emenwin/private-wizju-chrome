<template>
  <div class="flex flex-col gap-4 mb-6">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="
          cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            selectedTab === tab.key
              ? 'bg-stream-accent text-white'
              : 'text-stream-text-muted hover:text-stream-text hover:bg-stream-accent/10',
          )
        "
        @click="emit('select-tab', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[240px]">
        <input
          :value="searchQuery"
          type="text"
          placeholder="Search content..."
          class="pl-9 pr-8 py-2 text-sm bg-stream-surface border border-stream-border rounded-md text-stream-text placeholder-stream-text-muted focus:outline-none focus:ring-2 focus:ring-stream-accent focus:border-transparent w-full"
          @input="onSearchInput"
        />
        <svg
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stream-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
        <button
          v-if="searchQuery"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-stream-text-muted hover:text-stream-text transition-colors"
          title="Clear search"
          @click="emit('update:search-query', '')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          :class="
            cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
              selectedCategoryId === category.id
                ? 'bg-stream-accent text-white'
                : 'text-stream-text-muted hover:text-stream-text hover:bg-stream-accent/10',
            )
          "
          @click="emit('update:selected-category-id', category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XtreamCategoryType } from '@/types/xtream'
import { cn } from '@/utils/cn'

type XtreamTab = { key: XtreamCategoryType; label: string }
type CategoryOption = { id: string; name: string }

type XtreamFiltersProps = {
  tabs: XtreamTab[]
  selectedTab: XtreamCategoryType
  searchQuery: string
  selectedCategoryId: string
  categoryOptions: CategoryOption[]
}

defineProps<XtreamFiltersProps>()

const emit = defineEmits<{
  (event: 'select-tab', tab: XtreamCategoryType): void
  (event: 'update:search-query', value: string): void
  (event: 'update:selected-category-id', value: string): void
}>()

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:search-query', target.value)
}
</script>
