#!/usr/bin/env node
/**
 * 扫描 docs/blog 等公开内容中的企业 PII 与敏感信息。
 * Usage: node scripts/check-pii.cjs [--fix-hint] [--json]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const RULES_PATH = path.join(__dirname, 'pii-rules.json');
const ALLOWLIST_PATH = path.join(ROOT, '.pii-allowlist.json');

const args = new Set(process.argv.slice(2));
const outputJson = args.has('--json');

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeRel(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function shouldIgnore(relPath, ignorePaths) {
  return ignorePaths.some((pattern) => {
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
      );
      return regex.test(relPath);
    }
    return relPath === pattern || relPath.startsWith(pattern + '/');
  });
}

function walkDir(dir, extensions, ignorePaths, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    const rel = normalizeRel(full);
    if (shouldIgnore(rel, ignorePaths)) continue;
    if (entry.isDirectory()) {
      walkDir(full, extensions, ignorePaths, files);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function isPlaceholderLine(line, placeholderPatterns) {
  return placeholderPatterns.some((p) => new RegExp(p, 'i').test(line));
}

function maskMatch(text) {
  if (text.length <= 8) return '***';
  return text.slice(0, 4) + '…' + text.slice(-4);
}

function findingId(file, line, ruleId, match) {
  return crypto
    .createHash('sha256')
    .update(`${file}:${line}:${ruleId}:${match}`)
    .digest('hex')
    .slice(0, 16);
}

function scanFile(filePath, config, allowlist) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = normalizeRel(filePath);
  const lines = content.split('\n');
  const findings = [];

  for (const rule of config.rules) {
    const regex = new RegExp(rule.pattern, rule.flags || 'gi');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isPlaceholderLine(line, config.placeholderPatterns)) continue;

      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(line)) !== null) {
        const matchedText = match[0];
        const id = findingId(rel, i + 1, rule.id, matchedText);
        const allowed = allowlist.entries?.some(
          (e) =>
            e.id === id ||
            (e.file === rel && e.ruleId === rule.id && e.line === i + 1)
        );
        if (allowed) continue;

        findings.push({
          id,
          file: rel,
          line: i + 1,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          description: rule.description,
          hint: rule.hint,
          match: maskMatch(matchedText),
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  }
  return findings;
}

function formatReport(findings) {
  const bySeverity = {critical: 0, high: 0, medium: 0, low: 0};
  for (const f of findings) bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;

  const lines = [
    '',
    '╔══════════════════════════════════════════════════════════════╗',
    '║  PII / 敏感信息检查失败 — 以下内容不可公开发布到网站          ║',
    '╚══════════════════════════════════════════════════════════════╝',
    '',
    `共发现 ${findings.length} 处问题：` +
      ` critical=${bySeverity.critical || 0}` +
      ` high=${bySeverity.high || 0}` +
      ` medium=${bySeverity.medium || 0}`,
    '',
  ];

  const sorted = [...findings].sort((a, b) => {
    const order = {critical: 0, high: 1, medium: 2, low: 3};
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
  });

  for (const f of sorted) {
    lines.push(`[${f.severity.toUpperCase()}] ${f.ruleName} (${f.ruleId})`);
    lines.push(`  ${f.file}:${f.line}`);
    lines.push(`  匹配: ${f.match}`);
    lines.push(`  片段: ${f.snippet}`);
    lines.push(`  修复: ${f.hint}`);
    lines.push(`  临时豁免 ID: ${f.id}`);
    lines.push('');
  }

  lines.push('修复后重新运行: yarn check:pii');
  lines.push('仅在确认误报时，将条目加入 .pii-allowlist.json（需 code review）');
  lines.push('');
  return lines.join('\n');
}

function main() {
  const config = loadJson(RULES_PATH, null);
  if (!config) {
    console.error('Missing rules file:', RULES_PATH);
    process.exit(2);
  }

  const allowlist = loadJson(ALLOWLIST_PATH, {entries: []});
  const files = config.scanPaths.flatMap((p) =>
    walkDir(path.join(ROOT, p), config.scanExtensions, config.ignorePaths)
  );

  const findings = files.flatMap((f) => scanFile(f, config, allowlist));

  if (outputJson) {
    console.log(JSON.stringify({ok: findings.length === 0, findings}, null, 2));
    process.exit(findings.length === 0 ? 0 : 1);
  }

  if (findings.length === 0) {
    console.log(`✓ PII 检查通过（扫描 ${files.length} 个文件）`);
    process.exit(0);
  }

  console.error(formatReport(findings));
  process.exit(1);
}

main();
