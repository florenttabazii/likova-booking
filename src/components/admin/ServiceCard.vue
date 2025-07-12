<template>
  <div class="card h-100 shadow-sm">
    <div class="card-body d-flex flex-column justify-content-between">
      <div>
        <!-- Title + Toggle -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="card-title mb-0">{{ service.name }}</h5>
          <div class="form-check form-switch m-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :id="`toggle-${service.id}`"
              :checked="service.is_active"
              @change="$emit('toggle', service)"
            />
          </div>
        </div>

        <!-- Description and Info -->
        <p class="card-text text-muted small mb-2">{{ service.description }}</p>

        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold">CHF{{ service.price }}</span>
          <small class="text-muted">{{ service.duration }} {{ $t('services.unitMinutes') }}</small>
        </div>
      </div>

      <!-- Edit/Delete Buttons -->
      <div class="mt-3 d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm flex-fill" @click="$emit('edit', service)">
          <i class="fas fa-edit me-1"></i>{{ $t('actions.edit') }}
        </button>
        <button class="btn btn-outline-danger btn-sm flex-fill" @click="$emit('delete', service)">
          <i class="fas fa-trash me-1"></i>{{ $t('actions.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
defineProps(['service'])
defineEmits(['edit', 'delete', 'toggle'])
</script>

<style scoped>
.card-title {
  font-size: 1.1rem;
}
.card-text {
  min-height: 3em;
}
</style>
