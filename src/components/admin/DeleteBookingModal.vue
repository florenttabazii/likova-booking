<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="admin-modal">
      <div class="modal-header d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Delete Booking</h5>
        <button class="btn-close" @click="$emit('cancel')"></button>
      </div>

      <div class="modal-body mb-3">
        <p>Are you sure you want to delete this booking?</p>
        <p class="text-danger small">
          This action is permanent. All related availability and services will be released.
        </p>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-danger" @click="$emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['bookingId'])
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.admin-modal {
  background: white;
  padding: 2rem;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>
