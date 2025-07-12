<template>
  <div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Bookings Over Time</h5>
      <select class="form-select" style="width: 180px" v-model="range" @change="fetchData">
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
      </select>
    </div>
    <div class="card-body" style="min-height: 300px">
      <div v-if="!labels.length" class="text-center text-muted py-5">
        No booking data available.
      </div>
      <canvas v-else ref="canvasRef" style="width: 100%; max-height: 400px" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Chart as ChartJS, registerables } from 'chart.js'
import { supabase } from '@/supabaseClient'

ChartJS.register(...registerables)

const canvasRef = ref(null)
let chartInstance = null

const labels = ref([])
const values = ref([])
const range = ref('7') // default: 7 days

const renderChart = async () => {
  if (chartInstance) chartInstance.destroy()
  await nextTick()
  if (!canvasRef.value) return

  chartInstance = new ChartJS(canvasRef.value, {
    type: 'line',
    data: {
      labels: labels.value,
      datasets: [
        {
          label: 'Bookings',
          data: values.value,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  })
}

const fetchData = async () => {
  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - parseInt(range.value) + 1)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('date_appt')
    .gte('date_appt', start.toISOString().split('T')[0])

  if (error) {
    console.error('Error fetching booking trend:', error)
    return
  }

  const dateMap = {}

  for (let i = 0; i < parseInt(range.value); i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    dateMap[key] = 0
  }

  for (const b of bookings) {
    if (dateMap[b.date_appt] !== undefined) {
      dateMap[b.date_appt]++
    }
  }

  labels.value = Object.keys(dateMap)
  values.value = Object.values(dateMap)

  renderChart()
}

onMounted(fetchData)
</script>
