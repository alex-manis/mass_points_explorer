<script setup>

const props = defineProps({
 
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
 
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary'].includes(value)
  },
 
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="[
      $style.button,
      $style[`button--${size}`],
      variant === 'primary' && $style['button--primary']
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style module src="../../styles/button.module.css"></style>
