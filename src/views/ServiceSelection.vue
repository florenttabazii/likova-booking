<template>
  <div>
    <LoadingOverlay :visible="isLoading" gif="/assets/loading.gif" />

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div v-for="(sectionServices, section) in groupedServices" :key="section" class="mb-4">
              <h4 class="mb-3 text-primary">{{ $t(`services.section.${section}`, section) }}</h4>
              <div class="row mb-4">
                <div v-for="service in sectionServices" :key="service.id" class="col-md-4 mb-3">
                  <ServiceCard
                    :service="service"
                    :selected="selectedServices.includes(service.id)"
                    @toggle="servicesStore.toggleService(service.id)"
                  />
                </div>
              </div>
            </div>

            <!-- Total Summary -->
            <div class="d-flex justify-content-center mb-3">
              <div class="card bg-light text-center" style="max-width: 300px; width: 100%;">
                <div class="card-body">
                  <h4 class="mb-1">{{ $t('services.total') }}: {{ totalPrice }} CH₣</h4>
                  <small class="text-muted">
                    {{ selectedServicesCount }} {{ $t('services.selected') }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="row">
              <div class="col-6">
                <button type="button" class="btn btn-secondary w-100" @click="goBack">
                  <i class="fas fa-arrow-left me-2"></i>
                  <span class="d-none d-md-inline ms-2">{{ $t('common.back') }}</span>
                </button>
              </div>
              <div class="col-6">
                <button type="button" class="btn btn-primary w-100" @click="validateAndContinue">
                  <span class="d-none d-md-inline ms-2">{{ $t('common.continue') }}</span>
                  <i class="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '../stores/services'
import { useBookingStore } from '../stores/booking'
import ServiceCard from '../components/ServiceCard.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

export default defineComponent({
  name: 'ServiceSelection',
  components: {
    ServiceCard,
    LoadingOverlay,
  },
  setup() {
    const router = useRouter()
    const servicesStore = useServicesStore()
    const bookingStore = useBookingStore()
    const isLoading = ref(true)

    onMounted(async () => {
      isLoading.value = true
      await servicesStore.fetchServices()
      isLoading.value = false
    })

    const groupedServices = computed(() => servicesStore.groupedServices)
    const selectedServices = computed(() => servicesStore.selectedServices)
    const totalPrice = computed(() => servicesStore.totalPrice)
    const selectedServicesCount = computed(() => servicesStore.selectedServices.length)

    watch(
      () => servicesStore.selectedServices,
      (newVal) => {
        console.log('🟢 Services selected:', newVal)
      },
      { deep: true },
    )

    const goBack = () => {
      router.push('/booking/barber-selection')
    }

    const validateAndContinue = () => {
      if (servicesStore.selectedServices.length === 0) {
        bookingStore.showValidation('Please select at least one service.')
        return
      }
      router.push('/booking/form')
    }

    return {
      servicesStore,
      groupedServices,
      selectedServices,
      totalPrice,
      selectedServicesCount,
      goBack,
      validateAndContinue,
      isLoading,
    }
  },
})
</script>
