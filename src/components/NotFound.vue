<template>
  <div class="text-center py-10">
    <h1 class="text-4xl font-bold text-danger mb-4">404</h1>
    <p class="text-muted mb-4">Die Seite wurde nicht gefunden.</p>
    <router-link to="/" class="btn btn-primary">
      Zurück zur Startseite
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>
