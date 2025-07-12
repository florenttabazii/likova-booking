<template>
  <div id="app">

    <div class="container py-5">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12 text-center">
          <h2 class="mb-2">{{ currentStepTitle }}</h2>
          <p class="text-muted">{{ currentStepSubtitle }}</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <ProgressBar v-if="showProgressBar" />

      <!-- Main Content with Transitions -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <CookieConsent />

    <!-- Modals -->
    <ConfirmationModal />
    <ValidationModal />
  </div>
</template>

<script>
import { defineComponent, onMounted, computed } from 'vue'
import { useBookingStore } from './stores/booking'
import ProgressBar from './components/ProgressBar.vue'
import ConfirmationModal from './components/ConfirmationModal.vue'
import ValidationModal from './components/ValidationModal.vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CookieConsent from './components/CookieConsent.vue'

export default defineComponent({
  name: 'App',
  components: {
    ProgressBar,
    ConfirmationModal,
    ValidationModal,
    CookieConsent,
  },
  setup() {
    const bookingStore = useBookingStore()
    const route = useRoute()
    const { t } = useI18n()

    onMounted(() => {
      bookingStore.initializeFromStorage()
    })

    const currentStepTitle = computed(() => {
      return t(`booking.steps.${bookingStore.currentStep}.title`)
    })

    const currentStepSubtitle = computed(() => {
      return t(`booking.steps.${bookingStore.currentStep}.subtitle`)
    })

    const showProgressBar = computed(() => route.path.startsWith('/booking'))

    return {
      currentStepTitle,
      currentStepSubtitle,
      showProgressBar,
    }
  },
})
</script>
