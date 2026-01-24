<template>
  <Card :class="[SURFACE_COLOR, BORDER_COLOR, SHADOW_SMALL, TRANSITION_DURATION]">
    <div :class="[CARD_PADDING, 'space-y-4']">
      <div class="flex items-center justify-between">
        <h2 :class="[SUBTITLE_SIZE, 'font-semibold', TEXT_COLOR]">Seasons</h2>
        <span v-if="seasonOptions.length" :class="[SMALL_SIZE, TEXT_MUTED_COLOR]">
          {{ seasonOptions.length }} seasons
        </span>
      </div>
      <div v-if="seasonOptions.length" class="flex flex-wrap" :class="GAP_SMALL">
        <button
          v-for="season in seasonOptions"
          :key="season.seasonNumber"
          :class="[
            'px-3 py-2',
            SMALL_SIZE,
            'rounded-full border',
            TRANSITION_DURATION,
            HOVER_SCALE,
            selectedSeason === season.seasonNumber
              ? BUTTON_VARIANT_SELECTED
              : BUTTON_VARIANT_OUTLINE
          ]"
          @click="selectSeason(season.seasonNumber)"
        >
          {{ season.name || `Season ${season.seasonNumber}` }}
        </button>
      </div>
      <p v-else :class="[SMALL_SIZE, TEXT_MUTED_COLOR]">No seasons data available.</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/ui/UiCard.vue'
import {
  CARD_PADDING,
  GAP_SMALL,
  SHADOW_SMALL,
  TRANSITION_DURATION,
  HOVER_SCALE,
  SUBTITLE_SIZE,
  SMALL_SIZE,
  SURFACE_COLOR,
  BORDER_COLOR,
  TEXT_COLOR,
  TEXT_MUTED_COLOR,
  BUTTON_VARIANT_OUTLINE,
  BUTTON_VARIANT_SELECTED,
} from '@/constants/ui'

type SeasonOption = {
  seasonNumber: number
  name?: string
  cover?: string
  overview?: string
  airDate?: string
  episodeCount?: number
}

interface Props {
  seasonOptions: SeasonOption[]
  selectedSeason: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectSeason: [seasonNumber: number]
}>()

const selectSeason = (seasonNumber: number) => {
  emit('selectSeason', seasonNumber)
}
</script>