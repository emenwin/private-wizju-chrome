<template>
  <div class="flex flex-col gap-4 mb-6">
    <!-- Tabs -->
    <!-- Tabs (Segmented Control) -->
    <div class="self-start">
      <div class="inline-flex p-1 bg-stream-surface border border-stream-border rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="
            cn(
              'px-6 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              selectedTab === tab.key
                ? 'bg-stream-accent text-white shadow-sm'
                : 'text-stream-text-muted hover:text-stream-text',
            )
          "
          @click="emit('select-tab', tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Search and Category -->
    <div class="flex flex-col gap-3">
      <!-- Search -->
      <div class="relative w-full">
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
      <!-- Category Filter -->
      <div class="relative group min-w-0 w-full" ref="categoryContainerRef">
        <div 
          class="grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade cursor-grab active:cursor-grabbing select-none"
          ref="scrollContainerRef"
          @scroll="handleScroll"
          @mousedown="startDragging"
          @mouseleave="stopDragging"
          @mouseup="stopDragging"
          @mousemove="onDrag"
        >
          <button
            v-for="category in categoryOptions"
            :key="category.id"
            :data-id="category.id"
            ref="categoryItemRefs"
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
        

        
        <!-- Left Scroll Indicator -->
        <div 
          v-show="canScrollLeft"
          class="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-stream-bg to-transparent pointer-events-none flex items-center justify-start pl-1"
        >
          <svg class="w-5 h-5 text-stream-text-muted animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </div>

        <!-- Right Scroll Indicator -->
        <div 
          v-show="canScrollRight"
          class="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-stream-bg to-transparent pointer-events-none flex items-center justify-end pr-1"
        >
          <svg class="w-5 h-5 text-stream-text-muted animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { XtreamCategoryType } from '@/types/xtream'
import { cn } from '@/utils/cn'
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

type XtreamTab = { key: XtreamCategoryType; label: string }
type CategoryOption = { id: string; name: string }

type XtreamFiltersProps = {
  tabs: XtreamTab[]
  selectedTab: XtreamCategoryType
  searchQuery: string
  selectedCategoryId: string
  categoryOptions: CategoryOption[]
}

const props = defineProps<XtreamFiltersProps>()

const emit = defineEmits<{
  (event: 'select-tab', tab: XtreamCategoryType): void
  (event: 'update:search-query', value: string): void
  (event: 'update:selected-category-id', value: string): void
}>()

const scrollContainerRef = ref<HTMLElement | null>(null)
const categoryItemRefs = ref<HTMLElement[]>([])
const canScrollRight = ref(false)
const canScrollLeft = ref(false)

// Drag to scroll state
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const startDragging = (e: MouseEvent) => {
  const container = scrollContainerRef.value
  if (!container) return
  isDragging.value = true
  startX.value = e.pageX - container.offsetLeft
  scrollLeft.value = container.scrollLeft
}

const stopDragging = () => {
  isDragging.value = false
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
  const container = scrollContainerRef.value
  if (!container) return
  const x = e.pageX - container.offsetLeft
  const walk = (x - startX.value) * 2 // Scroll-fast
  container.scrollLeft = scrollLeft.value - walk
}

const scrollToSelected = () => {
  if (!props.selectedCategoryId || categoryItemRefs.value.length === 0) return
  
  const element = categoryItemRefs.value.find(
    el => el?.dataset?.id === props.selectedCategoryId
  )
  
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

const checkScroll = () => {
  const el = scrollContainerRef.value
  if (!el) return
  
  // Allow a small buffer (e.g. 1px) for calculation output differences
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollWidth > el.clientWidth + el.scrollLeft + 1
}

const handleScroll = () => {
  checkScroll()
}

// Watch for category options changes to re-check scroll
watch(() => props.categoryOptions, async () => {
  await nextTick()
  checkScroll()
  // Refresh refs order if needed, but v-for usually handles it.
  // We might need to ensure refs are up to date before scrolling
}, { deep: true })

watch(() => props.selectedCategoryId, async () => {
  await nextTick()
  scrollToSelected()
})

onMounted(() => {
  checkScroll()
  window.addEventListener('resize', checkScroll)
  // Initial scroll to selected
  setTimeout(scrollToSelected, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll)
})

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:search-query', target.value)
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.mask-fade {
  mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);
}
</style>
