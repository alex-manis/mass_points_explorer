<script setup>

import Tooltip from '../ui/Tooltip.vue'
import { FISH_NAMES, UI_LABELS, FORMAT_PRECISION } from '../../utils/constants.js'

const props = defineProps({
 
  data: {
    type: Object,
    default: null
  },
 
  position: {
    type: Object,
    required: true
  }
})

const formatIdWithPosition = (data) => {
  if (!data || !data.id) return UI_LABELS.tooltip.notAvailable
  const position = data.position || [0, 0]
  const [lng, lat] = position
  return `${data.id} - position: [${lng.toFixed(FORMAT_PRECISION.coordinates)}, ${lat.toFixed(FORMAT_PRECISION.coordinates)}]`
}

const tooltipFields = [
  { 
    label: UI_LABELS.tooltip.id, 
    key: null,
    formatter: () => formatIdWithPosition(props.data)
  },
  { 
    label: UI_LABELS.tooltip.species, 
    key: 'category',
    formatter: (category) => FISH_NAMES[category] || category
  },
  { 
    label: UI_LABELS.tooltip.schoolSize, 
    key: 'value', 
    formatter: (v) => v ? `${v.toFixed(FORMAT_PRECISION.schoolSize)} ${UI_LABELS.tooltip.unit}` : UI_LABELS.tooltip.notAvailable 
  }
]
</script>

<template>
  <Tooltip
    :data="data"
    :position="position"
    :fields="tooltipFields"
  />
</template>
