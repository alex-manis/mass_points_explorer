<script setup>

const props = defineProps({

  data: {
    type: Object,
    default: null
  },

  position: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value.x === 'number' && typeof value.y === 'number'
  },
  
  fields: {
    type: Array,
    default: () => []
  }
})


const formatValue = (field, data) => {
  // If key is null, call formatter with no arguments (custom formatting)
  if (field.key === null) {
    if (field.formatter && typeof field.formatter === 'function') {
      return field.formatter()
    }
    return 'N/A'
  }
  
  // Normal field with key
  const value = data[field.key]
  if (!value && value !== 0) return 'N/A'
  if (field.formatter && typeof field.formatter === 'function') {
    return field.formatter(value)
  }
  return String(value)
}
</script>

<template>
  <div
    v-if="data"
    :class="$style.tooltip"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px'
    }"
  >
    <slot :data="data">
      <div
        v-for="(field, index) in fields"
        :key="field.key || `field-${index}`"
        :class="$style['tooltip-row']"
      >
        <span :class="$style['tooltip-label']">{{ field.label }}:</span>
        <span :class="$style['tooltip-value']">
          {{ formatValue(field, data) }}
        </span>
      </div>
    </slot>
  </div>
</template>

<style module src="../../styles/tooltip.module.css"></style>
