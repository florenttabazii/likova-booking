<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="admin-modal">
      <div class="modal-header d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">
          {{ isEdit ? $t('serviceModal.editService') : $t('serviceModal.addService') }}
        </h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>

      <div class="modal-content-box">
        <div class="mb-3">
          <label class="form-label">{{ $t('serviceModal.fields.name') }}</label>
          <input v-model="localService.name" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">{{ $t('serviceModal.fields.description') }}</label>
          <textarea v-model="localService.description" class="form-control" rows="2" />
        </div>

        <div class="mb-3">
          <label class="form-label">{{ $t('serviceModal.fields.price') }} ($)</label>
          <input v-model.number="localService.price" type="number" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">{{ $t('serviceModal.fields.duration') }} ({{ $t('serviceModal.unitMinutes') }})</label>
          <input v-model.number="localService.duration" type="number" class="form-control" />
        </div>

        <!-- Status toggle switch -->
        <div class="mb-3">
          <label class="form-label">{{ $t('serviceModal.fields.status') }}</label>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="isActiveSwitch"
              v-model="localService.is_active"
            />
            <label class="form-check-label" for="isActiveSwitch">
              {{ localService.is_active ? $t('serviceModal.active') : $t('serviceModal.inactive') }}
            </label>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
          <button class="btn btn-primary" @click="submit">{{ $t('common.saveChanges') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  service: Object,
  isEdit: Boolean,
})

const emit = defineEmits(['save', 'close'])

const localService = reactive({
  id: null,
  name: '',
  description: '',
  price: 0,
  duration: 30,
  is_active: true,
  section_id: null,
})

watch(
  () => props.service,
  (val) => {
    if (val) Object.assign(localService, val)
  },
  { immediate: true },
)

const submit = () => {
  emit('save', { ...localService })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.admin-modal {
  background: #fff;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  border-radius: 8px;
}
</style>
