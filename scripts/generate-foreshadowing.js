import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sources = [
  {
    file: path.resolve(__dirname, '../docs/plot/PLOT_ROADMAP_1-500.md'),
    fallbackRange: '第1-500章'
  },
  {
    file: path.resolve(__dirname, '../docs/plot/PLOT_ROADMAP_501-1000.md'),
    fallbackRange: '第501-1000章'
  },
  {
    file: path.resolve(__dirname, '../docs/plot/PLOT_ROADMAP_1001-1500.md'),
    fallbackRange: '第1001-1500章'
  }
];

const outputFile = path.resolve(__dirname, '../public/data/foreshadowing.json');

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return '';
  }
}

function extractRangeFromHeading(line, fallbackRange) {
  const match = line.match(/（([^）]+)）/);
  if (match && match[1]) return match[1].trim();
  return fallbackRange;
}

function cleanText(text) {
  return text.replace(/\*\*/g, '').replace(/`/g, '').trim();
}

function parseItem(lines, range, sourceFile, index) {
  const evidenceIndex = lines.findIndex((line) => line.includes('证据：'));
  let evidence = '';
  const contentLines = [...lines];

  if (evidenceIndex !== -1) {
    evidence = contentLines[evidenceIndex].replace(/.*证据：/, '').trim();
    contentLines.splice(evidenceIndex, 1);
  }

  let raw = contentLines.join(' ');
  raw = raw.replace(/\s+/g, ' ').trim();
  raw = raw.replace(/^\d+\./, '').replace(/^-\s*/, '').trim();

  let tag = '未标注';
  const tagMatch = raw.match(/【(文本明确|合理推断)】/);
  if (tagMatch) tag = tagMatch[1];

  let title = '';
  let summary = '';
  const boldMatch = raw.match(/\*\*【[^】]+】([^*]+)\*\*/);
  if (boldMatch) {
    title = boldMatch[1].trim();
    summary = raw.replace(/\*\*.*?\*\*[:：]?/, '').trim();
  } else {
    const colonIndex = raw.indexOf('：');
    if (colonIndex !== -1) {
      title = raw.slice(0, colonIndex).trim();
      summary = raw.slice(colonIndex + 1).trim();
    } else {
      title = raw;
      summary = '';
    }
  }

  title = cleanText(title).replace(/【.*?】/g, '').trim();
  summary = cleanText(summary);

  return {
    id: `${range}-${index}`,
    title,
    summary,
    tag,
    status: '追踪中',
    range,
    evidence,
    source: sourceFile
  };
}

function extractSectionItems(text, fallbackRange, sourceFile) {
  const lines = text.split('\n');
  let inSection = false;
  let range = fallbackRange;
  const sectionLines = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && trimmed.includes('隐线与伏笔')) {
      inSection = true;
      range = extractRangeFromHeading(trimmed, fallbackRange);
      return;
    }
    if (inSection && trimmed.startsWith('## ')) {
      inSection = false;
      return;
    }
    if (inSection) {
      sectionLines.push(line);
    }
  });

  const items = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    const idx = items.length + 1;
    items.push(parseItem(current.lines, range, sourceFile, idx));
    current = null;
  };

  sectionLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^\d+\./.test(trimmed) || /^-\s+/.test(trimmed)) {
      pushCurrent();
      current = { lines: [trimmed] };
    } else if (current) {
      current.lines.push(trimmed);
    }
  });

  pushCurrent();
  return { range, items };
}

const allItems = [];
const segments = [];

sources.forEach((source) => {
  const content = readFileSafe(source.file);
  if (!content) return;
  const { range, items } = extractSectionItems(content, source.fallbackRange, path.basename(source.file));
  if (!items.length) return;
  segments.push({ range, source: path.basename(source.file), count: items.length });
  allItems.push(...items);
});

const data = {
  generatedAt: new Date().toISOString(),
  total: allItems.length,
  segments,
  items: allItems
};

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
console.log(`Foreshadowing data generated with ${allItems.length} items.`);
