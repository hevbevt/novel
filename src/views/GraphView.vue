<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <header class="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <router-link to="/" class="text-slate-300 hover:text-white">← 返回首页</router-link>
        <span class="text-lg font-semibold">因果界 · 人物关系图</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-sm"
          @click="resetGraph"
        >
          重置全图
        </button>
      </div>
    </header>

    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
      <section class="flex-1 relative min-h-0">
        <RelationGraph
          :graph-data="displayData"
          :enable-router="false"
          :auto-load="false"
          :frameless="true"
          :mode="graphMode"
          theme="dark"
          @node-click="handleNodeClick"
        />
        <div
          class="absolute left-4 bottom-4 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
        >
          点击人物，仅查看其一层关系
        </div>
      </section>

      <aside class="w-full lg:w-96 bg-slate-900 border-l border-slate-800 overflow-y-auto min-h-0">
        <div class="p-4 border-b border-slate-800">
          <h2 class="text-base font-semibold">人物档案</h2>
          <p class="text-xs text-slate-400 mt-1">点击图中人物查看介绍与关系摘要</p>
        </div>
        <div class="p-4" v-if="selected">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-white">{{ selected.name }}</h3>
              <p class="text-xs text-slate-400" v-if="selected.tier">{{ selected.tier }}</p>
            </div>
            <router-link
              v-if="selected.url"
              :to="selected.url"
              class="text-xs text-brand hover:text-brand-dark"
            >
              进入详情 →
            </router-link>
          </div>

          <div v-if="characterLoading" class="mt-4 text-xs text-slate-400">正在加载人物资料...</div>
          <div v-else-if="characterError" class="mt-4 text-xs text-rose-400">{{ characterError }}</div>
          <div v-else-if="character" class="mt-4 space-y-3">
            <div v-for="(value, key) in character.metadata" :key="key" class="text-sm">
              <div class="text-slate-400">{{ key }}</div>
              <div class="text-slate-100">{{ value }}</div>
            </div>
            <div class="pt-3 border-t border-slate-800">
              <h4 class="text-sm font-semibold text-slate-200">简述</h4>
              <div class="text-sm text-slate-300 leading-relaxed" v-html="character.content"></div>
            </div>
          </div>
          <div v-else class="mt-4 text-xs text-slate-400">暂无人物资料</div>
        </div>
        <div v-else class="p-4 text-sm text-slate-400">尚未选择人物</div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import RelationGraph from '../components/RelationGraph.vue'

type GraphData = {
  nodes: any[]
  links: any[]
  categories: any[]
}

const fullData = ref<GraphData | null>(null)
const selected = ref<any | null>(null)
const character = ref<any | null>(null)
const characterLoading = ref(false)
const characterError = ref('')

const graphMode = computed(() => (selected.value ? 'focus' : 'overview'))

const displayData = computed(() => {
  if (!fullData.value) {
    return { nodes: [], links: [], categories: [] }
  }
  if (!selected.value) {
    return fullData.value
  }
  const centerId = selected.value.id || selected.value.name
  const relatedLinks = fullData.value.links.filter(
    (link) => link.source === centerId || link.target === centerId
  )
  const nodeIds = new Set([centerId])
  relatedLinks.forEach((link) => {
    nodeIds.add(link.source)
    nodeIds.add(link.target)
  })
  const nodes = fullData.value.nodes.filter((node) => nodeIds.has(node.id))
  const links = relatedLinks.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
  )
  return {
    nodes,
    links,
    categories: fullData.value.categories
  }
})

const loadGraph = async () => {
  const response = await fetch('/data/graph.json')
  fullData.value = await response.json()
}

const loadCharacter = async (node: any) => {
  if (!node?.url) {
    character.value = null
    characterError.value = ''
    return
  }
  const slug = node.url.split('/').pop()
  if (!slug) return
  characterLoading.value = true
  characterError.value = ''
  try {
    const res = await fetch(`/data/characters/${slug}.json`)
    if (!res.ok) throw new Error('人物资料不存在')
    character.value = await res.json()
  } catch (error: any) {
    characterError.value = error.message || '加载失败'
    character.value = null
  } finally {
    characterLoading.value = false
  }
}

const handleNodeClick = (node: any) => {
  selected.value = node
  loadCharacter(node)
}

const resetGraph = () => {
  selected.value = null
  character.value = null
  characterError.value = ''
}

onMounted(() => {
  loadGraph()
})
</script>

<style scoped>
:deep(.graph-container) {
  background: #0f172a;
}
</style>
