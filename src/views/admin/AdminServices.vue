<template>
  <div class="d-flex">
    <AdminSidebar />

    <div
      class="admin-main-content p-4"
      :style="{ marginLeft: sidebar.isCollapsed ? '80px' : '250px' }"
    >
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">{{ $t('services.managementTitle') }}</h2>
      </div>

      <div v-if="sections.length === 0" class="d-flex justify-content-center my-5">
        <div class="add-section-card" @click="openAddSectionModal">
          <i class="fas fa-plus fa-2x mb-2"></i>
          <p>{{ $t('services.addSection') }}</p>
        </div>
      </div>

      <input
        v-model="search"
        type="text"
        class="form-control"
        :placeholder="$t('services.searchPlaceholder')"
        style="margin-bottom: 20px"
      />

      <ServiceSection
        v-for="section in filteredSections"
        :key="section.id"
        :section="section"
        @edit-section="editSection"
        @delete-section="openDeleteSectionModal"
        @add-service="openServiceModal"
        @edit-service="editService"
        @refresh="loadSections"
      />

      <div v-if="sections.length > 0" class="d-flex justify-content-center">
        <div class="add-section-card mt-3" @click="openAddSectionModal">
          <i class="fas fa-plus fa-2x mb-2"></i>
          <p>{{ $t('services.addAnotherSection') }}</p>
        </div>
      </div>

      <!-- Modals -->
      <SectionModal
        v-if="showSectionModal"
        :section="editingSection"
        @close="resetSectionModal"
        @save="saveSection"
        @delete="openDeleteSectionModal"
      />

      <ServiceModal
        v-if="showServiceModal"
        :service="editingService"
        :section-id="currentSectionId"
        :isEdit="!!editingService?.id"
        @close="resetServiceModal"
        @save="saveService"
      />

      <DeleteServiceModal
        v-if="showDeleteModal"
        :title="$t('services.deleteServiceTitle')"
        :message="$t('services.deleteServiceMessage', { name: serviceToDelete?.name })"
        @confirm="confirmDeleteService"
        @cancel="cancelDelete"
      />

      <DeleteSectionModal
        v-if="showDeleteSectionModal"
        :title="$t('services.deleteSectionTitle')"
        :message="$t('services.deleteSectionMessage')"
        @confirm="confirmDeleteSection"
        @cancel="cancelSectionDelete"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ServiceSection from '@/components/admin/ServiceSection.vue'
import SectionModal from '@/components/admin/SectionModal.vue'
import ServiceModal from '@/components/admin/ServiceModal.vue'
import DeleteServiceModal from '@/components/admin/DeleteServiceModal.vue'
import DeleteSectionModal from '@/components/admin/DeleteSectionModal.vue'
import { useSidebarStore } from '@/stores/sidebar'

const sidebar = useSidebarStore()

const sections = ref([])
const search = ref('')

const showSectionModal = ref(false)
const editingSection = ref(null)

const showServiceModal = ref(false)
const editingService = ref(null)
const currentSectionId = ref(null)

const showDeleteModal = ref(false)
const serviceToDelete = ref(null)

const showDeleteSectionModal = ref(false)
const sectionToDelete = ref(null)

const openAddSectionModal = () => {
  editingSection.value = null
  showSectionModal.value = true
}

const editSection = (section) => {
  editingSection.value = {
    id: section.id,
    section_title: section.title,
    is_active: section.is_active,
  }
  showSectionModal.value = true
}

const openDeleteSectionModal = (section) => {
  sectionToDelete.value = section
  showDeleteSectionModal.value = true
}

const confirmDeleteSection = async () => {
  const { error } = await supabase
    .from('service_sections')
    .delete()
    .eq('id', sectionToDelete.value.id)
  if (error) {
    alert('Failed to delete section: ' + error.message)
    return
  }
  showDeleteSectionModal.value = false
  sectionToDelete.value = null
  await loadSections()
}

const resetSectionModal = () => {
  editingSection.value = null
  showSectionModal.value = false
}

const saveSection = async (sectionPayload) => {
  const payload = {
    section_title: sectionPayload.section_title,
    is_active: sectionPayload.is_active,
  }

  let error = null
  if (sectionPayload?.id) {
    const res = await supabase.from('service_sections').update(payload).eq('id', sectionPayload.id)
    error = res.error
  } else {
    const res = await supabase.from('service_sections').insert([payload])
    error = res.error
  }

  if (error) alert(error.message)

  resetSectionModal()
  await loadSections()
}

const openServiceModal = (sectionId) => {
  editingService.value = null
  currentSectionId.value = sectionId
  showServiceModal.value = true
}

const editService = (service) => {
  editingService.value = service
  currentSectionId.value = service.section_id
  showServiceModal.value = true
}

const resetServiceModal = () => {
  editingService.value = null
  showServiceModal.value = false
}

const saveService = async (payload) => {
  const body = {
    name: payload.name,
    description: payload.description,
    price: payload.price,
    duration: payload.duration,
    is_active: payload.is_active,
    section_id: currentSectionId.value,
  }

  let error = null
  if (payload.id) {
    const res = await supabase.from('services').update(body).eq('id', payload.id)
    error = res.error
  } else {
    const res = await supabase.from('services').insert([body])
    error = res.error
  }

  if (error) alert(error.message)
  resetServiceModal()
  await loadSections()
}

const cancelDelete = () => {
  showDeleteModal.value = false
  serviceToDelete.value = null
}

const confirmDeleteService = async () => {
  const { error } = await supabase.from('services').delete().eq('id', serviceToDelete.value.id)
  if (error) alert('Delete failed: ' + error.message)
  cancelDelete()
  await loadSections()
}

const loadSections = async () => {
  const { data, error } = await supabase
    .from('service_sections')
    .select(
      `id, section_title, is_active, services (id, name, description, price, duration, is_active, section_id)`,
    ) // prettier-ignore
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading sections:', error)
    return
  }

  sections.value = (data || []).map((section) => ({
    id: section.id,
    title: section.section_title,
    is_active: section.is_active,
    services: section.services || [],
  }))
}

const cancelSectionDelete = () => {
  showDeleteSectionModal.value = false
  sectionToDelete.value = null
}

const filteredSections = computed(() => {
  if (!search.value.trim()) return sections.value
  return sections.value
    .map((section) => {
      const filtered = section.services.filter((s) =>
        s.name.toLowerCase().includes(search.value.toLowerCase()),
      )
      return { ...section, services: filtered }
    })
    .filter((section) => section.services.length > 0)
})

onMounted(loadSections)
</script>

<style scoped>
.add-section-card {
  background: #f1f1f1;
  padding: 2rem;
  width: 100vw;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.add-section-card:hover {
  background: #e7e7e7;
  border-color: #999;
}
</style>
