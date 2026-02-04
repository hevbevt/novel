import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../docs/characters');
const outputDir = path.resolve(__dirname, '../public/data/characters');
const indexFile = path.resolve(__dirname, '../public/data/characters_list.json');
const docsRoot = path.resolve(__dirname, '../docs');

const analysisSources = {
  plot_1_500: readFileSafe(path.resolve(docsRoot, 'plot/PLOT_ROADMAP_1-500.md')),
  plot_501_1000: readFileSafe(path.resolve(docsRoot, 'plot/PLOT_ROADMAP_501-1000.md')),
  plot_1001_1500: readFileSafe(path.resolve(docsRoot, 'plot/PLOT_ROADMAP_1001-1500.md')),
  worldview: readFileSafe(path.resolve(docsRoot, 'world/WORLDVIEW.md')),
  relations: readFileSafe(path.resolve(docsRoot, 'CHARACTER_RELATIONS.md')),
  factions: readDirMarkdown(path.resolve(docsRoot, 'factions'))
};

const relationFile = path.resolve(docsRoot, 'CHARACTER_RELATIONS.md');

const baseScoreMap = {
  main: 90,
  core: 75,
  supporting: 60,
  minor: 45,
  cameo: 25
};

const weightConfig = {
  rule: 0.55,
  frequency: 0.25,
  centrality: 0.20
};

const mentionWeights = {
  plot_1_500: 1.0,
  plot_501_1000: 1.0,
  plot_1001_1500: 1.0,
  worldview: 0.6,
  relations: 0.8,
  factions: 0.6
};

const centralityWeights = {
  degree: 0.4,
  pagerank: 0.6
};

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const charactersIndex = [];

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return '';
  }
}

function readDirMarkdown(dir) {
  if (!fs.existsSync(dir)) return '';
  const entries = fs.readdirSync(dir);
  let buffer = '';
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      buffer += readDirMarkdown(fullPath);
    } else if (entry.endsWith('.md')) {
      buffer += '\n' + readFileSafe(fullPath);
    }
  });
  return buffer;
}

function extractTitleName(title) {
  return title.split('（')[0].split('(')[0].trim();
}

function splitAliases(raw) {
  if (!raw) return [];
  return raw
    .replace(/（.*?）/g, '')
    .split(/[、/，；]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function resolveBaseScore(metadata, categoryKey) {
  const narrative = metadata['叙事重要度'] || '';
  if (narrative.includes('主角')) return 90;
  if (narrative.includes('核心')) return 75;
  if (narrative.includes('重要')) return 60;
  if (narrative.includes('支线')) return 45;
  if (narrative.includes('客串')) return 25;
  return baseScoreMap[categoryKey] ?? 30;
}

function countOccurrences(text, keyword) {
  if (!text || !keyword) return 0;
  let count = 0;
  let index = 0;
  while (true) {
    index = text.indexOf(keyword, index);
    if (index === -1) break;
    count += 1;
    index += keyword.length;
  }
  return count;
}

function countMentions(names) {
  const unique = Array.from(new Set(names.filter(Boolean)));
  let total = 0;
  unique.forEach(name => {
    Object.entries(analysisSources).forEach(([key, text]) => {
      const weight = mentionWeights[key] ?? 1;
      total += countOccurrences(text, name) * weight;
    });
  });
  return total;
}

function normalizeLogScore(value, maxValue) {
  if (!maxValue || maxValue <= 0) return 0;
  return Math.round((Math.log1p(value) / Math.log1p(maxValue)) * 100);
}

function normalizeLinearScore(value, maxValue) {
  if (!maxValue || maxValue <= 0) return 0;
  return Math.round((value / maxValue) * 100);
}

function scoreToCategory(score) {
  if (score >= 60) return 'main';
  if (score >= 50) return 'core';
  if (score >= 40) return 'supporting';
  if (score >= 30) return 'minor';
  return 'cameo';
}

function parseCharacterFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let title = '';
  const metadata = {};
  const bodyLines = [];

  // 简单解析
  let isMetadata = true;
  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      title = trimmed.replace('# ', '').trim();
      continue;
    }

    if (isMetadata && trimmed.startsWith('- ')) {
      const parts = trimmed.substring(2).split('：');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('：').trim();
        metadata[key] = value;
      } else {
        const partsEn = trimmed.substring(2).split(':');
        if (partsEn.length >= 2) {
          const key = partsEn[0].trim();
          const value = partsEn.slice(1).join(':').trim();
          metadata[key] = value;
        } else {
          bodyLines.push(line);
        }
      }
    } else {
      if (trimmed !== '' && !trimmed.startsWith('- ')) {
        isMetadata = false;
      }
      bodyLines.push(line);
    }
  }

  const id = path.basename(filePath, '.md');
  const html = md.render(bodyLines.join('\n'));
  const displayName = extractTitleName(title || id);
  const relativePath = path.relative(sourceDir, filePath);
  const categoryKey = relativePath.split(path.sep)[0] || 'supporting';

  const aliases = [
    ...splitAliases(metadata['别称/化名']),
    ...splitAliases(metadata['别称/身份'])
  ];

  return {
    id,
    title,
    metadata,
    content: html,
    displayName,
    aliases,
    categoryKey
  };
}

function scanDir(dir, entries) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, entries);
      return;
    }
    if (!file.endsWith('.md')) return;
    if (file === 'index.md' || file === 'README.md') return;
    entries.push(parseCharacterFile(fullPath));
  });
}

function normalizeEntity(raw, aliasMap, knownNames) {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const main = trimmed.split('（')[0].trim();
  if (aliasMap.has(main)) return aliasMap.get(main);
  if (knownNames.has(main)) return main;
  const parenMatch = trimmed.match(/（(.*?)）/);
  if (parenMatch) {
    const candidates = parenMatch[1].split(/[、/，；]/).map(item => item.trim()).filter(Boolean);
    const hit = candidates.find(candidate => aliasMap.has(candidate) || knownNames.has(candidate));
    if (hit) return aliasMap.get(hit) || hit;
  }
  return '';
}

function buildAdjacency(relationText, aliasMap, knownNames) {
  const adjacency = new Map();
  knownNames.forEach(name => adjacency.set(name, new Set()));

  const lines = relationText.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) return;

    const text = trimmed.substring(2);
    const segments = text.split('；').map(s => s.trim()).filter(Boolean);

    segments.forEach(segment => {
      let source = '';
      let relation = '';
      let targets = [];

      const dashMatch = segment.match(/^(.*?)—(.*?)—(.*)$/);
      if (dashMatch) {
        source = dashMatch[1].trim();
        relation = dashMatch[2].trim();
        const rawTarget = dashMatch[3].trim();
        const targetClean = rawTarget.replace(/（.*?）$/g, '').trim();
        targets = targetClean.split(/[、/]/).map(t => t.trim()).filter(t => t && t !== '等');
      } else if (segment.includes('↔')) {
        const parts = segment.split('↔');
        source = parts[0].trim();
        const rawTarget = parts[1].trim();
        const targetClean = rawTarget.replace(/（.*?）$/g, '').trim();
        targets = targetClean.split(/[、/]/).map(t => t.trim()).filter(Boolean);
        relation = '关联';
      } else if (segment.includes('→')) {
        const parts = segment.split('→');
        source = parts[0].trim();
        const rawTarget = parts[1].trim();
        const targetClean = rawTarget.replace(/（.*?）$/g, '').trim();
        targets = targetClean.split(/[、/]/).map(t => t.trim()).filter(Boolean);
        relation = '指向';
      }

      if (!source || targets.length === 0) return;

      const sourceName = normalizeEntity(source, aliasMap, knownNames);
      if (!sourceName) return;

      targets.forEach(target => {
        const targetName = normalizeEntity(target, aliasMap, knownNames);
        if (!targetName || targetName === sourceName) return;
        adjacency.get(sourceName).add(targetName);
        adjacency.get(targetName).add(sourceName);
      });
    });
  });

  return adjacency;
}

function computePageRank(names, adjacency, damping = 0.85, iterations = 30) {
  const list = Array.from(names);
  const count = list.length;
  const base = (1 - damping) / count;
  let pr = new Map();
  list.forEach(name => pr.set(name, 1 / count));

  for (let i = 0; i < iterations; i += 1) {
    const next = new Map();
    let sinkSum = 0;
    list.forEach(name => {
      const degree = adjacency.get(name)?.size || 0;
      if (degree === 0) sinkSum += pr.get(name);
    });

    list.forEach(name => {
      next.set(name, base + damping * (sinkSum / count));
    });

    list.forEach(name => {
      const neighbors = adjacency.get(name) || new Set();
      const degree = neighbors.size;
      if (degree === 0) return;
      const share = (damping * pr.get(name)) / degree;
      neighbors.forEach(neighbor => {
        next.set(neighbor, next.get(neighbor) + share);
      });
    });

    pr = next;
  }

  return pr;
}

console.log('开始生成人物数据...');

const characterEntries = [];
scanDir(sourceDir, characterEntries);

const aliasMap = new Map();
const knownNames = new Set();

characterEntries.forEach(entry => {
  const canonical = entry.displayName;
  knownNames.add(canonical);
  aliasMap.set(canonical, canonical);
  entry.aliases.forEach(alias => {
    if (!alias) return;
    aliasMap.set(alias, canonical);
  });
});

const mentionCounts = new Map();
let maxMentions = 0;
characterEntries.forEach(entry => {
  const names = [entry.displayName, ...entry.aliases];
  const count = countMentions(names);
  mentionCounts.set(entry.id, count);
  if (count > maxMentions) maxMentions = count;
});

const relationText = readFileSafe(relationFile);
const adjacency = buildAdjacency(relationText, aliasMap, knownNames);

const degreeMap = new Map();
let maxDegree = 0;
knownNames.forEach(name => {
  const degree = adjacency.get(name)?.size || 0;
  degreeMap.set(name, degree);
  if (degree > maxDegree) maxDegree = degree;
});

const pageRankMap = computePageRank(knownNames, adjacency);
let maxPageRank = 0;
pageRankMap.forEach(value => {
  if (value > maxPageRank) maxPageRank = value;
});

const tierLabelMap = {
  main: '主角',
  core: '核心配角',
  supporting: '重要配角',
  minor: '支线角色',
  cameo: '客串角色'
};

characterEntries.forEach(entry => {
  const baseScore = resolveBaseScore(entry.metadata, entry.categoryKey);
  const freqScore = normalizeLogScore(mentionCounts.get(entry.id) || 0, maxMentions);
  const degreeScore = normalizeLinearScore(degreeMap.get(entry.displayName) || 0, maxDegree);
  const prScore = normalizeLinearScore(pageRankMap.get(entry.displayName) || 0, maxPageRank);
  const centralityScore = Math.round(
    degreeScore * centralityWeights.degree + prScore * centralityWeights.pagerank
  );

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baseScore * weightConfig.rule +
          freqScore * weightConfig.frequency +
          centralityScore * weightConfig.centrality
      )
    )
  );

  const category = scoreToCategory(score);
  entry.metadata['权重值'] = String(score);
  entry.metadata['评分等级'] = tierLabelMap[category] || category;

  const characterData = {
    id: entry.id,
    title: entry.title,
    metadata: entry.metadata,
    score,
    category,
    content: entry.content
  };

  fs.writeFileSync(path.join(outputDir, `${entry.id}.json`), JSON.stringify(characterData, null, 2));

  charactersIndex.push({
    id: entry.id,
    name: entry.title || entry.id,
    path: `/character/${entry.id}`,
    category,
    score,
    brief: entry.metadata['身份/出身'] || entry.metadata['简介'] || ''
  });
});

fs.writeFileSync(indexFile, JSON.stringify(charactersIndex, null, 2));
console.log(`完成！生成了 ${charactersIndex.length} 个人物数据文件。`);
