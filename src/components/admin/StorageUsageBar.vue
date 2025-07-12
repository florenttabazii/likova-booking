<template>
  <div class="status-bar">
    <label>Storage Usage</label>
    <div class="progress">
      <div class="progress-bar bg-warning" :style="{ width: usage + '%' }">{{ usage }}%</div>
    </div>
  </div>
</template>

<script setup>
const usage = 60 // placeholder percentage (replace later with real data)
</script>

<style scoped>
.status-bar {
  margin-bottom: 1rem;
}
.progress {
  height: 24px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  line-height: 24px;
  color: white;
  text-align: center;
  transition: width 0.3s ease;
}
</style>
