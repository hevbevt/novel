import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sources = [
  {
    file: path.resolve(__dirname, '../docs/foreshadowing/TRACKER_1-500.md'),
    fallbackRange: '第1-500章'
  },
  {
    file: path.resolve(__dirname, '../docs/foreshadowing/TRACKER_501-1000.md'),
    fallbackRange: '第501-1000章'
  },
  {
    file: path.resolve(__dirname, '../docs/foreshadowing/TRACKER_1001-1500.md'),
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

function buildSlug(range, index) {
  const numbers = range.match(/\d+/g);
  let rangeKey = 'range';
  if (numbers && numbers.length >= 2) {
    rangeKey = `${numbers[0]}-${numbers[1]}`;
  } else if (numbers && numbers.length === 1) {
    rangeKey = numbers[0];
  }
  return `${rangeKey}-${String(index).padStart(2, '0')}`;
}

function parseEvidence(evidenceText) {
  if (!evidenceText) return [];
  let file = '';
  let detail = '';

  const backtickMatch = evidenceText.match(/`([^`]+)`/);
  if (backtickMatch) {
    file = backtickMatch[1].trim();
    detail = evidenceText.slice(backtickMatch.index + backtickMatch[0].length).trim();
  } else {
    file = evidenceText.replace(/`/g, '').trim();
  }

  const parenMatch = detail.match(/[（(](.*)[）)]/);
  if (parenMatch) {
    detail = parenMatch[1].trim();
  }

  if (!detail && !backtickMatch) {
    const cleaned = evidenceText.replace(/`/g, '').trim();
    const altMatch = cleaned.match(/[（(](.*)[）)]/);
    if (altMatch) {
      detail = altMatch[1].trim();
      file = cleaned.slice(0, altMatch.index).trim();
    }
  }

  file = file.replace(/[:：]\s*$/, '').trim();
  detail = detail.replace(/^[:：]\s*/, '').trim();

  const parts = detail
    ? detail.split(/[、，；;。]/).map(part => part.trim()).filter(Boolean)
    : [];

  const items = [];
  if (!parts.length && detail) {
    items.push({ file: file || '原文', text: detail, start: null, end: null, approx: detail.includes('约') });
    return items;
  }

  parts.forEach((part) => {
    const approx = part.includes('约');
    const match = part.match(/第?\s*(\d+)(?:\s*[-—~至]\s*(\d+))?\s*章/);
    const start = match ? Number(match[1]) : null;
    const end = match && match[2] ? Number(match[2]) : start;
    items.push({
      file: file || '原文',
      text: part,
      start,
      end,
      approx
    });
  });

  return items;
}

function buildTimeline(evidenceItems) {
  if (!evidenceItems.length) return [];
  const withChapter = evidenceItems.filter(item => Number.isFinite(item.start));
  const base = (withChapter.length ? withChapter : evidenceItems).map((item) => ({
    label: item.text,
    file: item.file,
    start: item.start,
    end: item.end,
    approx: item.approx
  }));
  return base.sort((a, b) => {
    if (a.start == null && b.start == null) return 0;
    if (a.start == null) return 1;
    if (b.start == null) return -1;
    return a.start - b.start;
  });
}

function parseItem(lines, range, sourceFile, index) {
  const evidenceIndex = lines.findIndex((line) => line.includes('证据：'));
  const statusIndex = lines.findIndex((line) => line.includes('状态：'));
  let evidence = '';
  let status = '追踪中';
  const contentLines = [...lines];

  if (evidenceIndex !== -1) {
    evidence = contentLines[evidenceIndex].replace(/.*证据：/, '').trim();
    contentLines.splice(evidenceIndex, 1);
  }
  if (statusIndex !== -1) {
    let adjustedStatusIndex = statusIndex;
    if (evidenceIndex !== -1 && evidenceIndex < statusIndex) {
      adjustedStatusIndex -= 1;
    }
    status = contentLines[adjustedStatusIndex].replace(/.*状态：/, '').trim() || status;
    contentLines.splice(adjustedStatusIndex, 1);
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

  const evidenceItems = parseEvidence(evidence);
  const timeline = buildTimeline(evidenceItems);

  return {
    id: `${range}-${index}`,
    slug: buildSlug(range, index),
    title,
    summary,
    tag,
    status,
    range,
    evidence,
    evidenceItems,
    timeline,
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
    if (trimmed.startsWith('## ') && (trimmed.includes('伏笔列表') || trimmed.includes('隐线与伏笔'))) {
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
