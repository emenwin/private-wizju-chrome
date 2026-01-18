<template>
  <div class="p-6 h-screen flex flex-col">
    <XtreamHeader :current-source="currentSource" />

    <XtreamStatusPanel v-if="!hasConfiguredSources" variant="no-sources" />

    <XtreamStatusPanel v-else-if="isLoading" variant="loading" />

    <XtreamStatusPanel v-else-if="!hasCurrentSource" variant="no-source" />

    <XtreamStatusPanel
      v-else-if="navigationError"
      variant="navigation-error"
      :error="navigationError"
    />

    <div v-else class="flex flex-col flex-1">
      <XtreamFilters
        :tabs="tabs"
        :selected-tab="selectedTab"
        :search-query="searchQuery"
        :selected-category-id="selectedCategoryId"
        :category-options="categoryOptions"
        @select-tab="selectTab"
        @update:search-query="searchQuery = $event"
        @update:selected-category-id="selectedCategoryId = $event"
      />

      <XtreamGrid
        :items="pagedItems"
        :search-query="searchQuery"
        :tab-label="tabLabel"
        :can-load-more="canLoadMore"
        @load-more="loadMore"
        @item-click="handleItemClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import XtreamFilters from '@/components/xtream/XtreamFilters.vue'
import XtreamGrid from '@/components/xtream/XtreamGrid.vue'
import XtreamHeader from '@/components/xtream/XtreamHeader.vue'
import XtreamStatusPanel from '@/components/xtream/XtreamStatusPanel.vue'
import { useXtreamView } from '@/views/xtream/useXtreamView'

const {
  tabs,
  selectedTab,
  searchQuery,
  selectedCategoryId,
  isLoading,
  currentSource,
  hasConfiguredSources,
  hasCurrentSource,
  navigationError,
  tabLabel,
  categoryOptions,
  pagedItems,
  canLoadMore,
  selectTab,
  loadMore,
  handleItemClick,
} = useXtreamView()
</script>
