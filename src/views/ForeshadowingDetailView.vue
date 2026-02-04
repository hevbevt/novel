<template>
  <div class="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-28 right-[-140px] h-72 w-72 rounded-full bg-[var(--accent-2-soft)] blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-40 -left-24 h-64 w-64 rounded-full bg-[var(--accent-3-soft)] blur-3xl animate-float"
        style="animation-delay: 1.1s"
      ></div>
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.45), transparent 60%);"
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
            :class="route.path.startsWith(item.to) ? 'text-[var(--ink)]' : 'text-ink-soft hover:text-[var(--ink)]'"
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
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div v-if="loading" class="card-surface-strong rounded-3xl p-8">
          <div class="h-6 w-40 bg-black/10 rounded-full animate-pulse"></div>
          <div class="mt-4 h-10 w-72 bg-black/10 rounded-full animate-pulse"></div>
          <div class="mt-6 h-4 w-full max-w-xl bg-black/10 rounded-full animate-pulse"></div>
        </div>

        <div v-else-if="error" class="text-center py-20 text-rose-500">
          {{ error }}
        </div>

        <div v-else class="card-surface-strong rounded-3xl p-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="space-y-3">
              <div class="text-xs uppercase tracking-[0.3em] text-ink-soft">伏笔档案</div>
              <h1 class="font-display text-3xl sm:text-4xl">
                {{ current?.title || '未知伏笔' }}
              </h1>
              <p class="text-ink-soft text-sm sm:text-base max-w-2xl">
                {{ current?.summary || '暂无摘要说明。' }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  class="px-3 py-1 rounded-full text-xs"
                  :class="current?.tag === '文本明确'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : current?.tag === '合理推断'
                      ? 'bg-[var(--accent-3-soft)] text-[var(--accent-3)]'
                      : 'bg-[var(--ink-soft-bg)] text-ink-soft'"
                >
                  {{ current?.tag || '未标注' }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs bg-black/5 text-ink-soft">
                  {{ current?.status || '追踪中' }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft">
                  {{ current?.range || '章节待定' }}
                </span>
                <span v-if="current?.source" class="px-3 py-1 rounded-full text-xs bg-white/70 text-ink-soft">
                  来源：{{ current.source }}
                </span>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <router-link
                to="/foreshadowing"
                class="px-4 py-2 rounded-full border border-[color:var(--ring)] bg-white/80 text-sm font-semibold text-[var(--ink)] hover:translate-y-[-1px] transition"
              >
                返回伏笔列表
              </router-link>
              <router-link
                to="/plot"
                class="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-semibold hover:translate-y-[-1px] transition"
              >
                查看剧情路线
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12" v-if="!loading && current">
        <div class="grid lg:grid-cols-[1fr,1fr] gap-6">
          <div class="card-surface rounded-3xl p-6">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-2xl">证据联动</h2>
              <span class="text-xs text-ink-soft">共 {{ evidenceCount }} 条</span>
            </div>
            <div v-if="current?.evidence" class="mt-3 text-xs text-ink-soft">
              原始证据：{{ current.evidence }}
            </div>
            <div class="mt-4 space-y-4">
              <div v-if="!evidenceGroups.length" class="text-sm text-ink-soft">
                暂无证据条目，可回到路线图补充。
              </div>
              <div
                v-for="group in evidenceGroups"
                :key="group.file"
                class="rounded-2xl border border-[color:var(--ring)] bg-white/70 p-4"
              >
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">{{ group.file }}</div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="item in group.items"
                    :key="item.text"
                    class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft"
                  >
                    {{ item.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-surface rounded-3xl p-6">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-2xl">时间线</h2>
              <span class="text-xs text-ink-soft">按章节排序</span>
            </div>
            <div class="mt-4 space-y-4">
              <div v-if="!timelineItems.length" class="text-sm text-ink-soft">
                暂无时间线信息。
              </div>
              <div
                v-for="(item, index) in timelineItems"
                :key="`${item.label}-${index}`"
                class="flex gap-4"
              >
                <div class="flex flex-col items-center">
                  <div class="h-3 w-3 rounded-full bg-[var(--accent)]"></div>
                  <div v-if="index < timelineItems.length - 1" class="w-px flex-1 bg-[color:var(--ring)]"></div>
                </div>
                <div class="pb-4">
                  <div class="text-sm font-semibold">
                    {{ item.label }}
                  </div>
                  <div class="text-xs text-ink-soft mt-1">
                    <span v-if="item.anchor">证据：{{ item.anchor }}</span>
                    <span v-if="item.file"> · {{ item.file }}</span>
                    <span v-if="item.start"> · 第{{ item.start }}章</span>
                    <span v-if="item.end && item.end !== item.start">–第{{ item.end }}章</span>
                    <span v-if="item.approx" class="ml-1">（约）</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" v-if="!loading && relatedItems.length">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 class="font-display text-3xl">同卷伏笔</h2>
            <p class="text-ink-soft mt-2">来自 {{ current?.range }} 的其他线索</p>
          </div>
          <router-link to="/foreshadowing" class="text-sm text-ink-soft hover:text-[var(--ink)] transition">
            查看全部 →
          </router-link>
        </div>
        <div class="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <router-link
            v-for="item in relatedItems"
            :key="item.id"
            :to="`/foreshadowing/${item.slug || item.id}`"
            class="card-surface rounded-3xl p-6 transition hover:-translate-y-1"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-lg font-semibold">{{ item.title }}</h3>
              <span class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft">
                {{ item.tag || '未标注' }}
              </span>
            </div>
            <p class="text-sm text-ink-soft mt-3">{{ item.summary || '暂无摘要' }}</p>
            <div class="mt-4 text-sm font-semibold text-[var(--accent)]">查看详情 →</div>
          </router-link>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-black/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-2">
        <span>天机阁 · 伏笔追踪</span>
        <router-link to="/foreshadowing" class="hover:text-[var(--ink)] transition">返回伏笔列表 →</router-link>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

type EvidenceItem = {
  file: string
  text: string
  start?: number | null
  end?: number | null
  approx?: boolean
}

type TimelineItem = {
  label: string
  anchor?: string
  file?: string
  start?: number | null
  end?: number | null
  approx?: boolean
}

type ForeshadowingItem = {
  id: string
  slug?: string
  title: string
  summary: string
  tag: string
  status: string
  range: string
  evidence?: string
  evidenceItems?: EvidenceItem[]
  timeline?: TimelineItem[]
  source?: string
}

type ForeshadowingData = {
  items: ForeshadowingItem[]
}

const route = useRoute()

const navItems = [
  { label: '人物', to: '/characters' },
  { label: '剧情', to: '/plot' },
  { label: '势力', to: '/factions' },
  { label: '伏笔', to: '/foreshadowing' }
]

const loading = ref(true)
const error = ref('')
const allItems = ref<ForeshadowingItem[]>([])
const current = ref<ForeshadowingItem | null>(null)

const evidenceGroups = computed(() => {
  const map = new Map<string, EvidenceItem[]>()
  const items = current.value?.evidenceItems || []
  items.forEach((item) => {
    if (!map.has(item.file)) map.set(item.file, [])
    map.get(item.file)?.push(item)
  })
  return Array.from(map.entries()).map(([file, items]) => ({ file, items }))
})

const evidenceCount = computed(() => {
  return current.value?.evidenceItems?.length || 0
})

const timelineItems = computed(() => {
  if (!current.value) return []
  const baseLabel = current.value.summary || current.value.title || '伏笔线索'
  const evidenceItems = current.value.evidenceItems || []
  if (!evidenceItems.length) {
    return [
      {
        label: baseLabel
      }
    ]
  }
  return evidenceItems.map((item) => ({
    label: baseLabel,
    anchor: item.text,
    file: item.file,
    start: item.start,
    end: item.end,
    approx: item.approx
  }))
})

const relatedItems = computed(() => {
  if (!current.value) return []
  return allItems.value
    .filter((item) => item.range === current.value?.range && item.id !== current.value?.id)
    .slice(0, 6)
})

const loadData = async (id: string) => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/data/foreshadowing.json')
    if (!res.ok) throw new Error('无法加载伏笔数据')
    const data = (await res.json()) as ForeshadowingData
    allItems.value = data.items || []
    current.value =
      allItems.value.find((item) => item.slug === id || item.id === id) || null
    if (!current.value) throw new Error('未找到对应伏笔条目')
  } catch (err: any) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.params.id) loadData(route.params.id as string)
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadData(newId as string)
  }
)
</script>
