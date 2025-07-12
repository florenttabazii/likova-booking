<template>
  <div class="service-section mb-5 p-3 bg-white shadow-sm">
    <!-- Section Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="text-primary mb-0">{{ section.title }}</h4>
      <button class="btn btn-outline-danger btn-sm" @click="$emit('edit-section', section)">
        <i class="fas fa-edit me-1"></i> {{ $t('serviceSection.editSection') }}
      </button>
    </div>

    <!-- Services Grid -->
    <div class="row">
      <div v-for="service in section.services" :key="service.id" class="col-md-4 mb-3">
        <ServiceCard
          :service="service"
          @edit="emitEdit(service)"
          @delete="openDeleteServiceModal(service)"
          @toggle="toggleService"
        />
      </div>

      <!-- Add Service Button (inside grid) -->
      <div
        v-if="section.services.length < 3"
        class="col-md-4 mb-3 d-flex align-items-center justify-content-center"
      >
        <div class="add-service-card" @click="emitAddService">
          <i class="fas fa-plus fa-2x text-muted"></i>
        </div>
      </div>
    </div>

    <!-- Add Service Button (Bottom) -->
    <div class="text-end mt-2">
      <button class="btn btn-dark" @click="emitAddService">
        <i class="fas fa-plus me-2"></i>{{ $t('serviceSection.addService') }}
      </button>
    </div>

    <!-- Delete Service Modal -->
    <DeleteServiceModal
      v-if="showDeleteModal"
      :title="$t('serviceSection.deleteTitle')"
      :message="$t('serviceSection.deleteMessage', { name: serviceToDelete?.name })"
      :action="confirmDeleteService"
      @confirm="handleServiceDeleted"
      @cancel="cancelDelete"
    />
  </div>
</template>


<script setup>
import { ref } from 'vue'
import ServiceCard from './ServiceCard.vue'
import DeleteServiceModal from './DeleteServiceModal.vue'
import { supabase } from '@/supabaseClient'

const props = defineProps({
  section: Object,
})

const emit = defineEmits(['edit-section', 'add-service', 'edit-service', 'refresh'])

const emitEdit = (service) => {
  emit('edit-service', service)
}
const emitAddService = () => {
  emit('add-service', props.section.id)
}

const toggleService = async (service) => {
  const newStatus = !service.is_active
  const { error } = await supabase
    .from('services')
    .update({ is_active: newStatus })
    .eq('id', service.id)
  if (!error) {
    service.is_active = newStatus
  } else {
    console.error('Failed to update service status:', error)
  }
}

// Delete modal logic
const showDeleteModal = ref(false)
const serviceToDelete = ref(null)

const openDeleteServiceModal = (service) => {
  serviceToDelete.value = service
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  serviceToDelete.value = null
}

const confirmDeleteService = async () => {
  const { error } = await supabase.from('services').delete().eq('id', serviceToDelete.value.id)
  if (error) throw new Error(error.message)
}

const handleServiceDeleted = async () => {
  cancelDelete()
  emit('refresh') // reload sections from parent
}
</script>

<style scoped>
.service-section {
  border: 1px solid #dee2e6;
  border-radius: 0px;
}

.add-service-card {
  border: 2px solid #ccc;
  height: 100%;
  min-height: 120px;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s ease;
}
.add-service-card:hover {
  background-color: #f8f9fa;
}
</style>
