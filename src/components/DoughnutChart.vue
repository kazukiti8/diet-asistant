<template>
  <canvas ref="chartRef"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  }
})

const chartRef = ref(null)
let chart = null

onMounted(() => {
  if (chartRef.value) {
    chart = new Chart(chartRef.value, {
      type: 'doughnut',
      data: props.chartData,
      options: props.chartOptions
    })
  }
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})

watch(() => props.chartData, (newData) => {
  if (chart) {
    chart.data = newData
    chart.update()
  }
}, { deep: true })

watch(() => props.chartOptions, (newOptions) => {
  if (chart) {
    chart.options = { ...chart.options, ...newOptions }
    chart.update()
  }
}, { deep: true })
</script> 