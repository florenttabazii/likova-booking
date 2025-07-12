<template>
  <div class="card mt-4">
    <div class="card-header">
      <h5 class="mb-0">Manage Time Slots</h5>
    </div>

    <div class="card-body">
      <!-- Slot Buttons -->
      <div class="d-flex flex-wrap gap-2 mb-3">
        <button
          v-for="(slot, index) in slots"
          :key="index"
          class="btn btn-outline-primary"
          @click="$emit('edit', slot, index)"
        >
          {{ slot }}
        </button>
      </div>

      <!-- Add Form -->
      <form @submit.prevent="addSlot" class="row g-2 align-items-center">
        <div class="col-6">
          <input
            type="text"
            class="form-control"
            :value="newSlot"
            @input="formatNewSlot"
            maxlength="5"
            placeholder="HH:mm"
          />
        </div>
        <div class="col-6">
          <button type="submit" class="btn btn-success w-100">Add Time</button>
        </div>
      </form>

      <div v-if="error" class="text-danger mt-2">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'

const emit = defineEmits(['edit'])

const slots = ref([])
const rowId = ref(null)
const error = ref('')

const newSlot = ref('')

const fetchSlots = async () => {
  const { data, error: fetchError } = await supabase.from('time_slots').select('*').single()

  if (fetchError || !data) {
    error.value = 'Failed to fetch time slots.'
    return
  }

  rowId.value = data.id
  slots.value = data.slots || []
}

const saveSlots = async () => {
  const sorted = [...slots.value].sort()
  const { error: updateError } = await supabase
    .from('time_slots')
    .update({ slots: sorted, updated_at: new Date().toISOString() })
    .eq('id', rowId.value)

  if (updateError) {
    error.value = 'Failed to save time slots.'
  } else {
    error.value = ''
    slots.value = sorted
  }
}

const addSlot = async () => {
  if (!/^\d{2}:\d{2}$/.test(newSlot.value)) {
    error.value = 'Time must be in HH:mm format.'
    return
  }

  if (slots.value.includes(newSlot.value)) {
    error.value = 'This time already exists.'
    return
  }

  slots.value.push(newSlot.value)
  newSlot.value = ''
  await saveSlots()
}

const formatNewSlot = (e) => {
  let digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)

  if (digits.length >= 3) {
    const hh = digits.slice(0, 2)
    const mm = digits.slice(2)

    if (parseInt(hh) > 23 || parseInt(mm) > 59) {
      error.value = 'Invalid time: must be in 24-hour format'
      return
    }

    newSlot.value = `${hh}:${mm}`
  } else {
    newSlot.value = digits
  }

  e.target.value = newSlot.value.slice(0, 5)
}

onMounted(fetchSlots)

// expose for parent if needed
defineExpose({
  slots,
  saveSlots,
})
</script>
