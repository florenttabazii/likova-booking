<template>
  <div class="card mb-4 h-100">
    <div class="card-header d-flex align-items-center gap-2">
      <i :class="`fas fa-${icon} text-${variant}`"></i>
      <span class="text-muted small">{{ $t(label) }}</span>
    </div>
    <div class="card-body">
      <h3 class="fw-bold text-dark mb-0">{{ displayValue }}</h3>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'

const props = defineProps({
  label: String,
  icon: String,
  variant: String,
  type: {
    type: String,
    default: 'static', // Can be 'static', 'attendance', 'total-bookings', or 'no-shows'
  },
  value: [String, Number], // Used for static cards like Avg Services
})

const displayValue = ref(props.value ?? '—')

const today = new Date().toLocaleDateString('sv-SE') // Format today's date as "yyyy-mm-dd"

const fetchAttendanceStats = async () => {
  const { data, error } = await supabase.from('bookings').select('status, date_appt')

  if (error) {
    console.error('Error fetching no-show stats:', error)
    return
  }

  const todayBookings = data.filter((b) => b.date_appt === today)

  const noShows = todayBookings.filter((b) => b.status === 'no-show').length
  const attended = todayBookings.filter((b) => b.status === 'confirmed').length

  if (props.type === 'no-shows') {
    displayValue.value = `${noShows}`
  } else if (props.type === 'attended') {
    displayValue.value = `${attended}`
  }
}

const fetchTotalBookings = async () => {
  const { data, error } = await supabase.from('bookings').select('id').eq('date_appt', today) // Filter for today's bookings only

  if (error) {
    console.error('Error fetching total bookings:', error)
    return
  }

  displayValue.value = data.length
}

onMounted(() => {
  if (props.type === 'no-shows' || props.type === 'attended') {
    fetchAttendanceStats()
  } else if (props.type === 'total-bookings') {
    fetchTotalBookings()
  }
})
</script>

<style scoped>
.card-title {
  font-size: 1.1rem;
}
.card-text {
  min-height: 3em;
}
</style>
