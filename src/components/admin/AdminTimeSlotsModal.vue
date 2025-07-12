<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    style="background: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Time Slot</h5>
          <button class="btn btn-secondary" @click="$emit('close')">Close</button>
        </div>
        <div class="modal-body">
          <input
            type="text"
            class="form-control"
            :value="tempSlot"
            @input="formatInput($event)"
            maxlength="5"
            placeholder="HH:mm"
          />

          <div v-if="error" class="text-danger mt-2">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" @click="handleDelete">Delete</button>
          <button class="btn btn-primary" @click="handleSave">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  slot: String,
  index: Number,
})

const emits = defineEmits(['save', 'delete', 'close'])

const tempSlot = ref(props.slot || '')
const error = ref('')

const formatInput = (e) => {
  let digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 4) // only digits, max 4

  if (digits.length >= 3) {
    const hh = digits.slice(0, 2)
    const mm = digits.slice(2)

    if (parseInt(hh) > 23 || parseInt(mm) > 59) {
      error.value = 'Invalid time: must be in 24-hour format'
      return
    }

    tempSlot.value = `${hh}:${mm}`
  } else {
    tempSlot.value = digits
  }

  // prevent manual typing beyond 5 visible characters
  e.target.value = tempSlot.value.slice(0, 5)
}

watch(
  () => props.slot,
  (newVal) => {
    tempSlot.value = newVal
    error.value = ''
  },
)

const handleSave = () => {
  if (!/^\d{2}:\d{2}$/.test(tempSlot.value)) {
    error.value = 'Time must be in HH:mm format.'
    return
  }
  emits('save', tempSlot.value, props.index)
}

const handleDelete = () => {
  emits('delete', props.index)
}
</script>
