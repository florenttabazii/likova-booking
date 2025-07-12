<template>
  <div class="container">
    <LoadingOverlay :visible="isLoading" gif="/assets/loading.gif" />

    <div class="row justify-content-center">
      <div
        v-for="barber in barbers"
        :key="barber.id"
        class="col-12 col-sm-8 col-md-6 col-lg-4 col-xl-3 d-flex justify-content-center mb-4"
        @click="selectBarber(barber.id)"
      >
        <BarberCard :barber="barber" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBarbersStore } from '../stores/barbers'
import { useBookingStore } from '../stores/booking'
import BarberCard from '../components/BarberCard.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

export default defineComponent({
  name: 'BarberSelection',
  components: {
    BarberCard,
    LoadingOverlay,
  },
  setup() {
    const router = useRouter()
    const barbersStore = useBarbersStore()
    const bookingStore = useBookingStore()
    const isLoading = ref(true)

    const barbers = computed(() => barbersStore.barbers)

    onMounted(async () => {
      isLoading.value = true
      await barbersStore.loadBarbers()
      isLoading.value = false
    })

    const selectBarber = (barberId) => {
      barbersStore.selectedBarberId = barberId
      bookingStore.updateBookingField('barber_id', barberId)
      router.push('/booking/services')
    }

    return {
      barbers,
      selectBarber,
      isLoading,
    }
  },
})
</script>
