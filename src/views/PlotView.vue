<template>
  <div class="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-28 left-[-120px] h-72 w-72 rounded-full bg-[var(--accent-3-soft)] blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-40 right-[-80px] h-64 w-64 rounded-full bg-[var(--accent-soft)] blur-3xl animate-float"
        style="animation-delay: 1.1s"
      ></div>
      <div
        class="absolute inset-0 opacity-25"
        style="background-image: radial-gradient(circle at 70% 10%, rgba(255,255,255,0.45), transparent 60%);"
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
              剧情概要
            </div>
            <h1 class="font-display text-4xl sm:text-5xl mt-4">剧情简介</h1>
            <p class="text-ink-soft text-lg mt-4 max-w-xl">
              以章节推进与关键事件为索引，梳理人物成长与势力格局的联动，形成可检索的剧情路线图。
            </p>
            <div class="mt-6 card-surface rounded-2xl p-4 text-sm text-ink-soft">
              为避免剧透，本页聚焦主线脉络与主题结构，详细事件请前往人物档案与剧情路线图。
            </div>
          </div>
          <div class="card-surface-strong rounded-3xl p-6">
            <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">路线图进度</div>
            <div class="mt-4 space-y-3">
              <div
                v-for="segment in roadmapSegments"
                :key="segment.title"
                class="flex items-center justify-between gap-3"
              >
                <div>
                  <div class="text-base font-semibold">{{ segment.title }}</div>
                  <div class="text-xs text-ink-soft mt-1">{{ segment.note }}</div>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-xs"
                  :class="segment.status === '已整理'
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[var(--ink-soft-bg)] text-ink-soft'"
                >
                  {{ segment.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="grid lg:grid-cols-[0.9fr,1.1fr] gap-8">
          <div>
            <h2 class="font-display text-3xl">主线脉络</h2>
            <p class="text-ink-soft mt-3">
              从清河郡少年启行，到齐国权势博弈，再到太虚幻境的试炼与抉择，剧情通过因果牵引不断扩展。
            </p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="tag in plotTags"
                :key="tag"
                class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="grid gap-4">
            <div
              v-for="(item, index) in plotHighlights"
              :key="item.title"
              class="card-surface rounded-3xl p-5"
            >
              <div class="flex items-start gap-4">
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

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div class="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h2 class="font-display text-3xl">章节路线图</h2>
            <p class="text-ink-soft mt-2">按章节区间整理关键剧情节点，持续补完。</p>
          </div>
          <router-link to="/characters" class="text-sm text-ink-soft hover:text-[var(--ink)] transition">
            浏览人物档案 →
          </router-link>
        </div>
        <div class="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            v-for="segment in chapterSegments"
            :key="segment.range"
            class="card-surface rounded-3xl p-6"
          >
            <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">{{ segment.range }}</div>
            <h3 class="text-lg font-semibold mt-3">{{ segment.title }}</h3>
            <p class="text-sm text-ink-soft mt-3">{{ segment.summary }}</p>
            <div class="mt-4 text-xs text-ink-soft">
              参考文档：{{ segment.doc }}
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-black/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-2">
        <span>天机阁 · 剧情路线</span>
        <router-link to="/" class="hover:text-[var(--ink)] transition">返回首页 →</router-link>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: '人物', to: '/characters' },
  { label: '剧情', to: '/plot' },
  { label: '势力', to: '/factions' }
]

const roadmapSegments = [
  {
    title: '第1-500章路线图',
    note: '枫林城域与七星楼秘境',
    status: '已整理'
  },
  {
    title: '第501-1000章路线图',
    note: '临淄权斗、国战与海祭迷界',
    status: '已整理'
  },
  {
    title: '第1001-1500章路线图',
    note: '黄河之会与观河台正赛',
    status: '已整理'
  }
]

const plotTags = [
  '白骨道',
  '太虚幻境',
  '七星楼秘境',
  '庄雍国战',
  '海祭迷界',
  '黄河之会'
]

const plotHighlights = [
  {
    title: '枫林城域覆灭',
    description: '白骨道之乱引爆庄国篇主线，姜望携妹离乡。'
  },
  {
    title: '齐国立足与内府突破',
    description: '临淄权斗与东街口生死战，姜望叩开内府。'
  },
  {
    title: '海祭翻案与迷界洗罪',
    description: '天涯台海祭翻案，镇海盟成立，迷界战端开启。'
  },
  {
    title: '观河台夺魁',
    description: '太庙“大师之礼”后入观河台，姜望夺魁展旗。'
  }
]

const chapterSegments = [
  {
    range: '1-500章',
    title: '枫林城域 · 白骨道与七星楼',
    summary: '从枫林城道院到枫林覆灭，再到七星楼秘境生死棋。',
    doc: 'docs/plot/PLOT_ROADMAP_1-500.md'
  },
  {
    range: '501-1000章',
    title: '临淄权斗 · 国战与海祭',
    summary: '内府突破、庄雍国战、海祭翻案与迷界洗罪并行推进。',
    doc: 'docs/plot/PLOT_ROADMAP_501-1000.md'
  },
  {
    range: '1001-1500章',
    title: '黄河之会 · 观河台决赛',
    summary: '名额争夺与太庙礼、观河台正赛、内府魁名与太虞现身。',
    doc: 'docs/plot/PLOT_ROADMAP_1001-1500.md'
  }
]
</script>
