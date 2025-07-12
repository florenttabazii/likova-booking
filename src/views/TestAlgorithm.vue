<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <TestTimeSlots />
      </div>
    </div>
  </div>
</template>

<script>
import TestTimeSlots from '../components/TestTimeSlots.vue'

export default {
  name: 'TestAlgorithm',
  components: {
    TestTimeSlots,
  },
}
</script>
