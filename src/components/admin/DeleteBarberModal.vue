<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="admin-modal text-center">
      <h5 class="mb-3">{{ $t('deleteModal.title') }}</h5>
      <p>
        {{ $t('deleteModal.message') }}
        <strong>{{ barber.name }} {{ barber.surname }}</strong>?
      </p>
      <div class="d-flex justify-content-between mt-4">
        <button class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button class="btn btn-danger" @click="confirmDelete">{{ $t('deleteModal.confirm') }}</button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { supabase } from '@/supabaseClient'

const props = defineProps({
  barber: Object,
})

const emit = defineEmits(['close', 'confirmDelete'])

const confirmDelete = async () => {
  const { error } = await supabase.from('barbers').delete().eq('id', props.barber.id)

  if (error) {
    alert(error.message)
    return
  }

  emit('confirmDelete')
}
</script>
