<template>
  <div class="d-flex">
    <AdminSidebar />

    <div
      class="flex-grow-1 p-4 transition-all"
      :style="{ marginLeft: sidebar.isCollapsed ? '80px' : '250px' }"
    >
      <h2 class="mb-4">{{ $t('admin.welcome') }}</h2>

      <!-- Today's Info -->
      <div class="col-12">
        <TotalRevenueCard />
      </div>

      <div class="row mb-4">
        <div class="col-md-12">
          <TodayBookings />
        </div>
      </div>

      <div class="row mb-4">
  <div class="col-md-12">
    <BlockedDates />
  </div>
</div>



      <!-- Summary Stats -->
      <div class="row mb-4">
        <div class="col-md-4">
          <DashboardStat
            :label="$t('admin.totalBookingsToday')"
            :value="bookingsToday"
            icon="calendar"
            variant="primary"
            type="total-bookings"
          />
        </div>
        <div class="col-md-4">
          <DashboardStat
            :label="$t('admin.attendedToday')"
            :value="attendedToday"
            icon="check-circle"
            variant="success"
            type="attended"
          />
        </div>
        <div class="col-md-4">
          <DashboardStat
            :label="$t('admin.noShowsToday')"
            :value="noShowsToday"
            icon="user-xmark"
            variant="danger"
            type="no-shows"
          />
        </div>
      </div>

      <!-- Charts -->
      <div class="row mb-4">
        <div class="col-md-6">
          <BarberBookingsChart />
        </div>
        <div class="col-md-6">
          <TopServicesChart />
        </div>
      </div>
      <div class="row mb-4">
        <div class="col-md-12">
          <BookingTrendChart />
        </div>
      </div>

      <!-- System Usage -->
      <DatabaseUsageBar class="mb-3" />
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { supabase } from '@/supabaseClient'

import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import DatabaseUsageBar from '@/components/admin/DatabaseUsageBar.vue'
import BarberBookingsChart from '@/components/admin/charts/BarberBookingsChart.vue'
import TopServicesChart from '@/components/admin/charts/TopServicesChart.vue'
import DashboardStat from '@/components/admin/charts/DashboardStat.vue'
import BookingTrendChart from '@/components/admin/charts/BookingTrendChart.vue'
import TodayBookings from '@/components/admin/charts/TodayBookings.vue'
import TotalRevenueCard from '@/components/admin/charts/TotalRevenueCard.vue'
import BlockedDates from '@/components/admin/BlockedDates.vue'


const sidebar = useSidebarStore()

// ✅ Booking stats
const bookingsToday = ref(0)
const attendedToday = ref(0)
const noShowsToday = ref(0)

onMounted(async () => {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('bookings')
    .select('status, date_appt')
    .eq('date_appt', today)

  if (data) {
    bookingsToday.value = data.length
    attendedToday.value = data.filter(b => b.status === 'completed').length
    noShowsToday.value = data.filter(b => b.status === 'no-show').length
  }

  if (error) {
    console.error('❌ Failed to fetch booking stats:', error)
  }
})

// Time slot modal handlers
const timeSlotsRef = ref(null)
const modalVisible = ref(false)
const editedSlot = ref('')
const editIndex = ref(null)

const handleEdit = (slot, index) => {
  editedSlot.value = slot
  editIndex.value = index
  modalVisible.value = true
}

const handleSave = async (updated, index) => {
  if (!timeSlotsRef.value) return
  timeSlotsRef.value.slots[index] = updated
  await timeSlotsRef.value.saveSlots()
  modalVisible.value = false
}

const handleDelete = async (index) => {
  if (!timeSlotsRef.value) return
  timeSlotsRef.value.slots.splice(index, 1)
  await timeSlotsRef.value.saveSlots()
  modalVisible.value = false
}
</script>


<style scoped>
.transition-all {
  transition: margin-left 0.3s ease;
}
</style>
