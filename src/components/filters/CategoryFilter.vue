<script setup>

import Checkbox from '../ui/Checkbox.vue'
import Button from '../ui/Button.vue'
import { FISH_NAMES } from '../../utils/constants.js'

const props = defineProps({
 
  categories: {
    type: Array,
    required: true
  },
 
  selectedCategories: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['update:selection'])

const getFishName = (category) => {
  return FISH_NAMES[category] || category
}

const isCategorySelected = (category) => {
  return props.selectedCategories.has(category)
}

const handleToggle = (category) => {
  const newSelection = new Set(props.selectedCategories)
  
  if (newSelection.has(category)) {
    newSelection.delete(category)
  } else {
    newSelection.add(category)
  }
  
  emit('update:selection', newSelection)
}

const selectAll = () => {
  const allCategories = new Set(props.categories)
  emit('update:selection', allCategories)
}

const deselectAll = () => {
  emit('update:selection', new Set())
}
</script>

<template>
  <div :class="$style['category-filter']">
    <div :class="$style['category-filter__header']">
      <Button
        size="small"
        @click="selectAll"
      >
        All
      </Button>
      <Button
        size="small"
        @click="deselectAll"
      >
        Clear
      </Button>
    </div>

    <div :class="$style['category-filter__list']">
      <Checkbox
        v-for="category in categories"
        :key="category"
        :model-value="isCategorySelected(category)"
        :label="getFishName(category)"
        @update:model-value="() => handleToggle(category)"
      />
    </div>
  </div>
</template>

<style module src="../../styles/category-filter.module.css"></style>
