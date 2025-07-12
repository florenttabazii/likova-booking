<template>
  <div :class="['admin-sidebar', { collapsed: sidebar.isCollapsed }]">
    <div class="sidebar-header">
      <h5 v-if="!sidebar.isCollapsed">{{ $t('sidebar.admin') }}</h5>
      <button class="toggle-btn" @click="sidebar.toggle">
        <i class="fas fa-angle-left" v-if="!sidebar.isCollapsed" />
        <i class="fas fa-angle-right" v-else />
      </button>
    </div>

    <nav class="nav flex-column mt-4">
      <RouterLink to="/admin/dashboard" class="nav-link">
        <i class="fas fa-chart-pie me-2" />
        <span v-if="!sidebar.isCollapsed">{{ $t('sidebar.dashboard') }}</span>
      </RouterLink>

      <RouterLink to="/admin/barbers" class="nav-link">
        <i class="fas fa-user me-2" />
        <span v-if="!sidebar.isCollapsed">{{ $t('sidebar.barbers') }}</span>
      </RouterLink>

      <RouterLink to="/admin/services" class="nav-link">
        <i class="fas fa-scissors me-2" />
        <span v-if="!sidebar.isCollapsed">{{ $t('sidebar.services') }}</span>
      </RouterLink>

      <RouterLink to="/admin/bookings" class="nav-link">
        <i class="fas fa-calendar-alt me-2" />
        <span v-if="!sidebar.isCollapsed">{{ $t('sidebar.bookings') }}</span>
      </RouterLink>

      <RouterLink to="/admin/system-status" class="nav-link">
        <i class="fas fa-server me-2"></i>
        <span v-if="!sidebar.isCollapsed">{{ $t('sidebar.systemStatus') }}</span>
      </RouterLink>
    </nav>

    <button
      class="btn btn-outline-danger mt-auto w-100"
      v-if="!sidebar.isCollapsed"
      @click="logout"
    >
      <i class="fas fa-sign-out-alt me-2" /> {{ $t('sidebar.logout') }}
    </button>
  </div>
</template>


<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabaseClient'

const sidebar = useSidebarStore()
const router = useRouter()

const logout = async () => {
  await supabase.auth.signOut()
  localStorage.clear()
  router.push('/admin-login')
}
</script>

<style scoped>
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background-color: #f8f9fa;
  border-right: 1px solid #ddd;
  padding: 1rem;
  z-index: 1000;
  transition: width 0.2s ease;
  display: flex;
  flex-direction: column;
}

.admin-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  color: #666666;
  text-decoration: none;
}
</style>
