<template>
  <div class="graph-container" :class="{ frameless: frameless }" v-loading="loading">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'

const chartRef = ref<HTMLElement | null>(null)
const loading = ref(true)
let chartInstance: echarts.ECharts | null = null

const router = useRouter()

type GraphData = {
  nodes: any[]
  links: any[]
  categories: any[]
}

const props = defineProps<{
  graphData?: GraphData | null
  enableRouter?: boolean
  autoLoad?: boolean
  frameless?: boolean
  mode?: 'overview' | 'focus'
  theme?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'node-click', node: any): void
}>()

const localData = ref<GraphData | null>(null)

const initChart = async () => {
  if (!chartRef.value) return

  try {
    if (props.autoLoad !== false && !props.graphData) {
      const response = await fetch('/data/graph.json')
      localData.value = await response.json()
    }
    
    chartInstance = echarts.init(chartRef.value)
    applyOption()

    chartInstance.on('click', (params: any) => {
      if (params.dataType === 'node') {
        emit('node-click', params.data)
        if (props.enableRouter !== false && params.data.url) {
          router.push(params.data.url)
        }
      }
    })

    window.addEventListener('resize', resizeHandler)

  } catch (e) {
    console.error('Failed to load graph data:', e)
  } finally {
    loading.value = false
  }
}

const applyOption = () => {
  if (!chartInstance) return
  const data = props.graphData || localData.value
  if (!data) return
  const isOverview = props.mode === 'overview'
  const isDark = props.theme === 'dark'
  const labelThreshold = 6
  const nodeLabelFormatter = (params: any) => {
    if (!params?.data) return params.name
    if (isOverview && params.data.value < labelThreshold) return ''
    return params.data.name || params.name
  }

  const nodes = data.nodes.map((node: any) => ({
    ...node,
    label: {
      show: true
    }
  }))

    const option = {
      textStyle: {
        color: isDark ? '#e2e8f0' : '#1f2937'
      },
      title: {
        text: '赤心巡天人物关系图谱',
        top: 'bottom',
        left: 'right',
        textStyle: {
          color: isDark ? '#cbd5f5' : '#334155'
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        textStyle: {
          color: isDark ? '#e2e8f0' : '#0f172a'
        },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const tier = params.data?.tier ? `（${params.data.tier}）` : ''
            return `${params.data?.name || params.name}${tier}`
          }
          if (params.dataType === 'edge') {
            const relation = params.data?.relation || params.data?.value || '相关'
            return `${params.data?.source} ${relation} ${params.data?.target}`
          }
          return params.name
        }
      },
      legend: {
        data: data.categories.map((a: any) => a.name),
        orient: 'vertical',
        left: 'left',
        top: 'top',
        textStyle: {
          color: isDark ? '#cbd5f5' : '#334155'
        }
      },
      series: [
        {
          name: '人物关系',
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: data.links,
          categories: data.categories,
          roam: true,
          focusNodeAdjacency: true,
          label: {
            show: true,
            position: 'right',
            formatter: nodeLabelFormatter,
            color: isDark ? '#e2e8f0' : '#1f2937'
          },
          labelLayout: {
            hideOverlap: true
          },
          edgeLabel: {
            show: false,
            formatter: (params: any) => params.data?.relation || params.data?.value || '相关'
          },
          scaleLimit: {
            min: 0.4,
            max: 2
          },
          lineStyle: {
            color: 'source',
            curveness: 0.2,
            opacity: isOverview ? 0.25 : 0.6
          },
          force: {
            repulsion: isOverview ? 360 : 220,
            edgeLength: isOverview ? [100, 260] : [60, 220],
            gravity: isOverview ? 0.05 : 0.1
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 2
            },
            edgeLabel: {
              show: true
            }
          }
        }
      ]
    }

    chartInstance.setOption(option, true)
}

const resizeHandler = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
})

watch(() => props.graphData, () => {
  applyOption()
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
</script>

<style scoped>
.graph-container {
  width: 100%;
  height: 100%;
  border: 1px solid var(--vp-c-divider, rgba(148, 163, 184, 0.3));
  border-radius: 8px;
  overflow: hidden;
}

.graph-container.frameless {
  border: none;
  border-radius: 0;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
