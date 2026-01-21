<script setup>


const props = defineProps({
 
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<template>
  <div :class="$style['loading-container']">
    <div :class="$style['loading-spinner']" />
    <div v-if="message" :class="$style['loading-message']">
      {{ message }}
    </div>
  </div>
</template>

<style module src="../../styles/loading-spinner.module.css"></style>
