<script setup>

import ValueRangeFilter from './filters/ValueRangeFilter.vue'
import CategoryFilter from './filters/CategoryFilter.vue'

defineProps({
 
  filters: {
    type: Object,
    required: true
  },

  categories: {
    type: Array,
    required: true
  }
})

defineEmits(['update:percentage', 'update:categories'])
</script>

<template>
  <div :class="$style['filter-panel']">
    <div :class="$style['filter-panel__header']">
      <h3 :class="$style['filter-panel__title']">🐟 Fish Schools</h3>
    </div>
    
    <div :class="$style['filter-panel__section']">
      <div :class="$style['filter-panel__section-title']">
        School Size Range
      </div>
      
      <div :class="$style['filter-panel__range-group']">
        <ValueRangeFilter
          :percentage="filters.valuePercentage"
          @update:percentage="$emit('update:percentage', $event)"
        />
      </div>
    </div>
    
    <div :class="$style['filter-panel__section']">
      <div :class="$style['filter-panel__section-title']">
        Fish Species
      </div>
      
      <div :class="$style['filter-panel__categories']">
        <CategoryFilter
          :categories="categories"
          :selected-categories="filters.selectedCategories"
          @update:selection="$emit('update:categories', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style module src="../styles/filter-panel.module.css"></style>
