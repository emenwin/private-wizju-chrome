<template>
  <div class="flex items-center justify-center">
    <Card class="w-full max-w-2xl bg-stream-surface border-stream-border shadow-card">
      <div class="text-center p-4">
        <h2 class="text-2xl text-stream-text mb-2">Edit Source</h2>
        <p class="text-stream-text-muted mb-6">
          Update your streaming source configuration
        </p>
      </div>

      <div class="px-6 py-4 space-y-4">
        <div class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="source-name" class="text-sm font-medium text-stream-text"
                >Source Name</label
              >
              <Input
                id="source-name"
                v-model="formData.name"
                placeholder="e.g., My IPTV Provider"
                class="bg-stream-surface border-stream-border"
              />
            </div>

            <div class="space-y-2">
              <label for="source-type" class="text-sm font-medium text-stream-text"
                >Source Type</label
              >
              <select
                id="source-type"
                v-model="formData.type"
                disabled
                class="flex h-10 w-full rounded-md border border-input bg-stream-surface px-3 py-2 text-sm opacity-50 cursor-not-allowed"
              >
                <option value="m3u">M3U Playlist</option>
                <option value="xtreamcode">Xtream Codes</option>
              </select>
              <p class="text-xs text-stream-text-muted">
                Source type cannot be changed
              </p>
            </div>

            <div class="space-y-2">
              <label for="source-url" class="text-sm font-medium text-stream-text"
                >Source URL</label
              >
              <textarea
                id="source-url"
                v-model="formData.url"
                placeholder="http://your-provider.com/playlist.m3u"
                class="flex min-h-[60px] w-full rounded-md border border-input bg-stream-surface px-3 py-2 text-sm"
              />
              <p class="text-xs text-stream-text-muted">
                Enter your playlist URL or Xtream Codes server URL
              </p>
            </div>

            <div v-if="formData.type === 'xtreamcode'" class="space-y-4">
              <div class="space-y-2">
                <label for="source-username" class="text-sm font-medium text-stream-text"
                  >Username</label
                >
                <Input
                  id="source-username"
                  v-model="formData.username"
                  placeholder="Xtream username"
                  class="bg-stream-surface border-stream-border"
                />
              </div>
              <div class="space-y-2">
                <label for="source-password" class="text-sm font-medium text-stream-text"
                  >Password</label
                >
                <Input
                  id="source-password"
                  v-model="formData.password"
                  type="password"
                  placeholder="Xtream password"
                  class="bg-stream-surface border-stream-border"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between pt-6">
          <Button
            variant="outline"
            @click="handleCancel"
            class="border-stream-border hover:bg-stream-surface-hover"
          >
            Cancel
          </Button>
          <Button
            @click="handleSave"
            :disabled="isLoading"
            class="bg-gradient-primary hover:bg-stream-accent-hover"
          >
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { cn } from '@/utils/cn'
import Card from '@/components/ui/UiCard.vue'
import Button from '@/components/ui/UiButton.vue'
import Input from '@/components/ui/UiInput.vue'
import type { StreamSource } from '@/types/stream'
import { useStreamSourcesStore } from '@/stores/streamSources'

interface Props {
  source: StreamSource
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [source: Partial<StreamSource>]
  cancel: []
}>()

const streamStore = useStreamSourcesStore()

const isLoading = ref(false)
const formData = reactive({
  name: '',
  url: '',
  type: 'm3u' as StreamSource['type'],
  username: '',
  password: '',
})

// Watch for source prop changes to update formData
watch(
  () => props.source,
  (newSource) => {
    if (newSource) {
      formData.name = newSource.name
      formData.url = newSource.url
      formData.type = newSource.type
      formData.username = newSource.username || ''
      formData.password = newSource.password || ''
    }
  },
  { immediate: true }
)

const handleSave = async (): Promise<void> => {
  if (!formData.name || !formData.url || !formData.url.trim()) {
    alert('Please fill in all required fields')
    return
  }

  if (
    formData.type === 'xtreamcode' &&
    (!formData.username || !formData.password || !formData.username.trim())
  ) {
    alert('Please enter your Xtream username and password')
    return
  }

  isLoading.value = true

  try {
    const updatedSource: Partial<StreamSource> & { id: string } = {
      id: props.source.id,
      name: formData.name,
      url: formData.url.trim(),
      type: formData.type,
      username: formData.username.trim(),
      password: formData.password,
    }

    await streamStore.updateSource(updatedSource)
    emit('save', updatedSource)
  } catch (error) {
    console.error('Failed to update source:', error)
    alert(`Failed to update source: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = (): void => {
  emit('cancel')
}
</script>