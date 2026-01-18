<template>
  <div class="flex items-center justify-between mb-6 flex-shrink-0">
    <div>
      <h1 class="text-2xl font-bold text-stream-text">Xtream Codes</h1>
      <p v-if="currentSource" class="text-sm text-stream-text-muted mt-1">
        Source: {{ currentSource.name }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StreamSource } from '@/types/stream'

defineProps<{ currentSource: StreamSource | null }>()
</script>
