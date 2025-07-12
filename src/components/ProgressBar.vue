<template>
  <div class="row mb-4">
    <div class="col-12">
      <div class="card">
        <div class="card-body">
          <!-- Progress Bar -->
          <div class="progress mb-3" style="height: 8px">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>

          <!-- Step Indicators -->
          <div class="row text-center">
            <div class="col-3">
              <div class="step-indicator" :class="getStepClass(1)">
                <i class="fas fa-user-friends"></i>
              </div>
              <small class="d-none d-md-block mt-2">{{ $t('progress.barber') }}</small>
            </div>
            <div class="col-3">
              <div class="step-indicator" :class="getStepClass(2)">
                <i class="fas fa-scissors"></i>
              </div>
              <small class="d-none d-md-block mt-2">{{ $t('progress.services') }}</small>
            </div>
            <div class="col-3">
              <div class="step-indicator" :class="getStepClass(3)">
                <i class="fas fa-calendar"></i>
              </div>
              <small class="d-none d-md-block mt-2">{{ $t('progress.booking') }}</small>
            </div>
            <div class="col-3">
              <div class="step-indicator" :class="getStepClass(4)">
                <i class="fas fa-check"></i>
              </div>
              <small class="d-none d-md-block mt-2">{{ $t('progress.confirm') }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useBookingStore } from '../stores/booking'

export default defineComponent({
  name: 'ProgressBar',
  setup() {
    const bookingStore = useBookingStore()

    const progressPercentage = computed(() => bookingStore.progressPercentage)
    const currentStep = computed(() => bookingStore.currentStep)

    const getStepClass = (step) => {
      if (step < currentStep.value) return 'step-completed'
      if (step === currentStep.value) return 'step-active'
      return 'step-inactive'
    }

    return {
      progressPercentage,
      getStepClass,
    }
  },
})
</script>
