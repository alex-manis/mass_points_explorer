<script setup>

import Tooltip from '../ui/Tooltip.vue'
import { FISH_NAMES } from '../../utils/constants.js'

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
  if (!data || !data.id) return 'N/A'
  const position = data.position || [0, 0]
  const [lng, lat] = position
  return `${data.id} - position: [${lng.toFixed(4)}, ${lat.toFixed(4)}]`
}

const tooltipFields = [
  { 
    label: 'ID', 
    key: null,
    formatter: () => formatIdWithPosition(props.data)
  },
  { 
    label: 'Species', 
    key: 'category',
    formatter: (category) => FISH_NAMES[category] || category
  },
  { 
    label: 'School Size', 
    key: 'value', 
    formatter: (v) => v ? `${v.toFixed(0)} fish` : 'N/A' 
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
