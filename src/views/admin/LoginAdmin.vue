<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4 shadow">
          <h2 class="mb-4 text-center">Admin Login</h2>

          <form @submit.prevent="login">
            <div class="mb-3">
              <label>Email</label>
              <input v-model="email" type="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label>Password</label>
              <input v-model="password" type="password" class="form-control" required />
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-primary">Login</button>
            </div>
          </form>

          <div v-if="error" class="alert alert-danger mt-3">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/supabaseClient'

export default {
  name: 'LoginAdmin',
  data() {
    return {
      email: '',
      password: '',
      error: '',
    }
  },
  methods: {
    async login() {
      this.error = ''
      const { error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      })

      if (error) {
        this.error = 'Login failed. Check your credentials.'
      } else {
        this.$router.push('/admin/dashboard')
      }
    },
  },
}
</script>
