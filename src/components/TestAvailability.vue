<template>
  <div class="p-4 max-w-6xl mx-auto">
    <h2 class="text-2xl font-bold mb-6">Available Barbers</h2>

    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <div
        v-for="barber in barbers"
        :key="barber.id"
        class="bg-white shadow rounded-lg p-4 flex flex-col items-center card"
      >
        <img
          v-if="barber.avatar_url"
          :src="barber.avatar_url"
          alt="Avatar"
          class="w-24 h-24 rounded-full object-cover mb-4"
        />
        <div class="text-center">
          <h3 class="text-xl font-semibold">{{ barber.name }} {{ barber.surname }}</h3>
          <p class="text-gray-600 text-sm mb-2">{{ barber.description }}</p>
          <p class="text-sm"><strong>Rating:</strong> {{ barber.rating }} ⭐</p>
          <p class="text-sm"><strong>Experience:</strong> {{ barber.experience }} years</p>
          <p class="text-sm"><strong>Total Clients:</strong> {{ barber.total_clients }}</p>
        </div>
      </div>
    </div>

    <p v-if="!barbers.length" class="mt-6 text-center text-gray-500">No barbers available.</p>
  </div>
</template>

<script>
import { supabase } from '@/supabaseClient'

export default {
  name: 'TestAvailability',
  data() {
    return {
      barbers: [],
    }
  },
  async mounted() {
    const { data, error } = await supabase
      .from('barbers')
      .select('id, name, surname, description, avatar_url, rating, experience, total_clients')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading barbers:', error)
    } else {
      this.barbers = data
    }
  },
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease;
}
.card:hover {
  transform: scale(1.03);
}
</style>
