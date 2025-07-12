<template>
  <div class="card mb-4">
    <div class="card-header d-flex align-items-center gap-2">
      <i class="fas fa-database text-primary"></i>
      <span class="text-muted small">{{ $t('databaseUsage.title') }}</span>
    </div>
    <div class="card-body">
      <div class="progress mb-2" style="height: 10px">
        <div class="progress-bar bg-primary" :style="{ width: `${usagePercent || 0}%` }"></div>
      </div>
      <small class="text-muted">
        {{ $t('databaseUsage.usage', {
          used: estimatedMB || '—',
          percent: usagePercent || '—'
        }) }}
      </small>
    </div>
  </div>
</template>


<script setup>
import { onMounted } from 'vue'
import { useDatabaseUsage } from '@/composables/useDatabaseUsage'

const { usagePercent, estimatedMB, fetchUsage } = useDatabaseUsage()

onMounted(() => {
  fetchUsage()
})
</script>
