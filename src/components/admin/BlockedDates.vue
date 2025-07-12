<template>
  <div class="space-y-6">
    <h2 class="text-xl font-semibold">Blockierte Termine</h2>

    <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
      <label class="w-100 w-sm-50">
        <span class="text-sm fw-medium">Friseur</span>
        <select v-model="selectedBarber" class="form-select">
          <option v-for="barber in barbers" :key="barber.id" :value="barber.id">
            {{ barber.name }} {{ barber.surname }}
          </option>
        </select>
      </label>

      <button class="btn btn-primary" @click="openAddModal">+ Termine blockieren</button>
    </div>

    <div v-if="loading" class="text-secondary">Blockierte Termine werden geladen…</div>
    <div v-else-if="!blocked.length" class="text-muted">Keine blockierten Termine für diesen Friseur.</div>

    <ul class="list-unstyled">
      <li
        v-for="item in blocked"
        :key="item.id"
        class="border p-3 rounded d-flex justify-content-between align-items-center mb-2 shadow-sm"
      >
        <div>
          <div class="fw-medium">
            {{ formatDate(item.start_date) }} → {{ formatDate(item.end_date) }}
          </div>
          <div class="text-muted small" v-if="item.reason">Grund: {{ item.reason }}</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="editItem(item)">Bearbeiten</button>
          <button class="btn btn-sm btn-danger" @click="deleteItem(item)">Löschen</button>
        </div>
      </li>
    </ul>

    <!-- Inline modal -->
    <div v-if="modalOpen" class="modal-backdrop">
      <div class="modal-box">
        <h5 class="modal-title mb-3">
          {{ editing ? 'Blockierte Termine bearbeiten' : 'Blockierte Termine hinzufügen' }}
        </h5>

        <div class="mb-3">
          <label class="form-label">Startdatum</label>
          <input type="date" v-model="form.start_date" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Enddatum</label>
          <input type="date" v-model="form.end_date" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Grund (optional)</label>
          <input type="text" v-model="form.reason" class="form-control" />
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" @click="resetModal">Abbrechen</button>
          <button
            class="btn btn-primary"
            @click="saveBlocked"
            :disabled="!form.start_date || !form.end_date"
          >
            {{ editing ? 'Aktualisieren' : 'Hinzufügen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
