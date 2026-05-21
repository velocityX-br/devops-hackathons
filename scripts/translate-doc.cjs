#!/usr/bin/env node
/**
 * Scaffold or list Chinese (zh-Hans) doc translations for Docusaurus i18n.
 *
 * Usage:
 *   node scripts/translate-doc.cjs scaffold <path-under-docs>
 *   node scripts/translate-doc.cjs status [path-under-docs]
 *
 * Examples:
 *   node scripts/translate-doc.cjs scaffold AI/ClaudeCode_Prompt/001_389d_get389d_cert.md
 *   node scripts/translate-doc.cjs status
 *   node scripts/translate-doc.cjs status AI/
 *
 * English source : docs/<path>
 * Chinese target : i18n/zh-Hans/docusaurus-plugin-content-docs/current/docs/<path>
 *
 * After scaffold, translate prose with Cursor/Claude and keep fenced code blocks unchanged.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const docsRoot = path.join(root, 'docs');
const i18nDocsRoot = path.join(
  root,
  'i18n',
  'zh-Hans',
  'docusaurus-plugin-content-docs',
  'current',
  'docs',
);

const SCAFFOLD_HEADER =
  '<!-- 中文译文占位：请翻译说明文字，代码块保持英文原文 -->\n\n';

function normalizeDocPath(input) {
  let p = input.replace(/^docs\//, '').replace(/^\//, '');
  if (!p) {
    console.error('Missing path. Example: AI/intro.md');
    process.exit(1);
  }
  return p;
}

function sourcePath(rel) {
  return path.join(docsRoot, rel);
}

function targetPath(rel) {
  return path.join(i18nDocsRoot, rel);
}

function listMarkdownFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  const files = [];
  for (const ent of entries) {
    const rel = base ? `${base}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...listMarkdownFiles(full, rel));
    } else if (/\.(md|mdx)$/i.test(ent.name)) {
      files.push(rel);
    }
  }
  return files;
}

function scaffoldOne(rel) {
  const src = sourcePath(rel);
  const dest = targetPath(rel);

  if (!fs.existsSync(src)) {
    console.error(`Source not found: docs/${rel}`);
    return false;
  }

  if (fs.existsSync(dest)) {
    console.log(`[skip] already exists: i18n/.../docs/${rel}`);
    return true;
  }

  fs.mkdirSync(path.dirname(dest), {recursive: true});
  const body = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(dest, SCAFFOLD_HEADER + body, 'utf8');
  console.log(`[scaffold] i18n/.../docs/${rel}`);
  return true;
}

function printStatus(filterPrefix) {
  const all = listMarkdownFiles(docsRoot);
  const filtered = filterPrefix
    ? all.filter((f) => f.startsWith(filterPrefix.replace(/\/$/, '') + '/') || f === filterPrefix)
    : all;

  let translated = 0;
  let missing = 0;

  for (const rel of filtered.sort()) {
    const has = fs.existsSync(targetPath(rel));
    if (has) {
      translated += 1;
      console.log(`  [zh] ${rel}`);
    } else {
      missing += 1;
      console.log(`  [--] ${rel}`);
    }
  }

  console.log('');
  console.log(
    `Total: ${filtered.length} | translated: ${translated} | missing: ${missing}`,
  );
}

const [command, arg] = process.argv.slice(2);

if (!command || !['scaffold', 'status'].includes(command)) {
  console.error('Usage:');
  console.error('  node scripts/translate-doc.cjs scaffold <path-under-docs>');
  console.error('  node scripts/translate-doc.cjs status [prefix]');
  process.exit(1);
}

if (command === 'status') {
  printStatus(arg ? normalizeDocPath(arg) : '');
  process.exit(0);
}

if (command === 'scaffold') {
  if (!arg) {
    console.error('Provide a file or directory under docs/, e.g. AI/ClaudeCode_Prompt/');
    process.exit(1);
  }
  const rel = normalizeDocPath(arg);
  const src = sourcePath(rel);
  if (!fs.existsSync(src)) {
    console.error(`Not found: docs/${rel}`);
    process.exit(1);
  }
  if (fs.statSync(src).isDirectory()) {
    const files = listMarkdownFiles(src, rel);
    let ok = 0;
    for (const f of files) {
      if (scaffoldOne(f)) ok += 1;
    }
    console.log(`\nScaffolded ${ok}/${files.length} file(s). Edit i18n/zh-Hans/... then run yarn build.`);
  } else {
    scaffoldOne(rel);
    console.log('\nEdit the scaffold file, translate prose, keep code blocks in English.');
  }
  process.exit(0);
}
