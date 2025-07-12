<template>
  <button
    type="button"
    class="btn time-slot w-100"
    :class="{ selected: isSelected }"
    @click="selectSlot"
  >
    {{ slot }}
  </button>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useBookingStore } from '../stores/booking'

export default defineComponent({
  name: 'TimeSlot',
  props: {
    slot: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const bookingStore = useBookingStore()

    const isSelected = computed(() => {
      return bookingStore.booking.timeSlot === props.slot
    })

    const selectSlot = () => {
      bookingStore.selectTimeSlot(props.slot)
    }

    return {
      isSelected,
      selectSlot,
    }
  },
})
</script>
