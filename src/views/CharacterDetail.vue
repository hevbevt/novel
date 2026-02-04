<template>
  <div class="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-24 right-[-140px] h-72 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-32 -left-20 h-64 w-64 rounded-full bg-[var(--accent-2-soft)] blur-3xl animate-float"
        style="animation-delay: 1.2s"
      ></div>
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle at 25% 15%, rgba(255,255,255,0.45), transparent 55%);"
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
            :class="isActive(item.to) ? 'text-[var(--ink)]' : 'text-ink-soft hover:text-[var(--ink)]'"
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

    <main class="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
      <div v-if="loading" class="py-16">
        <div class="card-surface-strong rounded-3xl p-8">
          <div class="h-6 w-48 bg-black/10 rounded-full animate-pulse"></div>
          <div class="mt-4 h-10 w-72 bg-black/10 rounded-full animate-pulse"></div>
          <div class="mt-6 h-4 w-full max-w-xl bg-black/10 rounded-full animate-pulse"></div>
          <div class="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="h-40 rounded-3xl bg-black/5 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-20 text-rose-500">
        {{ error }}
      </div>

      <div v-else>
        <section class="card-surface-strong rounded-3xl p-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="space-y-3">
              <div class="text-xs uppercase tracking-[0.3em] text-ink-soft">人物档案</div>
              <h1 class="font-display text-3xl sm:text-4xl">
                {{ character?.title || '未知人物' }}
              </h1>
              <p class="text-ink-soft text-sm sm:text-base max-w-2xl">
                {{ metadata['身份/出身'] || '暂无身份信息' }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in summaryTags"
                  :key="tag"
                  class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <router-link
                to="/characters"
                class="px-4 py-2 rounded-full border border-[color:var(--ring)] bg-white/80 text-sm font-semibold text-[var(--ink)] hover:translate-y-[-1px] transition"
              >
                返回人物列表
              </router-link>
              <router-link
                to="/graph"
                class="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-semibold hover:translate-y-[-1px] transition shadow-accent"
              >
                查看因果界
              </router-link>
            </div>
          </div>
        </section>

        <section class="mt-8 grid grid-cols-1 lg:grid-cols-[1fr,1.6fr,1fr] gap-6">
          <aside class="card-surface rounded-3xl p-6 lg:sticky lg:top-10 self-start">
            <div class="flex flex-col items-center text-center">
              <div class="h-24 w-24 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-3xl font-display">
                {{ character?.title?.[0] || '?' }}
              </div>
              <div class="mt-4 text-lg font-semibold">{{ character?.title }}</div>
              <div class="text-xs text-ink-soft mt-1">{{ metadata['所属/阵营'] || metadata['身份/出身'] }}</div>
            </div>

            <div class="mt-6 space-y-4">
              <div v-for="item in detailItems" :key="item.label" class="text-sm">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">{{ item.label }}</div>
                <div class="mt-1 text-sm text-[var(--ink)]">{{ item.value }}</div>
              </div>
            </div>
          </aside>

          <article class="card-surface rounded-3xl p-6 md:p-8 min-h-[520px]">
            <h2 class="font-display text-2xl mb-6">人物生平</h2>
            <div v-if="hasContent" class="prose max-w-none text-ink-soft leading-relaxed markdown-body" v-html="character?.content"></div>
            <div v-else class="space-y-6 text-sm text-ink-soft">
              <div v-for="section in lifeSections" :key="section.title">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">{{ section.title }}</div>
                <ul v-if="section.items?.length" class="mt-3 space-y-2 list-disc list-inside text-sm text-[var(--ink)]">
                  <li v-for="item in section.items" :key="item">{{ item }}</li>
                </ul>
                <p v-else class="mt-3 text-[var(--ink)]">{{ section.text }}</p>
              </div>
              <div v-if="!lifeSections.length" class="text-ink-soft">
                暂无完整生平记录，可从关系网络与关键节点中补充。
              </div>
            </div>
          </article>

          <aside class="card-surface rounded-3xl p-6 lg:sticky lg:top-10 self-start">
            <h3 class="font-display text-xl mb-4">天机推演</h3>
            <div class="space-y-4 text-sm text-ink-soft">
              <div v-if="metadata['关系网络']">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">关系网络</div>
                <p class="mt-2 text-[var(--ink)]">{{ metadata['关系网络'] }}</p>
              </div>
              <div v-if="metadata['关键经历']">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">关键节点</div>
                <p class="mt-2 text-[var(--ink)]">{{ metadata['关键经历'] }}</p>
              </div>
              <div v-if="metadata['现状']">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">现状</div>
                <p class="mt-2 text-[var(--ink)]">{{ metadata['现状'] }}</p>
              </div>
              <div v-if="!metadata['关系网络'] && !metadata['关键经历'] && !metadata['现状']">
                暂无推演线索，可从剧情路线图与因果界补全。
              </div>
              <router-link to="/graph" class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] transition">
                查看关系全图 →
              </router-link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const character = ref<any>(null)
const loading = ref(true)
const error = ref('')

const navItems = [
  { label: '人物', to: '/characters' },
  { label: '剧情', to: '/plot' },
  { label: '势力', to: '/factions' },
  { label: '伏笔', to: '/foreshadowing' }
]

const isActive = (path: string) => {
  if (path === '/characters') {
    return route.path.startsWith('/characters') || route.path.startsWith('/character')
  }
  return route.path.startsWith(path)
}

const resolveCharacterId = (id: string) => (id === 'tai_yu' ? 'li_yi' : id)

const fetchCharacter = async (id: string) => {
  loading.value = true
  error.value = ''
  try {
    const resolvedId = resolveCharacterId(id)
    const res = await fetch(`/data/characters/${resolvedId}.json`)
    if (!res.ok) throw new Error('Character not found')
    character.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const metadata = computed<Record<string, string>>(() => character.value?.metadata ?? {})

const detailKeys = ['叙事重要度', '初登场', '身份/出身', '所属/阵营', '修行/能力', '别称/化名']

const detailItems = computed(() =>
  detailKeys
    .map((key) => ({ label: key, value: metadata.value?.[key] }))
    .filter((item) => item.value)
)

const summaryTags = computed(() => {
  const tags = []
  if (metadata.value?.['叙事重要度']) tags.push(metadata.value['叙事重要度'])
  if (metadata.value?.['初登场']) tags.push(`初登场：${metadata.value['初登场']}`)
  if (metadata.value?.['所属/阵营']) tags.push(metadata.value['所属/阵营'])
  return tags
})

const hasContent = computed(() => (character.value?.content || '').trim().length > 0)

const splitText = (text: string) =>
  text
    .split(/[；。]/g)
    .map((item) => item.trim())
    .filter(Boolean)

const lifeSections = computed(() => {
  const sections: { title: string; text?: string; items?: string[] }[] = []
  const experiences = metadata.value?.['关键经历']
  if (experiences) {
    sections.push({ title: '关键经历', items: splitText(experiences) })
  }
  const relations = metadata.value?.['与主角关系']
  if (relations) {
    sections.push({ title: '与主角关系', text: relations })
  }
  const status = metadata.value?.['现状']
  if (status) {
    sections.push({ title: '现状', text: status })
  }
  return sections
})

onMounted(() => {
  if (route.params.id) {
    fetchCharacter(route.params.id as string)
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) fetchCharacter(newId as string)
})
</script>

<style>
.markdown-body ul {
  list-style-type: disc;
  padding-left: 1.5em;
  margin-bottom: 1em;
}
.markdown-body p {
  margin-bottom: 1em;
}
</style>
