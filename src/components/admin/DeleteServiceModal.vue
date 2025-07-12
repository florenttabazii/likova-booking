<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="admin-modal text-center">
      <h5 class="mb-3">{{ title }}</h5>
      <p>{{ message }}</p>
      <div class="d-flex justify-content-between mt-4">
        <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-danger" @click="handleConfirm">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  message: String,
  action: Function,
})
const emit = defineEmits(['confirm', 'cancel'])

const handleConfirm = async () => {
  try {
    await props.action?.()
    emit('confirm')
  } catch (err) {
    alert('Delete failed: ' + (err?.message || 'Unknown error'))
    emit('cancel')
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 100vw;
  height: 100vh;
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
}
.admin-modal {
  background: white;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  border-radius: 8px;
}
</style>
