<template>
  <div class="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-24 right-[-140px] h-72 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-32 -left-20 h-64 w-64 rounded-full bg-[var(--accent-2-soft)] blur-3xl animate-float"
        style="animation-delay: 1.3s"
      ></div>
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle at 20% 15%, rgba(255,255,255,0.45), transparent 55%),
          radial-gradient(circle at 80% 5%, rgba(255,255,255,0.35), transparent 50%);"
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
              人物档案
            </div>
            <h1 class="font-display text-4xl sm:text-5xl mt-4">人物介绍</h1>
            <p class="text-ink-soft text-lg mt-4 max-w-xl">
              汇总主要角色的身份、阵营与关键节点，支持快速检索与分类筛选。
            </p>
            <div class="grid grid-cols-2 gap-4 mt-6 max-w-sm">
              <div class="card-surface rounded-2xl p-4">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">已收录</div>
                <div class="text-2xl font-semibold mt-2">
                  {{ statsLoaded ? stats.total : '—' }}
                </div>
              </div>
              <div class="card-surface rounded-2xl p-4">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">核心人物</div>
                <div class="text-2xl font-semibold mt-2">
                  {{ statsLoaded ? stats.core : '—' }}
                </div>
              </div>
            </div>
          </div>
          <div class="card-surface-strong rounded-3xl p-6 space-y-4">
            <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">推荐人物</div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xl font-semibold">
                  {{ featuredCharacter?.name || '姜望' }}
                </div>
                <div class="text-sm text-ink-soft mt-1">
                  {{ featuredCharacter?.brief || '主线人物，牵引多条因果线索。' }}
                </div>
              </div>
              <span class="px-3 py-1 rounded-full text-xs bg-[var(--accent-soft)] text-[var(--accent)]">
                {{ featuredCharacter ? categoryLabel[featuredCharacter.category] : '主角' }}
              </span>
            </div>
            <router-link
              :to="featuredCharacter?.path || '/character/jiang_wang'"
              class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] transition"
            >
              进入档案 →
            </router-link>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div class="card-surface rounded-3xl p-5 flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in categoryOptions"
              :key="item.value"
              type="button"
              class="px-4 py-2 rounded-full text-xs font-semibold transition"
              :class="
                activeCategory === item.value
                  ? 'bg-[var(--ink)] text-white'
                  : 'bg-white/70 text-ink-soft hover:text-[var(--ink)]'
              "
              @click="activeCategory = item.value"
            >
              {{ item.label }} · {{ item.count }}
            </button>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="query"
              type="text"
              placeholder="搜索人物姓名或关键词"
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

        <div class="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <router-link
            v-for="character in filteredCharacters"
            :key="character.id"
            :to="character.path"
            class="card-surface rounded-3xl p-6 transition hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ character.name }}</h3>
              <span class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft">
                {{ categoryLabel[character.category] || '人物' }}
              </span>
            </div>
            <p class="text-sm text-ink-soft mt-3">{{ character.brief }}</p>
            <div class="mt-4 text-sm font-semibold text-[var(--accent)]">进入档案 →</div>
          </router-link>

          <div
            v-if="statsLoaded && !filteredCharacters.length"
            class="card-surface rounded-3xl p-6 text-sm text-ink-soft"
          >
            暂无匹配结果，可尝试调整筛选或关键词。
          </div>
          <div
            v-if="!statsLoaded"
            class="card-surface rounded-3xl p-6 text-sm text-ink-soft"
          >
            正在加载人物档案…
          </div>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-black/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-2">
        <span>天机阁 · 人物档案</span>
        <router-link to="/" class="hover:text-[var(--ink)] transition">返回首页 →</router-link>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

type CharacterListItem = {
  id: string
  name: string
  path: string
  category: string
  brief: string
}

const route = useRoute()

const navItems = [
  { label: '人物', to: '/characters' },
  { label: '剧情', to: '/plot' },
  { label: '势力', to: '/factions' }
]

const characters = ref<CharacterListItem[]>([])
const query = ref('')
const activeCategory = ref('all')
const statsLoaded = ref(false)
const stats = ref({ total: 0, core: 0 })

const categoryLabel: Record<string, string> = {
  main: '主角',
  core: '核心',
  supporting: '重要',
  minor: '主要',
  cameo: '客串'
}

const categoryOptions = computed(() => {
  const list = characters.value
  const countBy = (value: string) =>
    list.filter((item) => item.category === value).length
  return [
    { value: 'all', label: '全部', count: list.length },
    { value: 'main', label: '主角', count: countBy('main') },
    { value: 'core', label: '核心', count: countBy('core') },
    { value: 'minor', label: '主要', count: countBy('minor') },
    { value: 'cameo', label: '客串', count: countBy('cameo') }
  ]
})

const filteredCharacters = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return characters.value.filter((item) => {
    const matchesCategory = activeCategory.value === 'all' || item.category === activeCategory.value
    const matchesQuery =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      item.brief.toLowerCase().includes(keyword)
    return matchesCategory && matchesQuery
  })
})

const featuredCharacter = computed(() =>
  characters.value.find((item) => item.category === 'main') || characters.value[0]
)

const fallbackCharacters: CharacterListItem[] = [
  {
    id: 'jiang_wang',
    name: '姜望',
    path: '/character/jiang_wang',
    category: 'main',
    brief: '庄国清河郡枫林城出身，后入齐国崛起，受封“青羊男”。'
  },
  {
    id: 'chongxuan_sheng',
    name: '重玄胜',
    path: '/character/chongxuan_sheng',
    category: 'core',
    brief: '齐国重玄氏子弟，擅长布局与资源整合，是姜望重要盟友。'
  },
  {
    id: 'ye_qingyu',
    name: '叶青雨',
    path: '/character/ye_qingyu',
    category: 'supporting',
    brief: '凌霄阁小姐，玉衡峰与迟云山线重要角色。'
  },
  {
    id: 'jiang_anan',
    name: '姜安安',
    path: '/character/jiang_anan',
    category: 'supporting',
    brief: '姜望之妹，凌霄阁亲传弟子，主线情感支点。'
  },
  {
    id: 'du_yehu',
    name: '杜野虎',
    path: '/character/du_yehu',
    category: 'core',
    brief: '枫林五侠之一，走古兵家气血冲脉之路。'
  },
  {
    id: 'wei_xun',
    name: '危寻',
    path: '/character/wei_xun',
    category: 'core',
    brief: '钓海楼楼主，衍道境真君，主导镇海盟成立。'
  }
]

const loadCharacters = async () => {
  try {
    const res = await fetch('/data/characters_list.json')
    if (!res.ok) throw new Error('Failed to load')
    const list = (await res.json()) as CharacterListItem[]
    characters.value = list
  } catch (error) {
    characters.value = fallbackCharacters
  } finally {
    stats.value.total = characters.value.length
    stats.value.core = characters.value.filter(
      (item) => item.category === 'core' || item.category === 'main'
    ).length
    statsLoaded.value = true
  }
}

onMounted(() => {
  loadCharacters()
})
</script>
