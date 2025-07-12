<template>
  <Teleport to="body">
    <div class="modal fade show" tabindex="-1" style="display: block" @click.self="$emit('close')">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-shield-alt me-2"></i>Privacy Policy</h5>
            <button
              type="button"
              class="btn-close"
              @click="$emit('close')"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body" style="max-height: 60vh; overflow-y: auto">
            <div class="privacy-content">
              <h6>Data Collection & Usage</h6>
              <p>
                Your privacy is important to us. By booking an appointment, you agree to the
                collection and use of your personal data (such as name, phone, and email) solely for
                the purpose of managing your booking and providing our barbering services.
              </p>

              <h6>Information We Collect</h6>
              <ul>
                <li>Name and contact information</li>
                <li>Appointment preferences and history</li>
                <li>Communication records related to your bookings</li>
              </ul>

              <h6>Data Protection</h6>
              <p>
                We do not share your information with third parties except as necessary to provide
                our services. Your data is stored securely and access is limited to authorized
                personnel only.
              </p>

              <h6>Your Rights</h6>
              <p>
                You can request data deletion, modification, or a copy of your personal data at any
                time by contacting us directly. We will respond to your request within 30 days.
              </p>

              <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Contact us:</strong> For any privacy-related questions, please email us or
                call during business hours.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal backdrop -->
    <div class="modal-backdrop fade show"></div>
  </Teleport>
</template>

<script>
import { defineComponent, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'PrivacyPolicyModal',
  emits: ['close'],
  setup(props, { emit }) {
    // Prevent body scroll when modal is open
    onMounted(() => {
      document.body.classList.add('modal-open')
      // Close on Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          emit('close')
        }
      }
      document.addEventListener('keydown', handleEscape)

      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    })

    onUnmounted(() => {
      document.body.classList.remove('modal-open')
    })

    return {}
  },
})
</script>

<style scoped>
.privacy-content h6 {
  color: #495057;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.privacy-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.privacy-content ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.privacy-content li {
  margin-bottom: 0.25rem;
}
</style>
