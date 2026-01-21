<script setup>

const props = defineProps({

  modelValue: {
    type: Boolean,
    required: true
  },
 
  label: {
    type: String,
    default: ''
  },
  
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => {
  if (!props.disabled) {
    emit('update:modelValue', event.target.checked)
  }
}
</script>

<template>
  <label
    :class="[
      $style['checkbox-label'],
      disabled && $style['checkbox-label--disabled']
    ]"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :class="$style['checkbox-input']"
      @change="handleChange"
    />
    <span :class="$style['checkbox-text']">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style module src="../../styles/checkbox.module.css"></style>
