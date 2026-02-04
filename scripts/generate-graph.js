import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.resolve(__dirname, '../docs/CHARACTER_RELATIONS.md');
const outputFile = path.resolve(__dirname, '../public/data/graph.json');
const indexFile = path.resolve(__dirname, '../public/data/characters_list.json');

const tierOrder = ['主角', '核心配角', '重要配角', '支线角色', '客串角色', '其他'];
const tierMap = {
  main: '主角',
  core: '核心配角',
  supporting: '重要配角',
  minor: '支线角色',
  cameo: '客串角色'
};

function extractTitleName(text) {
  const title = text.replace(/^#\s*/, '').trim();
  const name = title.split('（')[0].split('(')[0].trim();
  return name;
}

function loadCharacterIndex() {
  if (!fs.existsSync(indexFile)) return new Map();
  try {
    const data = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
    const map = new Map();
    data.forEach(item => {
      const name = extractTitleName(item.name || item.id);
      map.set(name, {
        slug: item.id,
        category: item.category,
        score: typeof item.score === 'number' ? item.score : Number(item.score || 0)
      });
    });
    return map;
  } catch (error) {
    return new Map();
  }
}

function parse() {
  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.split('\n');

  const nodes = new Map();
  const links = [];

  // 构建 角色名 -> {slug,tier} 的映射表
  const characterMap = new Map();
  const knownNames = new Set();
  const aliasMap = new Map();

  function extractAliases(raw) {
    const clean = raw.replace(/（.*?）/g, '').trim();
    return clean.split(/[、\/，；]/).map(t => t.trim()).filter(Boolean);
  }

  function scanDir(dir, tierKey) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, tierKey);
        return;
      }
      if (!file.endsWith('.md')) return;
      const slug = file.replace('.md', '');
      const content = fs.readFileSync(fullPath, 'utf-8');
      const firstLine = content.split('\n').find(line => line.startsWith('# '));
      if (!firstLine) return;
      const name = extractTitleName(firstLine);
      const tier = tierMap[tierKey] || '其他';
      characterMap.set(name, { slug, tier });
      knownNames.add(name);
      aliasMap.set(name, name);

      const aliasLine = content.split('\n').find(line => line.trim().startsWith('- 别称/身份：') || line.trim().startsWith('- 别称/化名：'));
      if (aliasLine) {
        const raw = aliasLine.split('：').slice(1).join('：').trim();
        extractAliases(raw).forEach(alias => {
          if (!alias) return;
          aliasMap.set(alias, name);
          if (!knownNames.has(alias)) {
            characterMap.set(alias, { slug, tier });
            knownNames.add(alias);
          }
        });
      }
    });
  }

  const characterRoot = path.resolve(__dirname, '../docs/characters');
  Object.keys(tierMap).forEach(key => {
    scanDir(path.join(characterRoot, key), key);
  });

  const indexMap = loadCharacterIndex();

  // 预定义分类索引（按重要度）
  const categoriesMap = new Map();
  tierOrder.forEach((name, index) => categoriesMap.set(name, index));

  function getCategoryIndex(name) {
    return categoriesMap.has(name) ? categoriesMap.get(name) : categoriesMap.get('其他');
  }

  function normalizeEntity(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    const main = trimmed.split('（')[0].trim();
    const parenMatch = trimmed.match(/（(.*?)）/);
    if (aliasMap.has(main)) return aliasMap.get(main);
    if (parenMatch) {
      const candidates = parenMatch[1].split(/[、\/，；]/).map(t => t.trim()).filter(Boolean);
      const hit = candidates.find(c => aliasMap.has(c));
      if (hit) return aliasMap.get(hit);
    }
    return main;
  }

  function resolveMeta(name) {
    const indexMeta = indexMap.get(name);
    const docMeta = characterMap.get(name);
    if (indexMeta) {
      const tier = tierMap[indexMeta.category] || docMeta?.tier || '其他';
      return {
        slug: indexMeta.slug || docMeta?.slug,
        tier,
        score: indexMeta.score
      };
    }
    if (docMeta) {
      return {
        slug: docMeta.slug,
        tier: docMeta.tier,
        score: 0
      };
    }
    return { slug: null, tier: '其他', score: 0 };
  }

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('## ')) {
      return;
    }

    if (!line.startsWith('- ')) return;

    let source, target, relation;

    const text = line.substring(2);

    const segments = text.split('；').map(s => s.trim()).filter(Boolean);
    segments.forEach(segment => {
      let targets = [];
      source = '';
      relation = '';

      const dashMatch = segment.match(/^(.*?)—(.*?)—(.*)$/);
      if (dashMatch) {
        source = dashMatch[1].trim();
        relation = dashMatch[2].trim();
        const rawTarget = dashMatch[3].trim();
        const targetClean = rawTarget.replace(/（.*?）$/g, '').trim();
        targets = targetClean.split(/[、\/]/).map(t => t.trim()).filter(t => t && t !== '等');
      } else if (segment.includes('↔')) {
        const parts = segment.split('↔');
        source = parts[0].trim();
        const rawTarget = parts[1].trim();
        const targetClean = rawTarget.replace(/（.*?）$/g, '').trim();
        targets = targetClean.split(/[、\/]/).map(t => t.trim());
        relation = '关联';
      } else if (segment.includes('→')) {
        const parts = segment.split('→');
        source = parts[0].trim();
        const rawTarget = parts[1].trim();
        const targetClean = rawTarget.replace(/（.*?）$/g, '').trim();
        targets = targetClean.split(/[、\/]/).map(t => t.trim());
        relation = '指向';
      }

      if (!source || targets.length === 0) return;

      const sourceName = normalizeEntity(source);
      if (!sourceName) return;

      if (!nodes.has(sourceName)) {
        const meta = resolveMeta(sourceName);
        nodes.set(sourceName, {
          id: sourceName,
          name: sourceName,
          category: getCategoryIndex(meta.tier),
          value: 1,
          url: meta.slug ? `/character/${meta.slug}` : null,
          tier: meta.tier,
          score: meta.score
        });
      } else {
        nodes.get(sourceName).value++;
      }

      targets.forEach(target => {
        const targetName = normalizeEntity(target);
        if (!targetName) return;

        if (!nodes.has(targetName)) {
          const meta = resolveMeta(targetName);
          nodes.set(targetName, {
            id: targetName,
            name: targetName,
            category: getCategoryIndex(meta.tier),
            value: 1,
            url: meta.slug ? `/character/${meta.slug}` : null,
            tier: meta.tier,
            score: meta.score
          });
        } else {
          nodes.get(targetName).value++;
        }

        links.push({
          source: sourceName,
          target: targetName,
          relation: relation || '相关',
          value: relation || '相关'
        });
      });
    });
  });

  const nodesArray = Array.from(nodes.values()).map(n => {
    const score = Number.isFinite(n.score) ? n.score : 0;
    const size = score > 0 ? Math.max(18, Math.min(80, Math.round(16 + score * 0.64))) : Math.min(80, 10 + Math.sqrt(n.value) * 8);
    return {
      ...n,
      symbolSize: size
    };
  });

  const categoriesArray = tierOrder.map(name => ({ name }));

  const data = {
    nodes: nodesArray,
    links: links,
    categories: categoriesArray
  };

  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`Graph data generated with ${nodesArray.length} nodes and ${links.length} links.`);
}

parse();
