<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <transition name="fade">
      <div class="delete-modal">
        <!-- Header -->
        <div class="delete-header d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0 text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>{{ title }}
          </h5>
          <button class="btn-close" @click="$emit('cancel')"></button>
        </div>

        <!-- Body -->
        <div class="delete-body">
          <p>{{ message }}</p>
        </div>

        <!-- Footer -->
        <div class="delete-footer mt-3">
          <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
          <button class="btn btn-danger" @click="$emit('confirm')">Yes, Delete</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String,
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  width: 100vw;
  height: 100vh;
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete-modal {
  background: #fff;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.delete-header {
  border-bottom: 1px solid #dee2e6;
}

.delete-body {
  padding-top: 0.5rem;
}

.delete-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Optional fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
