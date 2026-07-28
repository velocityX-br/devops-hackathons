#!/usr/bin/env node
/**
 * 在 commit / CI 前检查 docs/blog 等内容是否会导致 Docusaurus MDX 构建失败。
 *
 * 两层检测：
 * 1. @mdx-js/mdx 编译 — 捕获未闭合 JSX 标签（如裸露的 <region>）
 * 2. 静态扫描 — 捕获未正确包在 code 中的 {ident} 表达式
 *    （编译能通过，但 SSG 渲染时会 ReferenceError: ident is not defined）
 *
 * Usage: node scripts/check-mdx-jsx.cjs
 */
const fs = require('fs');
const path = require('path');
const {compile} = require('@mdx-js/mdx');

const ROOT = path.join(__dirname, '..');
const SCAN_PATHS = ['blog', 'docs', 'i18n'];
const EXTENSIONS = ['.md', '.mdx'];

/** 文档中允许出现的 MDX 表达式（如官方 tutorial 的 {children}） */
const ALLOWED_EXPR = new Set(['children']);

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
      // Docusaurus 忽略 _ 前缀的 partial / 模板文件
      if (entry.name.startsWith('_')) continue;
      files.push(full);
    }
  }
  return files;
}

async function checkCompile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath).split(path.sep).join('/');
  try {
    await compile(source, {format: 'mdx'});
    return null;
  } catch (err) {
    const message = (err && err.message) || String(err);
    return {file: rel, kind: 'compile', message: message.split('\n')[0]};
  }
}

/**
 * 去掉 fenced / 成对 inline code 后，残留的 {ident} 会在 MDX 里变成 JS 表达式，
 * 编译通过但 SSG 时报 ReferenceError（正是 SCI_Barbican 的失败模式）。
 */
function checkExprLeak(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath).split(path.sep).join('/');
  const lines = raw.split('\n');
  const issues = [];
  let inFence = false;

  const exprRe = /(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_]*)\}(?!\})/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // 去掉成对的行内 `...`，未闭合的反引号内容会留下来被扫描
    const stripped = line.replace(/`[^`\n]*`/g, '');
    let m;
    exprRe.lastIndex = 0;
    while ((m = exprRe.exec(stripped)) !== null) {
      const name = m[1];
      if (ALLOWED_EXPR.has(name)) continue;
      issues.push({
        file: rel,
        kind: 'expr',
        message: `MDX 表达式 {${name}} 未包在闭合的反引号内（SSG 会报 ReferenceError: ${name} is not defined）`,
        line: i + 1,
        snippet: line.trim().slice(0, 120),
      });
    }
  }
  return issues;
}

async function main() {
  const files = SCAN_PATHS.flatMap((p) => walk(path.join(ROOT, p)));
  const compileResults = await Promise.all(files.map(checkCompile));
  const compileIssues = compileResults.filter(Boolean);
  const exprIssues = files.flatMap(checkExprLeak);
  const issues = [...compileIssues, ...exprIssues];

  if (issues.length === 0) {
    console.log(`✓ MDX 检查通过（扫描 ${files.length} 个文件；编译 + {expr} 泄漏）`);
    process.exit(0);
  }

  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  MDX 检查失败 — 会导致 Docusaurus 构建 / SSG 失败            ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('');
  console.error(`共发现 ${issues.length} 处问题：`);
  console.error('');
  for (const issue of issues) {
    console.error(`  ${issue.file}${issue.line ? ':' + issue.line : ''}`);
    console.error(`  ${issue.message}`);
    if (issue.snippet) console.error(`  片段: ${issue.snippet}`);
    console.error(
      '  修复: 使用 `<region>`（尖括号占位）并包在反引号内，如 `plutono.<region>.example.com`；确保反引号成对闭合'
    );
    console.error('');
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
