<template>
  <div class="card mb-4 h-100">
    <div class="card-header">
      <h5 class="mb-0">Most Popular Services</h5>
    </div>
    <div class="card-body" style="min-height: 300px">
      <div v-if="!labels.length" class="text-center text-muted py-5">
        No service data available.
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

const renderChart = async () => {
  if (chartInstance) chartInstance.destroy()
  await nextTick() // wait until canvas is in DOM
  if (!canvasRef.value) return

  chartInstance = new ChartJS(canvasRef.value, {
    type: 'pie',
    data: {
      labels: labels.value,
      datasets: [
        {
          data: values.value,
          backgroundColor: ['#0d6efd', '#6f42c1', '#fd7e14', '#198754', '#dc3545', '#20c997'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  })
}

const fetchData = async () => {
  const { data: bsData, error } = await supabase.from('booking_services').select('service_id')

  if (error) {
    console.error('Error fetching booking_services:', error)
    return
  }

  const countMap = {}
  for (const row of bsData) {
    countMap[row.service_id] = (countMap[row.service_id] || 0) + 1
  }

  const { data: services, error: serviceErr } = await supabase.from('services').select('id, name')

  if (serviceErr) {
    console.error('Error fetching services:', serviceErr)
    return
  }

  labels.value = []
  values.value = []

  for (const service of services) {
    labels.value.push(service.name)
    values.value.push(countMap[service.id] || 0)
  }

  renderChart()
}

onMounted(fetchData)
</script>
