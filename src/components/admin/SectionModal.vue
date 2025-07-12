<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="admin-modal">
      <div class="modal-header d-flex justify-content-between align-items-center mb-3">
        <h5>{{ modalTitle }}</h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>

      <div class="modal-content-box">
        <div class="mb-3">
          <label class="form-label">Section Title</label>
          <input
            v-model="form.section_title"
            type="text"
            class="form-control"
            placeholder="e.g. Haircuts"
          />
        </div>

        <!-- Styled Toggle -->
        <div class="mb-3">
          <input
            type="checkbox"
            class="btn-check"
            id="section-active-toggle"
            v-model="form.is_active"
            autocomplete="off"
          />
          <label
            class="btn btn-sm"
            :class="form.is_active ? 'btn-outline-success' : 'btn-outline-secondary'"
            for="section-active-toggle"
          >
            {{ form.is_active ? 'Active' : 'Inactive' }}
          </label>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>

          <div class="d-flex gap-2">
            <button v-if="props.section?.id" class="btn btn-outline-danger" @click="deleteSection">
              Delete
            </button>

            <button
              class="btn btn-dark"
              @click="submitSection"
              :disabled="!form.section_title.trim()"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  section: Object,
})

const emit = defineEmits(['close', 'save', 'delete'])

const form = ref({
  section_title: '',
  is_active: true,
})

const modalTitle = computed(() => (props.section?.id ? 'Edit Section' : 'Add Section'))

const resetForm = () => {
  form.value = {
    section_title: '',
    is_active: true,
  }
}

watch(
  () => props.section,
  (val) => {
    if (val?.id) {
      form.value = {
        section_title: val.section_title || '',
        is_active: val.is_active ?? true,
        id: val.id,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const submitSection = () => {
  emit('save', { ...form.value })
}

const deleteSection = () => {
  emit('delete', props.section)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.admin-modal {
  background: white;
  padding: 2rem;
  width: 500px;
  border-radius: 8px;
  max-width: 95vw;
}
</style>
