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

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const charactersIndex = [];

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
    
    // 生成单个数据文件
    const characterData = {
        id,
        title,
        metadata,
        content: html
    };

    fs.writeFileSync(path.join(outputDir, `${id}.json`), JSON.stringify(characterData, null, 2));

    // 添加到索引
    charactersIndex.push({
        id,
        name: title || id,
        path: `/character/${id}`,
        category: relativePath.split('/')[0], // main, core, etc.
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
