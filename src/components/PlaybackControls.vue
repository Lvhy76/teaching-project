<script setup lang="ts">
defineProps<{
  playing: boolean
}>()

const emit = defineEmits<{
  play: []
  pause: []
  reset: []
}>()
</script>

<template>
  <div class="controls">
    <button type="button" :disabled="playing" @click="emit('play')">播放</button>
    <button type="button" :disabled="!playing" @click="emit('pause')">暂停</button>
    <button type="button" class="reset" @click="emit('reset')">重置</button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button {
  min-width: 4.5rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: #1d4ed8;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.reset {
  background: transparent;
  color: #1d4ed8;
}
</style>
