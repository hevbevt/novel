<template>
  <div class="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-24 right-[-120px] h-80 w-80 rounded-full bg-[var(--accent-2-soft)] blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-40 -left-24 h-72 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl animate-float"
        style="animation-delay: 1.1s"
      ></div>
      <div
        class="absolute inset-0 opacity-30"
        style="background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55), transparent 55%),
          radial-gradient(circle at 80% 0%, rgba(255,255,255,0.4), transparent 45%)"
      ></div>
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: linear-gradient(120deg, rgba(23,21,17,0.08) 1px, transparent 1px),
          linear-gradient(0deg, rgba(23,21,17,0.06) 1px, transparent 1px);
          background-size: 120px 120px, 60px 60px;"
      ></div>
    </div>

    <header class="relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="h-11 w-11 rounded-full bg-white/80 border border-[color:var(--ring)] flex items-center justify-center text-brand font-display text-xl shadow-sm">
            天
          </div>
          <div>
            <div class="font-display text-2xl">天机阁</div>
            <div class="text-[11px] uppercase tracking-[0.35em] text-ink-soft">赤心巡天资料站</div>
          </div>
        </div>
        <nav class="hidden lg:flex items-center gap-6 text-sm text-ink-soft">
          <router-link class="hover:text-[var(--ink)] transition" to="/characters">人物</router-link>
          <router-link class="hover:text-[var(--ink)] transition" to="/plot">剧情</router-link>
          <router-link class="hover:text-[var(--ink)] transition" to="/factions">势力</router-link>
          <router-link class="hover:text-[var(--ink)] transition" to="/foreshadowing">伏笔</router-link>
          <router-link class="hover:text-[var(--ink)] transition" to="/graph">因果界</router-link>
        </nav>
        <div class="flex items-center gap-3">
          <router-link
            to="/graph"
            class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ink)] text-white text-sm hover:opacity-90 transition"
          >
            进入因果界
            <span class="text-xs">↗</span>
          </router-link>
        </div>
      </div>
    </header>

    <main class="relative z-10">
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div class="grid lg:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
          <div class="space-y-6">
            <div
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--ring)] bg-white/70 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-ink-soft animate-fade-up"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
              万象图谱
            </div>
            <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight animate-fade-up" style="animation-delay: 0.05s">
              <span class="text-brand">赤心巡天</span>
              <span class="block">万象图谱</span>
            </h1>
            <p class="text-lg text-ink-soft max-w-xl animate-fade-up" style="animation-delay: 0.1s">
              以人物为经，以因果为纬，整理世界观、修行体系与剧情脉络。这里是《赤心巡天》的资料总览与索引入口。
            </p>
            <div class="flex flex-wrap gap-3 animate-fade-up" style="animation-delay: 0.15s">
              <router-link
                to="/graph"
                class="px-5 py-3 rounded-full bg-[var(--accent)] text-white text-sm font-semibold shadow-lg shadow-accent hover:translate-y-[-1px] transition"
              >
                进入因果界
              </router-link>
              <router-link
                to="/characters"
                class="px-5 py-3 rounded-full border border-[color:var(--ring)] bg-white/80 text-sm font-semibold text-[var(--ink)] hover:translate-y-[-1px] transition"
              >
                浏览人物
              </router-link>
              <router-link
                to="/plot"
                class="px-5 py-3 rounded-full border border-[color:var(--ring)] bg-white/50 text-sm font-semibold text-ink-soft hover:text-[var(--ink)] transition"
              >
                剧情提要
              </router-link>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div class="card-surface rounded-2xl p-4 animate-fade-up" style="animation-delay: 0.2s">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">已收录人物</div>
                <div class="text-2xl font-semibold mt-2">
                  {{ statsLoaded ? stats.total : '—' }}
                </div>
              </div>
              <div class="card-surface rounded-2xl p-4 animate-fade-up" style="animation-delay: 0.25s">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">核心人物</div>
                <div class="text-2xl font-semibold mt-2">
                  {{ statsLoaded ? stats.core : '—' }}
                </div>
              </div>
              <div class="card-surface rounded-2xl p-4 animate-fade-up" style="animation-delay: 0.3s">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">资料模块</div>
              <div class="text-2xl font-semibold mt-2">5</div>
              </div>
              <div class="card-surface rounded-2xl p-4 animate-fade-up" style="animation-delay: 0.35s">
                <div class="text-xs text-ink-soft uppercase tracking-[0.2em]">索引维度</div>
                <div class="text-2xl font-semibold mt-2">人 · 势 · 事 · 伏 · 图</div>
              </div>
            </div>
          </div>

          <div class="card-surface-strong rounded-3xl p-6 space-y-5 animate-fade-up" style="animation-delay: 0.15s">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">今日档案</div>
                <div class="text-xl font-semibold mt-1">姜望</div>
              </div>
              <span class="px-3 py-1 rounded-full text-xs bg-[var(--accent-soft)] text-[var(--accent)]">主角</span>
            </div>
            <p class="text-sm text-ink-soft">
              庄国清河郡枫林城凤溪镇出身，枫林城域覆灭后入齐国崛起，受封“青羊男”。人物档案已整理其出身、阵营与关键节点。
            </p>
            <router-link
              to="/character/jiang_wang"
              class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] transition"
            >
              进入人物档案 →
            </router-link>
            <div class="grid gap-3">
              <div class="rounded-2xl border border-[color:var(--ring)] bg-white/70 p-4">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">主线提示</div>
                <p class="mt-2 text-sm text-ink-soft">白骨道线、太虚幻境与黄河之会交织，牵引角色与势力走向。</p>
              </div>
              <div class="rounded-2xl border border-[color:var(--ring)] bg-white/70 p-4">
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">资料方向</div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span class="px-3 py-1 rounded-full text-xs bg-[var(--accent-2-soft)] text-[var(--accent-2)]">人物</span>
                  <span class="px-3 py-1 rounded-full text-xs bg-[var(--accent-soft)] text-[var(--accent)]">剧情</span>
                  <span class="px-3 py-1 rounded-full text-xs bg-[var(--accent-3-soft)] text-[var(--accent-3)]">势力</span>
                  <span class="px-3 py-1 rounded-full text-xs bg-black/5 text-ink-soft">修行</span>
                  <span class="px-3 py-1 rounded-full text-xs bg-[var(--accent-3-soft)] text-[var(--accent-3)]">伏笔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 class="font-display text-3xl">资料入口</h2>
            <p class="text-ink-soft mt-2">聚焦最常用的索引维度，快速进入相关资料。</p>
          </div>
        </div>
        <div class="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div
            v-for="(item, index) in modules"
            :key="item.title"
            class="card-surface rounded-3xl p-6 flex flex-col justify-between min-h-[220px] animate-fade-up"
            :style="`animation-delay: ${0.1 + index * 0.05}s`"
          >
            <div>
              <div class="text-xs uppercase tracking-[0.3em] text-ink-soft">0{{ index + 1 }}</div>
              <h3 class="text-xl font-semibold mt-3">{{ item.title }}</h3>
              <p class="text-sm text-ink-soft mt-3">{{ item.description }}</p>
            </div>
            <div class="mt-6">
              <component
                :is="item.to ? 'router-link' : 'a'"
                v-bind="item.to ? { to: item.to } : { href: item.href }"
                class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] transition"
              >
                {{ item.cta }} →
              </component>
            </div>
          </div>
        </div>
      </section>

      <section id="characters" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 class="font-display text-3xl">人物介绍</h2>
            <p class="text-ink-soft mt-2">选取主线与核心人物，快速了解身份、阵营与定位。</p>
          </div>
          <a href="#graph" class="text-sm text-ink-soft hover:text-[var(--ink)] transition">前往因果界 →</a>
        </div>
        <div class="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <router-link
            v-for="(character, index) in featuredCharacters"
            :key="character.id"
            :to="character.path"
            class="card-surface rounded-3xl p-6 transition hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ character.name }}</h3>
              <span class="px-3 py-1 rounded-full text-xs bg-black/5 text-ink-soft">
                {{ categoryLabel[character.category] || '人物' }}
              </span>
            </div>
            <p class="text-sm text-ink-soft mt-3">{{ character.brief }}</p>
            <div class="mt-4 text-sm font-semibold text-[var(--accent)]">进入档案 →</div>
          </router-link>
          <div
            v-if="!featuredCharacters.length"
            class="card-surface rounded-3xl p-6 text-sm text-ink-soft"
          >
            正在整理人物档案中，稍后可从因果界进入完整人物信息。
          </div>
        </div>
      </section>

      <section id="plot" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-[0.9fr,1.1fr] gap-8">
          <div>
            <h2 class="font-display text-3xl">剧情简介</h2>
            <p class="text-ink-soft mt-4">
              主线自枫林城域起步，经齐国权斗与内府突破、庄雍国战、海祭迷界，再至黄河之会与观河台夺魁，
              因果线与势力线互相牵引。
            </p>
            <div class="mt-6 rounded-2xl border border-[color:var(--ring)] bg-white/70 p-4 text-sm text-ink-soft">
              为避免剧透，本页面仅展示概要线索。如需深入，可在对应人物或势力档案中查看。
            </div>
          </div>
          <div class="grid gap-4">
            <div
              v-for="(item, index) in plotHighlights"
              :key="item.title"
              class="card-surface rounded-3xl p-5 animate-fade-up"
              :style="`animation-delay: ${0.1 + index * 0.05}s`"
            >
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-semibold">
                  {{ index + 1 }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold">{{ item.title }}</h3>
                  <p class="text-sm text-ink-soft mt-1">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="foreshadowing" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 class="font-display text-3xl">伏笔追踪</h2>
            <p class="text-ink-soft mt-2">汇总“隐线与伏笔”条目，跟踪回收进度与线索关联。</p>
          </div>
          <router-link to="/foreshadowing" class="text-sm text-ink-soft hover:text-[var(--ink)] transition">
            进入伏笔库 →
          </router-link>
        </div>
        <div class="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <router-link
            v-for="item in foreshadowingPreview"
            :key="item.id"
            :to="`/foreshadowing/${item.slug || item.id}`"
            class="card-surface rounded-3xl p-6 transition hover:-translate-y-1"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">{{ item.range }}</div>
                <h3 class="text-lg font-semibold mt-2">{{ item.title }}</h3>
              </div>
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
            </div>
            <p class="text-sm text-ink-soft mt-3">{{ item.summary || '暂无细化描述' }}</p>
            <div class="mt-4 text-xs text-ink-soft">状态：{{ item.status }}</div>
            <div class="mt-4 text-sm font-semibold text-[var(--accent)]">查看详情 →</div>
          </router-link>
          <div
            v-if="!foreshadowingPreview.length"
            class="card-surface rounded-3xl p-6 text-sm text-ink-soft"
          >
            伏笔条目整理中，稍后可进入伏笔库查看完整列表。
          </div>
        </div>
      </section>

      <section id="factions" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 class="font-display text-3xl">势力介绍</h2>
            <p class="text-ink-soft mt-2">涵盖国家/朝廷、宗门/学派、组织/暗线与非人族势力等多重维度。</p>
          </div>
          <a href="#modules" class="text-sm text-ink-soft hover:text-[var(--ink)] transition">回到入口 →</a>
        </div>
        <div class="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div
            v-for="(faction, index) in factions"
            :key="faction.name"
            class="card-surface rounded-3xl p-6 animate-fade-up"
            :style="`animation-delay: ${0.1 + index * 0.05}s`"
          >
            <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">{{ faction.tag }}</div>
            <h3 class="text-lg font-semibold mt-3">{{ faction.name }}</h3>
            <p class="text-sm text-ink-soft mt-3">{{ faction.description }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="label in faction.labels"
                :key="label"
                class="px-3 py-1 rounded-full text-xs bg-black/5 text-ink-soft"
              >
                {{ label }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="graph" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 class="font-display text-3xl">因果界 · 人物关系图</h2>
            <p class="text-ink-soft mt-2">全量人物关系一览，支持节点点击与局部聚焦。</p>
          </div>
          <router-link to="/graph" class="text-sm text-ink-soft hover:text-[var(--ink)] transition">
            进入完整模式 →
          </router-link>
        </div>
        <div class="mt-6 card-surface-strong rounded-3xl p-4 h-[520px]">
          <RelationGraph v-if="graphData" :graph-data="graphData" :auto-load="false" mode="overview" />
          <div v-else class="h-full flex items-center justify-center text-sm text-ink-soft">
            {{ graphError || '正在加载关系图谱…' }}
          </div>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-black/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-2">
        <span>天机阁 · 赤心巡天资料站</span>
        <span>人物 · 势力 · 剧情 · 伏笔 · 因果图谱</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import RelationGraph from '../components/RelationGraph.vue'

type CharacterListItem = {
  id: string
  name: string
  path: string
  category: string
  brief: string
}

const statsLoaded = ref(false)
const stats = ref({ total: 0, core: 0 })

const featuredCharacters = ref<CharacterListItem[]>([])

type GraphData = {
  nodes: any[]
  links: any[]
  categories: any[]
}

type ForeshadowingItem = {
  id: string
  slug?: string
  title: string
  summary: string
  tag: string
  status: string
  range: string
}

const graphData = ref<GraphData | null>(null)
const graphError = ref('')
const foreshadowingPreview = ref<ForeshadowingItem[]>([])

const featuredIds = [
  'jiang_wang',
  'chongxuan_sheng',
  'ye_qingyu',
  'jiang_anan',
  'du_yehu',
  'wei_xun'
]

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
    brief: '齐国重玄氏子弟，擅长布局与资源整合，姜望重要盟友。'
  },
  {
    id: 'jiang_anan',
    name: '姜安安',
    path: '/character/jiang_anan',
    category: 'supporting',
    brief: '姜望之妹，凌霄阁亲传弟子，是主线情感支点。'
  }
]

const categoryLabel: Record<string, string> = {
  main: '主角',
  core: '核心',
  supporting: '重要',
  minor: '主要',
  cameo: '客串'
}

const modules = [
  {
    title: '人物档案',
    description: '收录核心与主线人物的身份、出场、阵营与关键节点。',
    to: '/characters',
    cta: '查看人物'
  },
  {
    title: '剧情简介',
    description: '以章节推进与主题脉络为主线，浓缩剧情结构与节奏。',
    to: '/plot',
    cta: '查看剧情'
  },
  {
    title: '势力版图',
    description: '整理诸国势力、宗门组织与暗线势力的格局与影响力。',
    to: '/factions',
    cta: '查看势力'
  },
  {
    title: '伏笔追踪',
    description: '汇总隐线伏笔与对应证据，持续追踪回收进展。',
    to: '/foreshadowing',
    cta: '查看伏笔'
  },
  {
    title: '因果界',
    description: '人物关系图谱，点击节点聚焦其一层关系与简要档案。',
    to: '/graph',
    cta: '进入图谱'
  }
]

const plotHighlights = [
  {
    title: '枫林城域 · 少年启行',
    description: '开脉丹与道院历练开启主线，白骨道暗线浮现。'
  },
  {
    title: '齐国篇 · 立足与突破',
    description: '临淄权斗与东街口生死战，姜望叩开内府。'
  },
  {
    title: '海祭与迷界',
    description: '天涯台海祭翻案，镇海盟成立，迷界洗罪线展开。'
  },
  {
    title: '黄河之会',
    description: '太庙“大师之礼”与观河台正赛，姜望夺魁展旗。'
  }
]

const factions = [
  {
    name: '齐国',
    tag: '国家/朝廷',
    description: '东域强国，临淄为中心，稷下学宫与九卒军制支撑国势。',
    labels: ['临淄', '稷下学宫', '九卒']
  },
  {
    name: '庄国',
    tag: '国家/朝廷',
    description: '清河郡旧土，庄雍国战改写西境版图，枫林旧案牵动主线。',
    labels: ['清河郡', '锁龙关', '枫林旧案']
  },
  {
    name: '钓海楼',
    tag: '宗门/海上霸主',
    description: '近海群岛最强势力，主导海祭与海域秩序，楼主危寻裁断海祭争端。',
    labels: ['海祭', '长老体系', '天涯台']
  },
  {
    name: '白骨道',
    tag: '隐秘势力',
    description: '以幽冥神祇降世为目标的邪教体系，庄国篇主线冲突核心。',
    labels: ['幽冥', '无生劫', '邪教']
  }
]

const loadCharacters = async () => {
  try {
    const res = await fetch('/data/characters_list.json')
    if (!res.ok) throw new Error('Failed to load character list')
    const list = (await res.json()) as CharacterListItem[]
    stats.value.total = list.length
    stats.value.core = list.filter((item) => item.category === 'core' || item.category === 'main').length
    featuredCharacters.value = featuredIds
      .map((id) => list.find((item) => item.id === id))
      .filter(Boolean) as CharacterListItem[]
    if (!featuredCharacters.value.length) {
      featuredCharacters.value = fallbackCharacters
    }
  } catch (error) {
    featuredCharacters.value = fallbackCharacters
  } finally {
    statsLoaded.value = true
  }
}

const loadGraph = async () => {
  graphError.value = ''
  try {
    const res = await fetch('/data/graph.json')
    if (!res.ok) throw new Error('无法加载关系图谱')
    graphData.value = await res.json()
  } catch (error: any) {
    graphError.value = error?.message || '关系图谱加载失败'
  }
}

const loadForeshadowing = async () => {
  try {
    const res = await fetch('/data/foreshadowing.json')
    if (!res.ok) throw new Error('无法加载伏笔数据')
    const data = await res.json()
    foreshadowingPreview.value = (data.items || []).slice(0, 3)
  } catch (error) {
    foreshadowingPreview.value = []
  }
}

onMounted(() => {
  loadCharacters()
  loadGraph()
  loadForeshadowing()
})
</script>
