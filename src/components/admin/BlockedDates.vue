<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold">Blocked Dates</h2>

    <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
      <label class="w-100 w-sm-50">
        <span class="text-sm fw-medium">Barber</span>
        <select v-model="selectedBarber" class="form-select">
          <option v-for="barber in barbers" :key="barber.id" :value="barber.id">
            {{ barber.name }} {{ barber.surname }}
          </option>
        </select>
      </label>

      <button class="btn btn-primary" @click="openAddModal">+ Block Dates</button>
    </div>

    <div v-if="loading" class="text-secondary">Loading blocked dates…</div>
    <div v-else-if="!blocked.length" class="text-muted">No blocked dates for this barber.</div>

    <ul class="list-unstyled">
      <li
        v-for="item in blocked"
        :key="item.id"
        class="border p-3 rounded d-flex justify-content-between align-items-center mb-2 shadow-sm"
      >
        <div>
          <div class="fw-medium">
            {{ formatDate(item.start_date) }} → {{ formatDate(item.end_date) }}
          </div>
          <div class="text-muted small" v-if="item.reason">Reason: {{ item.reason }}</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="editItem(item)">Edit</button>
          <button class="btn btn-sm btn-danger" @click="deleteItem(item)">Delete</button>
        </div>
      </li>
    </ul>

    <!-- Inline modal -->
    <div v-if="modalOpen" class="modal-backdrop">
      <div class="modal-box">
        <h5 class="modal-title mb-3">
          {{ editing ? 'Edit Blocked Dates' : 'Add Blocked Dates' }}
        </h5>

        <div class="mb-3">
          <label class="form-label">Start Date</label>
          <input type="date" v-model="form.start_date" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">End Date</label>
          <input type="date" v-model="form.end_date" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Reason (optional)</label>
          <input type="text" v-model="form.reason" class="form-control" />
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" @click="resetModal">Cancel</button>
          <button
            class="btn btn-primary"
            @click="saveBlocked"
            :disabled="!form.start_date || !form.end_date"
          >
            {{ editing ? 'Update' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabaseClient'

const barbers = ref([])
const selectedBarber = ref(null)
const blocked = ref([])
const loading = ref(false)

const modalOpen = ref(false)
const editing = ref(false)
const editingId = ref(null)

const form = ref({
  start_date: '',
  end_date: '',
  reason: ''
})

const fetchBarbers = async () => {
  const { data } = await supabase.from('barbers').select('id, name, surname').order('name')
  barbers.value = data
  if (data?.length && !selectedBarber.value) selectedBarber.value = data[0].id
}

const fetchBlocked = async () => {
  if (!selectedBarber.value) return
  loading.value = true
  const { data } = await supabase
    .from('blocked_appt')
    .select('*')
    .eq('barber_id', selectedBarber.value)
    .order('start_date', { ascending: true })
  blocked.value = data
  loading.value = false
}

const openAddModal = () => {
  modalOpen.value = true
  editing.value = false
  form.value = { start_date: '', end_date: '', reason: '' }
}

const editItem = (item) => {
  modalOpen.value = true
  editing.value = true
  editingId.value = item.id
  form.value = {
    start_date: item.start_date,
    end_date: item.end_date,
    reason: item.reason || ''
  }
}

const deleteItem = async (item) => {
  if (!confirm('Delete this blocked range?')) return
  await supabase.from('blocked_appt').delete().eq('id', item.id)
  fetchBlocked()
}

const saveBlocked = async () => {
  if (editing.value) {
    await supabase
      .from('blocked_appt')
      .update({
        start_date: form.value.start_date,
        end_date: form.value.end_date,
        reason: form.value.reason
      })
      .eq('id', editingId.value)
  } else {
    await supabase.from('blocked_appt').insert({
      barber_id: selectedBarber.value,
      ...form.value
    })
  }
  resetModal()
  fetchBlocked()
}

const resetModal = () => {
  modalOpen.value = false
  editing.value = false
  editingId.value = null
  form.value = { start_date: '', end_date: '', reason: '' }
}

const formatDate = (d) => new Date(d).toLocaleDateString()

watch(selectedBarber, fetchBlocked)
onMounted(() => {
  fetchBarbers()
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
</style>
