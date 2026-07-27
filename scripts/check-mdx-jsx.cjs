#!/usr/bin/env node
/**
 * 用 @mdx-js/mdx 编译 docs/blog 等内容，捕获与 Docusaurus 相同的 JSX/标签错误。
 * 典型问题：表格里未闭合的 `code`，导致 <region> 被当成 JSX 标签。
 *
 * Usage: node scripts/check-mdx-jsx.cjs
 */
const fs = require('fs');
const path = require('path');
const {compile} = require('@mdx-js/mdx');

const ROOT = path.join(__dirname, '..');
const SCAN_PATHS = ['blog', 'docs', 'i18n'];
const EXTENSIONS = ['.md', '.mdx'];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'build' || entry.name === '.docusaurus') {
        continue;
      }
      walk(full, files);
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

async function checkFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath).split(path.sep).join('/');
  try {
    // Docusaurus 将 .md / .mdx 均按 MDX 处理
    await compile(source, {format: 'mdx'});
    return null;
  } catch (err) {
    const message = (err && err.message) || String(err);
    const first = message.split('\n')[0];
    return {file: rel, message: first};
  }
}

async function main() {
  const files = SCAN_PATHS.flatMap((p) => walk(path.join(ROOT, p)));
  const results = await Promise.all(files.map(checkFile));
  const issues = results.filter(Boolean);

  if (issues.length === 0) {
    console.log(`✓ MDX 编译检查通过（扫描 ${files.length} 个文件）`);
    process.exit(0);
  }

  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  MDX 编译失败 — 未转义/未闭合的 <tag> 会导致网站构建失败      ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('');
  console.error(`共发现 ${issues.length} 处问题：`);
  console.error('');
  for (const issue of issues) {
    console.error(`  ${issue.file}`);
    console.error(`  ${issue.message}`);
    console.error('  修复: 将 <region> 等占位符包在反引号内，如 `<region>`；检查表格单元格反引号是否闭合');
    console.error('');
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
