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

const analysisSources = {
  plot_1_500: readFileSafe(path.resolve(docsRoot, 'plot/PLOT_ROADMAP_1-500.md')),
  plot_501_1000: readFileSafe(path.resolve(docsRoot, 'plot/PLOT_ROADMAP_501-1000.md')),
  plot_1001_1500: readFileSafe(path.resolve(docsRoot, 'plot/PLOT_ROADMAP_1001-1500.md')),
  worldview: readFileSafe(path.resolve(docsRoot, 'world/WORLDVIEW.md')),
  relations: readFileSafe(path.resolve(docsRoot, 'CHARACTER_RELATIONS.md')),
  factions: readDirMarkdown(path.resolve(docsRoot, 'factions'))
};

const baseScoreMap = {
  main: 90,
  core: 75,
  supporting: 60,
  minor: 45,
  cameo: 25
};

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

function calculateMentionScore(names) {
  const hasName = (text) => names.some(name => name && text.includes(name));
  let score = 0;
  if (hasName(analysisSources.plot_1_500)) score += 6;
  if (hasName(analysisSources.plot_501_1000)) score += 6;
  if (hasName(analysisSources.plot_1001_1500)) score += 6;
  if (hasName(analysisSources.worldview)) score += 4;
  if (hasName(analysisSources.relations)) score += 6;
  if (hasName(analysisSources.factions)) score += 4;
  return score;
}

function scoreToCategory(score) {
  if (score >= 85) return 'main';
  if (score >= 70) return 'core';
  if (score >= 55) return 'supporting';
  if (score >= 40) return 'minor';
  return 'cameo';
}

function parseCharacterFile(filePath, relativePath) {
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
      const parts = trimmed.substring(2).split('：'); // 中文冒号
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('：').trim();
        metadata[key] = value;
      } else {
        // 可能是无冒号的列表项，或者英文冒号
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
        isMetadata = false; // 一旦遇到非列表项，假设元数据区结束
      }
      bodyLines.push(line);
    }
  }

  const id = path.basename(filePath, '.md');
  const html = md.render(bodyLines.join('\n'));
  const displayName = extractTitleName(title || id);
  const categoryKey = relativePath.split('/')[0] || 'supporting';

  const aliases = [
    ...splitAliases(metadata['别称/化名']),
    ...splitAliases(metadata['别称/身份'])
  ];

  const scoreBase = resolveBaseScore(metadata, categoryKey);
  const scoreExtra = calculateMentionScore([displayName, ...aliases]);
  const score = Math.min(100, scoreBase + scoreExtra);
  const category = scoreToCategory(score);

  metadata['重要性评分'] = String(score);
  const tierLabelMap = { main: '主角', core: '核心配角', supporting: '重要配角', minor: '支线角色', cameo: '客串角色' };
  metadata['权重等级'] = tierLabelMap[category] || category;

  // 生成单个数据文件
  const characterData = {
    id,
    title,
    metadata,
    score,
    category,
    content: html
  };

  fs.writeFileSync(path.join(outputDir, `${id}.json`), JSON.stringify(characterData, null, 2));

  // 添加到索引
  charactersIndex.push({
    id,
    name: title || id,
    path: `/character/${id}`,
    category,
    score,
    brief: metadata['身份/出身'] || metadata['简介'] || ''
  });
}

function scanDir(dir, baseRelative) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath, file); // 假设只有两级目录 characters/main
    } else if (file.endsWith('.md') && file !== 'index.md' && file !== 'README.md') {
      parseCharacterFile(fullPath, baseRelative);
    }
  });
}

console.log('开始生成人物数据...');
scanDir(sourceDir, '');
fs.writeFileSync(indexFile, JSON.stringify(charactersIndex, null, 2));
console.log(`完成！生成了 ${charactersIndex.length} 个人物数据文件。`);
