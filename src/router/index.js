import { createRouter, createWebHistory } from 'vue-router'
import { useBookingStore } from '../stores/booking'
import { supabase } from '@/supabaseClient'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/booking/barber-selection',
    },
    {
      path: '/booking',
      redirect: '/booking/barber-selection',
    },
    {
      path: '/booking/barber-selection',
      name: 'barber-selection',
      component: () => import('../views/BarberSelection.vue'),
    },
    {
      path: '/booking/services',
      name: 'service-selection',
      component: () => import('../views/ServiceSelection.vue'),
    },
    {
      path: '/booking/form',
      name: 'booking-form',
      component: () => import('../views/BookingForm.vue'),
    },

    {
      path: '/booking/confirmation',
      name: 'booking-confirmation',
      component: () => import('../views/BookingConfirmation.vue'),
    },
    {
      path: '/admin-login',
      name: 'LoginAdmin',
      component: () => import('@/views/admin/LoginAdmin.vue'),
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/AdminDashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/barbers',
      name: 'AdminBarbers',
      component: () => import('@/views/admin/AdminBarbers.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/services',
      name: 'AdminServices',
      component: () => import('@/views/admin/AdminServices.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/bookings',
      name: 'AdminBookings',
      component: () => import('@/views/admin/AdminBookings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/system-status',
      name: 'SystemStatus',
      component: () => import('@/views/admin/SystemStatus.vue'),
      meta: { requiresAuth: true },
    },
    {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('../components/NotFound.vue'),
}
  ],
})

// ✅ Navigation guard
router.beforeEach(async (to, from, next) => {
  const bookingStore = useBookingStore()

  const routeStepMap = {
    'barber-selection': 1,
    'service-selection': 2,
    'booking-form': 3,
    'booking-confirmation': 4,
  }

  if (to.name && routeStepMap[to.name]) {
    bookingStore.setStep(routeStepMap[to.name])
  } else {
    bookingStore.setStep(0)
  }

  // ✅ Check auth for admin pages
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    return next('/admin-login')
  }

  // ✅ If already logged in, block access to login page
  if (to.path === '/admin-login' && session) {
    return next('/admin/dashboard')
  }

  next()
})

export default router
