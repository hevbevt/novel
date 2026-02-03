<template>
  <div class="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-[var(--accent-2-soft)] blur-3xl animate-float"
      ></div>
      <div
        class="absolute top-40 -left-16 h-64 w-64 rounded-full bg-[var(--accent-3-soft)] blur-3xl animate-float"
        style="animation-delay: 1.2s"
      ></div>
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle at 75% 10%, rgba(255,255,255,0.5), transparent 55%);"
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
              势力索引
            </div>
            <h1 class="font-display text-4xl sm:text-5xl mt-4">势力介绍</h1>
            <p class="text-ink-soft text-lg mt-4 max-w-xl">
              以国家、宗门、组织与暗线势力为维度，梳理势力格局及其对剧情的影响。
            </p>
          </div>
          <div class="card-surface-strong rounded-3xl p-6 space-y-4">
            <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">势力提示</div>
            <div class="text-base font-semibold">格局主轴</div>
            <p class="text-sm text-ink-soft">
              国家/朝廷、宗门/秘境与隐秘组织并行运作，白骨道、海祭与黄河之会等线索交织成主轴。
            </p>
            <router-link
              to="/plot"
              class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] transition"
            >
              查看剧情线索 →
            </router-link>
          </div>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          v-for="group in factionGroups"
          :key="group.title"
          class="mb-12"
        >
          <div class="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 class="font-display text-3xl">{{ group.title }}</h2>
              <p class="text-ink-soft mt-2">{{ group.description }}</p>
            </div>
          </div>
          <div class="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div
              v-for="faction in group.items"
              :key="faction.name"
              class="card-surface rounded-3xl p-6"
            >
              <div class="text-xs uppercase tracking-[0.2em] text-ink-soft">{{ faction.tag }}</div>
              <h3 class="text-lg font-semibold mt-3">{{ faction.name }}</h3>
              <p class="text-sm text-ink-soft mt-3">{{ faction.description }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="label in faction.labels"
                  :key="label"
                  class="px-3 py-1 rounded-full text-xs bg-[var(--ink-soft-bg)] text-ink-soft"
                >
                  {{ label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="relative z-10 border-t border-black/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-ink-soft flex flex-wrap items-center justify-between gap-2">
        <span>天机阁 · 势力档案</span>
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

const factionGroups = [
  {
    title: '国家与朝廷',
    description: '以国力与制度为核心的政治势力，决定修行资源与格局走向。',
    items: [
      {
        name: '齐国',
        tag: '东域强国',
        description: '以临淄为中心，稷下学宫与九卒军制支撑国势，主角成长舞台。',
        labels: ['临淄', '稷下学宫', '九卒']
      },
      {
        name: '庄国',
        tag: '清河旧土',
        description: '枫林城域故土，庄雍国战改写西境版图，枫林旧案牵动主线。',
        labels: ['清河郡', '锁龙关', '枫林旧案']
      },
      {
        name: '雍国',
        tag: '西境大国',
        description: '锁龙关之战后引入墨门改革，顺安府与边军体系重整。',
        labels: ['墨门', '顺安府', '边军']
      }
    ]
  },
  {
    title: '宗门与体系',
    description: '修行传承与秘境体系的核心载体，影响人物进阶路径。',
    items: [
      {
        name: '钓海楼',
        tag: '海上霸主',
        description: '近海群岛最强势力，主导海祭与海域秩序，楼主危寻裁断争端。',
        labels: ['海祭', '长老体系', '天涯台']
      },
      {
        name: '凌霄阁',
        tag: '云国国本',
        description: '云国顶级宗门，维持中立，姜安安为其亲传弟子。',
        labels: ['云国', '叶凌霄', '云顶仙宫']
      },
      {
        name: '太虚派',
        tag: '隐世宗门',
        description: '太虚幻境首倡与监察者，推行太虚角楼与太虚使者体系。',
        labels: ['太虚幻境', '监察', '太虚角楼']
      }
    ]
  },
  {
    title: '组织与暗线势力',
    description: '潜伏或跨域运作的组织，推动隐藏冲突与剧情转折。',
    items: [
      {
        name: '白骨道',
        tag: '邪教组织',
        description: '以幽冥神祇降世为目标，枫林城域覆灭的核心推手。',
        labels: ['幽冥', '无生劫', '白骨道子']
      },
      {
        name: '平等国',
        tag: '隐秘组织',
        description: '刺君与哭祠后浮出水面，借“平等”理念蛊惑人心。',
        labels: ['刺君', '星楼', '齐夏战后']
      },
      {
        name: '镇海盟',
        tag: '海上联盟',
        description: '危寻推动成立，统合近海群岛力量以应对海族跃升。',
        labels: ['海勋', '卫海士', '盟约']
      }
    ]
  },
  {
    title: '非人族势力',
    description: '与人族长期角力的族群势力，牵动水系与海疆秩序。',
    items: [
      {
        name: '清江水府',
        tag: '水族势力',
        description: '清江与澜河水系核心水府，宋横江身死后权柄更替。',
        labels: ['水府', '宋横江', '魔窟']
      }
    ]
  }
]
</script>
