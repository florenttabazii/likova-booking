<template>
  <div class="d-flex">
    <AdminSidebar />

    <div
      class="flex-grow-1 p-4 transition-all"
      :style="{ marginLeft: sidebar.isCollapsed ? '80px' : '250px' }"
    >
      <h2 class="mb-4">{{ $t('systemStatus.title') }}</h2>

      <DatabaseUsageBar />

      <div class="card mb-4">
        <div class="card-body d-flex align-items-end flex-wrap justify-content-between gap-3">
          <!-- Manual Cleanup -->
          <div>
            <label class="form-label mb-1">
              <strong>{{ $t('systemStatus.manualCleanup.label') }}</strong>
            </label>
            <div class="d-flex gap-2">
              <select v-model="cleanupMonths" class="form-select" style="width: 160px">
                <option value="1">{{ $t('systemStatus.manualCleanup.options.1') }}</option>
                <option value="2">{{ $t('systemStatus.manualCleanup.options.2') }}</option>
                <option value="3">{{ $t('systemStatus.manualCleanup.options.3') }}</option>
                <option value="6">{{ $t('systemStatus.manualCleanup.options.6') }}</option>
              </select>
              <button class="btn btn-danger" @click="confirmManualCleanup">
                <i class="fas fa-trash-alt me-1"></i> {{ $t('systemStatus.manualCleanup.button') }}
              </button>
            </div>
          </div>

          <!-- Auto Cleanup -->
          <div>
            <label class="form-label mb-1">
              <strong>{{ $t('systemStatus.autoCleanup.label') }}</strong>
            </label>
            <div class="d-flex gap-2 align-items-center">
              <select v-model="autoCleanupMonths" class="form-select" style="width: 160px">
                <option value="1">{{ $t('systemStatus.autoCleanup.options.1') }}</option>
                <option value="2">{{ $t('systemStatus.autoCleanup.options.2') }}</option>
                <option value="3">{{ $t('systemStatus.autoCleanup.options.3') }}</option>
              </select>
              <button
                class="btn"
                :class="autoCleanupEnabled ? 'btn-success' : 'btn-outline-secondary'"
                @click="confirmToggleAutoCleanup"
              >
                <i :class="autoCleanupEnabled ? 'fas fa-check-circle' : 'fas fa-power-off'"></i>
                {{ autoCleanupEnabled
                  ? $t('systemStatus.autoCleanup.enabled')
                  : $t('systemStatus.autoCleanup.enable') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmation -->
    <template v-if="showConfirmModal">
      <div class="modal-overlay" @click.self="showConfirmModal = false">
        <div class="modal-box">
          <h5 class="modal-title">{{ confirmTitle }}</h5>
          <p class="modal-message">{{ confirmMessage }}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary w-100" @click="showConfirmModal = false">
              {{ $t('common.cancel') }}
            </button>
            <button class="btn btn-danger w-100" @click="executeConfirmedAction">
              {{ $t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import DatabaseUsageBar from '@/components/admin/DatabaseUsageBar.vue'
import { useSidebarStore } from '@/stores/sidebar'

const sidebar = useSidebarStore()

const cleanupMonths = ref(3)
const autoCleanupMonths = ref(1)
const autoCleanupEnabled = ref(false)

const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref(null)

const loadCleanupSettings = async () => {
  const { data, error } = await supabase
    .from('cleanup_settings')
    .select('enabled, interval_months, last_run_at')
    .eq('id', 'singleton-id')
    .maybeSingle()

  if (error) {
    console.error('❌ Failed to fetch cleanup settings:', error)
    return
  }

  autoCleanupEnabled.value = !!data?.enabled
  autoCleanupMonths.value = data?.interval_months ?? 1

  if (
    autoCleanupEnabled.value &&
    autoCleanupMonths.value > 0 &&
    shouldRunCleanup(data.last_run_at, autoCleanupMonths.value)
  ) {
    await runCleanup(autoCleanupMonths.value)
  }
}

const shouldRunCleanup = (lastRunAt, months) => {
  if (!lastRunAt) return true
  const lastRun = new Date(lastRunAt).getTime()
  const now = Date.now()
  const intervalMs = months * 30 * 24 * 60 * 60 * 1000
  return now - lastRun > intervalMs
}

const runCleanup = async (months) => {
  const days = months * 30
  const { error } = await supabase.rpc('clean_old_bookings', { days })

  if (!error) {
    await supabase
      .from('cleanup_settings')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', 'singleton-id')

    console.log('✅ Auto-cleanup complete.')
  } else {
    console.error('❌ Auto-cleanup failed:', error)
  }
}

const handleManualCleanup = async () => {
  const days = cleanupMonths.value * 30
  const { error } = await supabase.rpc('clean_old_bookings', { days })

  if (error) {
    console.error('❌ Cleanup failed:', error)
    alert('Manual cleanup failed.')
  } else {
    alert(`✅ Cleaned bookings older than ${cleanupMonths.value} months.`)
  }
}

const toggleAutoCleanup = async () => {
  const newEnabled = !autoCleanupEnabled.value

  const { error } = await supabase.from('cleanup_settings').upsert(
    {
      id: 'singleton-id',
      enabled: newEnabled,
      interval_months: newEnabled ? autoCleanupMonths.value : null,
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.error('❌ Failed to update auto-cleanup:', error)
    alert('Failed to update auto-cleanup setting.')
    return
  }

  await loadCleanupSettings()
}

// Modal logic
const confirmManualCleanup = () => {
  confirmTitle.value = 'Confirm Manual Cleanup'
  confirmMessage.value = `This will delete bookings older than ${cleanupMonths.value} months. Are you sure?`
  confirmAction.value = handleManualCleanup
  showConfirmModal.value = true
}

const confirmToggleAutoCleanup = () => {
  const action = autoCleanupEnabled.value ? 'disable' : 'enable'
  confirmTitle.value = `Confirm Auto-Cleanup ${action}`
  confirmMessage.value = autoCleanupEnabled.value
    ? 'Are you sure you want to disable auto-cleanup?'
    : `This will enable auto-cleanup to run every ${autoCleanupMonths.value} months. Proceed?`
  confirmAction.value = toggleAutoCleanup
  showConfirmModal.value = true
}

const executeConfirmedAction = async () => {
  showConfirmModal.value = false
  if (confirmAction.value) await confirmAction.value()
}

onMounted(loadCleanupSettings)
</script>

<style scoped>
.card-title {
  font-weight: 600;
}

.card-body select.form-select {
  font-size: 0.9rem;
}

button.btn i {
  font-size: 0.9rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1055;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0;
}

.modal-message {
  font-size: 0.95rem;
  color: #555;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
