<template>
  <div class="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-[var(--accent-3-soft)] blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-40 -left-20 h-64 w-64 rounded-full bg-[var(--accent-soft)] blur-3xl animate-float"
        style="animation-delay: 1.2s"
      ></div>
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle at 20% 15%, rgba(255,255,255,0.4), transparent 55%);"
      ></div>
    </div>

    <header class="relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
        <router-link to="/" class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-full bg-white/80 border border-[color:var(--ring)] flex items-center justify-center text-brand font-display text-lg"
          >
            天
          </div>
          <div class="font-display text-xl">天机阁</div>
        </router-link>
        <nav class="hidden lg:flex items-center gap-6 text-sm">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="transition"
            :class="route.path === item.to ? 'text-[var(--ink)]' : 'text-ink-soft hover:text-[var(--ink)]'"
          >
            {{ item.label }}
          </router-link>
        </nav>
        <router-link
          to="/graph"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ink)] text-white text-xs sm:text-sm hover:opacity-90 transition"
        >
          因果界
          <span class="text-xs">↗</span>
        </router-link>
      </div>
    </header>

    <main class="relative z-10">
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        <div class="grid lg:grid-cols-[1.1fr,0.9fr] gap-8 items-center">
          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--ring)] bg-white/70 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-ink-soft"
            >
              伏笔追踪
            </div>
            <h1 class="font-display text-4xl sm:text-5xl mt-4">伏笔线索档案</h1>
            <p class="text-ink-soft text-lg mt-4 max-w-xl">
              聚合各卷“隐线与伏笔”条目，统一追踪线索状态，辅助从伏笔角度检索剧情。
            </p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="tag in highlightTags"
                :key="tag"
                class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="card-surface-strong rounded-3xl p-6">
            <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">追踪概览</div>
            <div class="mt-5 grid grid-cols-2 gap-4">
              <div class="card-surface rounded-2xl p-4">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">已收录</div>
                <div class="text-2xl font-semibold mt-2">{{ stats.total || '—' }}</div>
              </div>
              <div class="card-surface rounded-2xl p-4">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">文本明确</div>
                <div class="text-2xl font-semibold mt-2">{{ stats.explicit || '—' }}</div>
              </div>
              <div class="card-surface rounded-2xl p-4">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">合理推断</div>
                <div class="text-2xl font-semibold mt-2">{{ stats.inferred || '—' }}</div>
              </div>
              <div class="card-surface rounded-2xl p-4">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">追踪中</div>
                <div class="text-2xl font-semibold mt-2">{{ stats.tracking || '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="card-surface rounded-3xl p-5 flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in tagOptions"
              :key="tag"
              type="button"
              class="px-4 py-2 rounded-full text-xs font-semibold transition"
              :class="
                activeTag === tag
                  ? 'bg-[var(--ink)] text-white'
                  : 'bg-white/70 text-ink-soft hover:text-[var(--ink)]'
              "
              @click="activeTag = tag"
            >
              {{ tag }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="status in statusOptions"
              :key="status"
              type="button"
              class="px-4 py-2 rounded-full text-xs font-semibold transition"
              :class="
                activeStatus === status
                  ? 'bg-[var(--accent-2)] text-white'
                  : 'bg-[var(--accent-2-soft)] text-[var(--accent-2)] hover:opacity-80'
              "
              @click="activeStatus = status"
            >
              {{ status }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="range in rangeOptions"
              :key="range"
              type="button"
              class="px-4 py-2 rounded-full text-xs font-semibold transition"
              :class="
                activeRange === range
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80'
              "
              @click="activeRange = range"
            >
              {{ range }}
            </button>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="query"
              type="text"
              placeholder="搜索伏笔关键词"
              class="input-surface w-full sm:flex-1 rounded-full px-4 py-2 text-sm"
            />
            <button
              type="button"
              class="px-4 py-2 rounded-full text-sm bg-[var(--ink)] text-white hover:opacity-90 transition"
              @click="query = ''"
            >
              清空
            </button>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          v-for="group in groupedItems"
          :key="group.range"
          class="mb-12"
        >
          <div class="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 class="font-display text-3xl">{{ group.range }}</h2>
              <p class="text-ink-soft mt-2">共 {{ group.items.length }} 条伏笔线索</p>
            </div>
          </div>
          <div class="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <router-link
            v-for="item in group.items"
            :key="item.id"
            :to="`/foreshadowing/${item.slug || item.id}`"
            class="card-surface rounded-3xl p-6 transition hover:-translate-y-1"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold">{{ item.title }}</h3>
                <p class="text-xs text-ink-soft mt-1">{{ item.range }}</p>
              </div>
                <div class="flex flex-col items-end gap-2">
                  <span
                    class="px-3 py-1 rounded-full text-xs"
                    :class="item.tag === '文本明确'
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : item.tag === '合理推断'
                        ? 'bg-[var(--accent-3-soft)] text-[var(--accent-3)]'
                        : 'bg-[var(--ink-soft-bg)] text-ink-soft'"
                  >
                    {{ item.tag }}
                  </span>
                  <span class="px-3 py-1 rounded-full text-xs bg-black/5 text-ink-soft">{{ item.status }}</span>
                </div>
            </div>
            <p class="text-sm text-ink-soft mt-3">{{ item.summary || '暂无细化说明' }}</p>
            <div v-if="item.evidence" class="mt-4 text-xs text-ink-soft">
              证据：{{ item.evidence }}
            </div>
            <div v-if="item.source" class="mt-2 text-[11px] text-ink-soft">
              来源：{{ item.source }}
            </div>
            <div class="mt-4 text-sm font-semibold text-[var(--accent)]">查看详情 →</div>
          </router-link>
          </div>
        </div>

        <div
          v-if="!loading && !groupedItems.length"
          class="card-surface rounded-3xl p-6 text-sm text-ink-soft"
        >
          暂无匹配伏笔，尝试调整筛选或关键词。
        </div>
        <div
          v-if="loading"
          class="card-surface rounded-3xl p-6 text-sm text-ink-soft"
        >
          正在加载伏笔线索…
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-black/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-2">
        <span>天机阁 · 伏笔追踪</span>
        <router-link to="/" class="hover:text-[var(--ink)] transition">返回首页 →</router-link>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

type ForeshadowingItem = {
  id: string
  slug?: string
  title: string
  summary: string
  tag: string
  status: string
  themes?: string[]
  range: string
  evidence?: string
  source?: string
}

type ForeshadowingData = {
  total: number
  items: ForeshadowingItem[]
  segments: { range: string; source: string; count: number }[]
}

const route = useRoute()

const navItems = [
  { label: '人物', to: '/characters' },
  { label: '剧情', to: '/plot' },
  { label: '势力', to: '/factions' },
  { label: '伏笔', to: '/foreshadowing' }
]

const highlightTags = ['伏笔追踪', '隐线整理', '待回收线索', '文本明确']

const loading = ref(true)
const foreshadowing = ref<ForeshadowingItem[]>([])
const segments = ref<ForeshadowingData['segments']>([])
const query = ref('')
const activeTag = ref('全部')
const activeRange = ref('全部')
const activeStatus = ref('全部')

const stats = computed(() => {
  const total = foreshadowing.value.length
  const explicit = foreshadowing.value.filter((item) => item.tag === '文本明确').length
  const inferred = foreshadowing.value.filter((item) => item.tag === '合理推断').length
  const tracking = foreshadowing.value.filter((item) => item.status === '追踪中').length
  return { total, explicit, inferred, tracking }
})

const tagOptions = computed(() => {
  const tags = new Set(['全部'])
  foreshadowing.value.forEach((item) => tags.add(item.tag || '未标注'))
  return Array.from(tags)
})

const rangeOptions = computed(() => {
  const ranges = new Set(['全部'])
  foreshadowing.value.forEach((item) => ranges.add(item.range))
  return Array.from(ranges)
})

const statusOptions = computed(() => {
  const statuses = new Set(['全部'])
  foreshadowing.value.forEach((item) => statuses.add(item.status || '追踪中'))
  return Array.from(statuses)
})

const filteredItems = computed(() => {
  const keyword = query.value.trim()
  return foreshadowing.value.filter((item) => {
    if (activeTag.value !== '全部' && item.tag !== activeTag.value) return false
    if (activeRange.value !== '全部' && item.range !== activeRange.value) return false
    if (activeStatus.value !== '全部' && item.status !== activeStatus.value) return false
    if (!keyword) return true
    return (
      item.title.includes(keyword) ||
      item.summary.includes(keyword) ||
      (item.evidence || '').includes(keyword)
    )
  })
})

const groupedItems = computed(() => {
  const map = new Map<string, ForeshadowingItem[]>()
  filteredItems.value.forEach((item) => {
    if (!map.has(item.range)) map.set(item.range, [])
    map.get(item.range)?.push(item)
  })
  const order = segments.value.map((segment) => segment.range)
  return Array.from(map.entries())
    .map(([range, items]) => ({ range, items }))
    .sort((a, b) => {
      const aIndex = order.indexOf(a.range)
      const bIndex = order.indexOf(b.range)
      if (aIndex === -1 && bIndex === -1) return a.range.localeCompare(b.range)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
})

const loadForeshadowing = async () => {
  loading.value = true
  try {
    const res = await fetch('/data/foreshadowing.json')
    if (!res.ok) throw new Error('Failed to load foreshadowing')
    const data = (await res.json()) as ForeshadowingData
    foreshadowing.value = data.items || []
    segments.value = data.segments || []
  } catch (error) {
    foreshadowing.value = []
    segments.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadForeshadowing)
</script>
