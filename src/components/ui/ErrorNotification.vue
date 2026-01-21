<script setup>


import Button from './Button.vue'

const props = defineProps({

  message: {
    type: String,
    required: true
  },

  details: {
    type: String,
    default: ''
  },

  showRetry: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'retry'])

const handleClose = () => {
  emit('close')
}

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div :class="$style['error-notification']">
    <div :class="$style['error-notification__header']">
      <h3 :class="$style['error-notification__title']">Error</h3>
      <button
        :class="$style['error-notification__close']"
        @click="handleClose"
        aria-label="Close error notification"
      >
        ×
      </button>
    </div>

    <p :class="$style['error-notification__message']">
      {{ message }}
    </p>

    <div
      v-if="details"
      :class="$style['error-notification__details']"
    >
      {{ details }}
    </div>

    <div :class="$style['error-notification__actions']">
      <Button
        v-if="showRetry"
        size="small"
        variant="primary"
        @click="handleRetry"
      >
        Retry
      </Button>
      <Button
        size="small"
        @click="handleClose"
      >
        Close
      </Button>
    </div>
  </div>
</template>

<style module src="../../styles/error-notification.module.css"></style>
