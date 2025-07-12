<template>
  <div class="service-card p-3 h-100" :class="{ selected: isSelected }" @click="toggleService">
    <h5>{{ service.name }}</h5>
    <p class="text-muted small">{{ service.description }}</p>
    <div class="d-flex justify-content-between">
      <span class="text-success fw-bold">{{ service.price }}CH₣</span>
      <span class="text-muted">{{ service.duration }} min</span>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useServicesStore } from '../stores/services'

export default defineComponent({
  name: 'ServiceCard',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const servicesStore = useServicesStore()

    const isSelected = computed(() => {
      return servicesStore.selectedServices.includes(props.service.id)
    })

    const toggleService = () => {
      servicesStore.toggleService(props.service.id)
    }

    return {
      isSelected,
      toggleService,
    }
  },
})
</script>
