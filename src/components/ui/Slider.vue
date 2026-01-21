<script setup>


const props = defineProps({

  modelValue: {
    type: Number,
    required: true
  },
  
  min: {
    type: Number,
    required: true
  },

  max: {
    type: Number,
    required: true
  },

  step: {
    type: Number,
    default: 1
  },
 
  label: {
    type: String,
    default: ''
  },
  
  showValue: {
    type: Boolean,
    default: true
  },
 
  formatter: {
    type: Function,
    default: (value) => value.toFixed(1)
  },
 
  disabled: {
    type: Boolean,
    default: false
  },
 
  ariaLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  if (!props.disabled) {
    emit('update:modelValue', parseFloat(event.target.value))
  }
}
</script>

<template>
  <div :class="$style['slider-container']">
    <label v-if="label" :class="$style['slider-label']">
      {{ label }}
    </label>
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-label="ariaLabel || label"
      :class="$style['slider-input']"
      @input="handleInput"
    />
    <span v-if="showValue" :class="$style['slider-value']">
      {{ formatter(modelValue) }}
    </span>
  </div>
</template>

<style module src="../../styles/slider.module.css"></style>
