<script setup>

import Slider from '../ui/Slider.vue'

const props = defineProps({

  percentage: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:percentage'])

const handlePercentageChange = (percentage) => {
  emit('update:percentage', percentage)
}

const formatPercentage = (value) => `${Math.round(value)}%`
</script>

<template>
  <div :class="$style['value-range-filter']">
    <Slider
      :model-value="percentage"
      :min="0"
      :max="100"
      :step="1"
      label="Range:"
      :formatter="formatPercentage"
      aria-label="School size range percentage"
      @update:model-value="handlePercentageChange"
    />
  </div>
</template>

<style module src="../../styles/value-range-filter.module.css"></style>
