<template>
  <div v-if="visible" class="loading-overlay">
    <img src="/src/assets/loading.gif" alt="Loading..." class="loading-spinner" />
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  gif: {
    type: String,
    default: '/assets/loading.gif'
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
}
</style>
