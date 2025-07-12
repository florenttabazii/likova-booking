<template>
  <div class="card mb-4 h-100">
    <div class="card-header">
      <h5 class="mb-0">Bookings Per Barber</h5>
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

const renderChart = async () => {
  if (chartInstance) chartInstance.destroy()
  await nextTick() // <--- THIS is the fix
  if (!canvasRef.value) return

  chartInstance = new ChartJS(canvasRef.value, {
    type: 'bar',
    data: {
      labels: labels.value,
      datasets: [
        {
          label: 'Bookings',
          data: values.value,
          backgroundColor: '#0d6efd',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    },
  })
}

const fetchData = async () => {
  const { data: bookings, error } = await supabase.from('bookings').select('barber_id')

  if (error) {
    console.error('Error fetching bookings:', error)
    return
  }

  const countMap = {}
  for (const b of bookings) {
    if (!b.barber_id) continue
    countMap[b.barber_id] = (countMap[b.barber_id] || 0) + 1
  }

  const { data: barbers, error: barberErr } = await supabase
    .from('barbers')
    .select('id, name, surname')

  if (barberErr) {
    console.error('Error fetching barbers:', barberErr)
    return
  }

  labels.value = []
  values.value = []

  for (const barber of barbers) {
    const fullName = `${barber.name} ${barber.surname}`
    labels.value.push(fullName)
    values.value.push(countMap[barber.id] || 0)
  }

  renderChart()
}

onMounted(fetchData)
</script>
