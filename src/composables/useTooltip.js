import { ref } from 'vue'

export function useTooltip() {
  const tooltipData = ref(null)
  const tooltipPosition = ref({ x: 0, y: 0 })

   const updateTooltip = (info) => {
    if (info && info.object) {
      tooltipData.value = info.object
      tooltipPosition.value = {
        x: info.x,
        y: info.y
      }
    } else {
      hideTooltip()
    }
  }


  const hideTooltip = () => {
    tooltipData.value = null
  }


  const showTooltip = (data, position) => {
    tooltipData.value = data
    tooltipPosition.value = position
  }

  return {
    tooltipData,
    tooltipPosition,
    updateTooltip,
    hideTooltip,
    showTooltip
  }
}
