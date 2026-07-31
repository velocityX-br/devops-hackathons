#!/usr/bin/env node
/**
 * 扫描 docs/blog 等公开内容中的企业 PII 与敏感信息。
 * Usage: node scripts/check-pii.cjs [--json] [--fix]
 *   --json  以 JSON 输出扫描结果（不修改文件）。
 *   --fix   自动脱敏：按规则的 replacement 就地改写文件后再复扫。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const RULES_PATH = path.join(__dirname, 'pii-rules.json');
const ALLOWLIST_PATH = path.join(ROOT, '.pii-allowlist.json');

const args = new Set(process.argv.slice(2));
const outputJson = args.has('--json');
const fixMode = args.has('--fix');

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

function isPlaceholderMatch(text, placeholderPatterns) {
  return placeholderPatterns.some((p) => {
    const re = new RegExp(`^(?:${p})$`, 'i');
    return re.test(text.trim());
  });
}

/** high/critical 永不因同行占位符整行跳过；其余规则可设 applyOnPlaceholderLines。 */
function shouldSkipLineForRule(rule, line, placeholderPatterns) {
  if (rule.applyOnPlaceholderLines) return false;
  if (rule.severity === 'high' || rule.severity === 'critical') return false;
  return isPlaceholderLine(line, placeholderPatterns);
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
      if (shouldSkipLineForRule(rule, line, config.placeholderPatterns)) {
        continue;
      }

      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(line)) !== null) {
        const matchedText = match[0];
        // 命中本身已是占位符（如 <USER_ID>）则跳过，避免假阳性
        if (isPlaceholderMatch(matchedText, config.placeholderPatterns)) {
          continue;
        }
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

/**
 * 就地脱敏单个文件。逐行应用规则的 replacement：
 *  - 普通规则：直接把 pattern 命中替换为 replacement。
 *  - 含 captureRewrite 的规则（如 json-credential）：用 captureRewrite 匹配，
 *    保留捕获组（键名），仅替换值。
 * 尊重 allowlist（豁免项不改写）与 placeholderPatterns（占位行不改写）。
 * 返回本文件发生的替换记录（用于汇总与 critical 警告）。
 */
function fixFile(filePath, config, allowlist) {
  const original = fs.readFileSync(filePath, 'utf8');
  const rel = normalizeRel(filePath);
  const lines = original.split('\n');
  const changes = [];

  for (let i = 0; i < lines.length; i++) {
    for (const rule of config.rules) {
      if (!rule.replacement) continue;
      if (shouldSkipLineForRule(rule, lines[i], config.placeholderPatterns)) {
        continue;
      }

      // 先用检测 pattern 判断该行是否命中且未被豁免
      const detectRegex = new RegExp(rule.pattern, rule.flags || 'gi');
      detectRegex.lastIndex = 0;
      const m = detectRegex.exec(lines[i]);
      if (!m) continue;
      if (isPlaceholderMatch(m[0], config.placeholderPatterns)) continue;

      const id = findingId(rel, i + 1, rule.id, m[0]);
      const allowed = allowlist.entries?.some(
        (e) =>
          e.id === id ||
          (e.file === rel && e.ruleId === rule.id && e.line === i + 1)
      );
      if (allowed) continue;

      // 实际改写：captureRewrite 优先（保留键名），否则整体替换
      const rewriteRegex = new RegExp(
        rule.captureRewrite || rule.pattern,
        rule.flags || 'gi'
      );
      const before = lines[i];
      lines[i] = before.replace(rewriteRegex, rule.replacement);

      if (lines[i] !== before) {
        changes.push({
          file: rel,
          line: i + 1,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
        });
      }
    }
  }

  const updated = lines.join('\n');
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
  return changes;
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

  if (fixMode) {
    const changes = files.flatMap((f) => fixFile(f, config, allowlist));

    if (changes.length === 0) {
      console.log(`✓ 未发现可自动脱敏的内容（扫描 ${files.length} 个文件）`);
    } else {
      const bySeverity = {critical: 0, high: 0, medium: 0, low: 0};
      for (const c of changes) bySeverity[c.severity] = (bySeverity[c.severity] || 0) + 1;

      console.log(`\n✓ 已自动脱敏 ${changes.length} 处（扫描 ${files.length} 个文件）：`);
      console.log(
        `  critical=${bySeverity.critical || 0}` +
          ` high=${bySeverity.high || 0}` +
          ` medium=${bySeverity.medium || 0}\n`
      );
      for (const c of changes) {
        console.log(`  [${c.severity.toUpperCase()}] ${c.ruleName} — ${c.file}:${c.line}`);
      }

      const criticalChanges = changes.filter((c) => c.severity === 'critical');
      if (criticalChanges.length > 0) {
        console.log('');
        console.log('\x1b[31m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
        console.log('\x1b[31m║  ⚠ 已写入占位符，但脱敏 ≠ 安全！                              ║\x1b[0m');
        console.log('\x1b[31m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
        console.log(
          `  上述 ${criticalChanges.length} 处为 CRITICAL 级密钥（token/私钥/AWS Key 等）。`
        );
        console.log('  文件已改写，但真实凭证可能已进入 git 历史或曾经泄露。');
        console.log('  \x1b[31m必须立即轮换（rotate）对应密钥，仅改文档不足以止损。\x1b[0m');
      }
      console.log('\n请人工复核改动后提交，并重新运行: yarn check:pii');
    }

    // 复扫确认结果
    const remaining = files.flatMap((f) => scanFile(f, config, allowlist));
    if (remaining.length > 0) {
      console.error(`\n仍有 ${remaining.length} 处无法自动脱敏，需人工处理：`);
      console.error(formatReport(remaining));
      process.exit(1);
    }
    process.exit(0);
  }

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
