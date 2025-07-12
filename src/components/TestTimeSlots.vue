<template>
  <div class="card p-4">
    <h4>🧪 Time Slot Algorithm Test</h4>

    <div class="mb-3">
      <label>Test Date:</label>
      <input v-model="testDate" type="date" class="form-control" />
    </div>

    <div class="mb-3">
      <label>Barber:</label>
      <select v-model="testBarberId" class="form-control">
        <option value="">Select barber...</option>
        <option v-for="barber in barbers" :key="barber.id" :value="barber.id">
          {{ barber.name }} {{ barber.surname }}
        </option>
      </select>
    </div>

    <div class="mb-3">
      <h6>Services:</h6>
      <div v-for="service in services" :key="service.id" class="form-check">
        <input
          v-model="selectedServiceIds"
          :value="service.id"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label">
          {{ service.name }} ({{ service.duration }}min) - ${{ service.price }}
        </label>
      </div>
    </div>

    <button @click="runTest" class="btn btn-primary mb-3" :disabled="!canTest">
      🧪 Test Algorithm
    </button>

    <div v-if="testResults !== null" class="alert alert-info">
      <h6>Results:</h6>
      <p><strong>Total Duration:</strong> {{ totalDuration }} minutes</p>
      <p><strong>Available Slots:</strong> {{ testResults.length }}</p>
      <p><strong>Slots:</strong> {{ testResults.join(', ') || 'None available' }}</p>
    </div>

    <div v-if="error" class="alert alert-danger"><strong>Error:</strong> {{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'

export default {
  name: 'TestTimeSlots',
  setup() {
    const testDate = ref(new Date().toISOString().split('T')[0])
    const testBarberId = ref('')
    const selectedServiceIds = ref([])
    const testResults = ref(null)
    const error = ref('')

    const barbers = ref([])
    const services = ref([])

    const selectedServices = computed(() => {
      return services.value.filter((s) => selectedServiceIds.value.includes(s.id))
    })

    const totalDuration = computed(() => {
      return selectedServices.value.reduce((sum, s) => sum + s.duration, 0)
    })

    const canTest = computed(() => {
      return testBarberId.value && selectedServices.value.length > 0
    })

    const loadData = async () => {
      try {
        // Load barbers
        const { data: barberData } = await supabase.from('barbers').select('*')
        barbers.value = barberData || []

        // Load services
        const { data: serviceData } = await supabase.from('services').select('*')
        services.value = serviceData || []

        console.log('✅ Data loaded:', {
          barbers: barbers.value.length,
          services: services.value.length,
        })
      } catch (err) {
        error.value = 'Failed to load data: ' + err.message
      }
    }

    const runTest = async () => {
      try {
        error.value = ''
        testResults.value = null

        console.log('🧪 Starting test with:', {
          date: testDate.value,
          barberId: testBarberId.value,
          services: selectedServices.value.map((s) => s.name),
        })

        // Import here to test if import works
        const { calculateAvailableSlots } = await import('@/utils/universalTimeSlots')
        console.log('✅ Import successful!')

        const results = await calculateAvailableSlots(
          selectedServices.value,
          testDate.value,
          testBarberId.value,
        )

        testResults.value = results
        console.log('✅ Test completed:', results)
      } catch (err) {
        error.value = err.message
        console.error('❌ Test failed:', err)
      }
    }

    onMounted(loadData)

    return {
      testDate,
      testBarberId,
      selectedServiceIds,
      testResults,
      error,
      barbers,
      services,
      selectedServices,
      totalDuration,
      canTest,
      runTest,
    }
  },
}
</script>
