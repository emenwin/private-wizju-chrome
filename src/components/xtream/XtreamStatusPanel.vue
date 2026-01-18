<template>
  <div v-if="variant === 'loading'" class="flex flex-col items-center justify-center py-12 space-y-4">
    <div class="w-12 h-12 border-4 border-stream-accent border-t-transparent rounded-full animate-spin"></div>
    <p class="text-stream-text-muted">Loading Xtream content...</p>
  </div>

  <div v-else class="text-center py-12">
    <p :class="primaryClass">
      {{ primaryText }}
    </p>
    <p v-if="secondaryText" class="text-sm text-stream-text-muted mt-1">
      {{ secondaryText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type XtreamStatusVariant = 'no-sources' | 'loading' | 'no-source' | 'navigation-error'

type XtreamStatusProps = {
  variant: XtreamStatusVariant
  error?: string | null
}

const props = defineProps<XtreamStatusProps>()

const primaryText = computed(() => {
  if (props.variant === 'no-sources') {
    return 'No streaming sources configured. Add your Xtream Codes source to get started.'
  }
  if (props.variant === 'no-source') {
    return 'Please select a source from the sidebar to view Xtream content.'
  }
  if (props.variant === 'navigation-error') {
    return props.error || 'Unable to open the selected source.'
  }
  return ''
})

const secondaryText = computed(() => {
  if (props.variant === 'no-sources') {
    return 'Go to Settings to configure your sources.'
  }
  if (props.variant === 'navigation-error') {
    return 'The selected source may have been removed.'
  }
  return ''
})

const primaryClass = computed(() =>
  props.variant === 'navigation-error' ? 'text-red-400' : 'text-stream-text-muted',
)
</script>
