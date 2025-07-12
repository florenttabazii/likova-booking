<template>
  <div
    class="card barber-card h-100"
    :class="{ 'border-primary': isSelected }"
    @click="selectBarber"
    style="cursor: pointer"
  >
    <div class="card-body text-center p-4">
      <img :src="barber.avatar_url" :alt="barber.name" class="profile-img mb-3" />
      <h4 class="card-title mb-2">{{ barber.name }} {{ barber.surname }}</h4>

      <button
        class="btn w-100"
        :class="isSelected ? 'btn-primary' : 'btn-outline-primary'"
        @click.stop="handleSelect"
      >
          <span class="d-none d-md-inline ms-2"></span>
        {{ $t(isSelected ? 'barberCard.selected' : 'barberCard.select') }}
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useBarbersStore } from '../stores/barbers'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'BarberCard',
  props: {
    barber: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const barbersStore = useBarbersStore()
    const router = useRouter()

    const isSelected = computed(() => {
      return barbersStore.selectedBarberId === props.barber.id
    })

    const handleSelect = () => {
      if (!isSelected.value) {
        barbersStore.selectBarber(props.barber.id)
        router.push('/booking/services')
      }
    }

    return {
      isSelected,
      handleSelect,
    }
  },
})
</script>
