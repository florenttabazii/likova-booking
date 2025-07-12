<template>
  <div v-if="visible">
    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show"></div>

    <!-- Modal Dialog -->
    <div
      class="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      aria-labelledby="validationModalTitle"
      @keydown.esc="hideModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title" id="validationModalTitle">
              <i class="fas fa-exclamation-triangle me-2"></i>{{ $t('modal.attention') }}
            </h5>
            <button type="button" class="btn-close" @click="hideModal" />
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              @click="hideModal"
              ref="okButton"
            >
              {{ $t('modal.ok') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { defineComponent, ref, computed, nextTick, watch } from 'vue'
import { useBookingStore } from '../stores/booking'

export default defineComponent({
  name: 'ValidationModal',
  setup() {
    const bookingStore = useBookingStore()
    const okButton = ref(null)

    const visible = computed(() => bookingStore.showValidationModal)
    const message = computed(() => bookingStore.validationMessage)

    const hideModal = () => {
      bookingStore.hideValidationModal()
    }

    watch(visible, (isVisible) => {
      if (isVisible) {
        nextTick(() => {
          okButton.value?.focus()
        })
      }
    })

    return {
      visible,
      message,
      hideModal,
      okButton,
    }
  },
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
