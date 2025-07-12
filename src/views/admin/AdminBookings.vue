<template>
  <div class="d-flex">
    <AdminSidebar />
    <div class="admin-main-content" :style="{ marginLeft: sidebar.isCollapsed ? '80px' : '250px' }">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Buchungen</h2>
        <input
          v-model="searchTerm"
          class="form-control w-50"
          type="search"
          placeholder="Suche nach Name, Telefon, E-Mail, ID, Datum"
        />
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Kunde</th>
              <th>E-Mail</th>
              <th>Telefon</th>
              <th>Barber</th>
              <th>Datum</th>
              <th>Uhrzeit</th>
              <th>Dienstleistungen</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="booking in visibleBookings"
              :key="booking.id"
              @scroll.passive="handleScroll"
            >
              <td>{{ booking.customer_name }} {{ booking.customer_surname }}</td>
              <td>{{ booking.customer_email }}</td>
              <td>{{ booking.phone_number }}</td>
              <td>{{ booking.barberName }}</td>
              <td>{{ booking.date_appt }}</td>
              <td>{{ booking.hour }}</td>
              <td>
                <ul class="mb-0">
                  <li v-for="s in booking.serviceNames" :key="s">{{ s }}</li>
                </ul>
              </td>
              <td>
                <button class="btn btn-outline-primary me-2" @click="openEditModal(booking.id)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="openDeleteModal(booking)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="loadingMore" class="text-center my-3">
          <div class="spinner-border"></div>
        </div>
        <p v-if="!hasMore && filteredBookings.length > 0" class="text-muted text-center my-3">
          Keine weiteren Ergebnisse
        </p>
      </div>

      <EditBookingModal v-if="editingId" :booking-id="editingId" @close="editingId = null; fetchBookings()" />
      <DeleteBookingModal
        v-if="confirmBooking"
        :booking-id="confirmBooking.id"
        @confirm="deleteBooking"
        @cancel="confirmBooking = null"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import EditBookingModal from '@/components/admin/EditBookingModal.vue'
import DeleteBookingModal from '@/components/admin/DeleteBookingModal.vue'
import { useSidebarStore } from '@/stores/sidebar'

const sidebar = useSidebarStore()

const bookings = ref([])
const searchTerm = ref('')
const visibleCount = ref(10)
const loadingMore = ref(false)
const editingId = ref(null)
const confirmBooking = ref(null)

const fetchBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      barbers(name, surname),
      booking_services(
        service:services(name)
      )
    `)
    .order('date_appt', { ascending: true })
    .order('hour', { ascending: true })

  if (error) {
    console.error('❌ Error fetching bookings:', error)
    return
  }

  const grouped = {}

  for (const b of data) {
    if (!grouped[b.id]) {
      grouped[b.id] = {
        ...b,
        barberName: b.barbers ? `${b.barbers.name} ${b.barbers.surname}` : '',
        serviceNames: [],
      }
    }

    const servicesList = b.booking_services || []
    for (const svc of servicesList) {
      if (svc.service?.name && !grouped[b.id].serviceNames.includes(svc.service.name)) {
        grouped[b.id].serviceNames.push(svc.service.name)
      }
    }
  }

  bookings.value = Object.values(grouped)
}


const filteredBookings = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return bookings.value.filter((b) => {
    return (
      b.customer_name?.toLowerCase().includes(term) ||
      b.customer_surname?.toLowerCase().includes(term) ||
      b.customer_email?.toLowerCase().includes(term) ||
      b.phone_number?.toLowerCase().includes(term) ||
      b.id?.toLowerCase().includes(term) ||
      b.date_appt?.toString().includes(term)
    )
  })
})

const visibleBookings = computed(() => {
  return filteredBookings.value.slice(0, visibleCount.value)
})

const handleScroll = () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  setTimeout(() => {
    visibleCount.value += 10
    loadingMore.value = false
  }, 500)
}

const hasMore = computed(() => visibleBookings.value.length < filteredBookings.value.length)

const openEditModal = (id) => {
  editingId.value = id
}

const openDeleteModal = (booking) => {
  confirmBooking.value = { ...booking } // 💡 Spread into a plain object
}


const deleteBooking = async () => {
  if (!confirmBooking.value) return

  const booking = {
    id: confirmBooking.value.id,
    barber_id: confirmBooking.value.barber_id,
    date_appt: confirmBooking.value.date_appt,
    hour: confirmBooking.value.hour,
  }

  try {
    console.log('🧾 Booking to delete:', booking)

    // 1. Delete from availability
    await supabase
      .from('availability')
      .delete()
      .eq('barber_id', booking.barber_id)
      .eq('date', booking.date_appt)
      .eq('hour', booking.hour)

    // 2. Delete from booking_services
    await supabase.from('booking_services').delete().eq('booking_id', booking.id)

    // 3. Delete from bookings
    const { error: bookingError } = await supabase.from('bookings').delete().eq('id', booking.id)

    if (bookingError) {
      console.error('❌ Booking delete failed:', bookingError)
      return
    }

    console.log('✅ Booking deleted successfully')
    confirmBooking.value = null
    await fetchBookings()
  } catch (e) {
    console.error('❌ Unexpected error deleting booking:', e)
  }
}




onMounted(fetchBookings)
</script>

<style scoped>
.admin-main-content {
  padding: 20px;
  width: 100%;
}
</style>
