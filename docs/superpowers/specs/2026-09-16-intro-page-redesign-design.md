# About Page Redesign — Design Spec

**Date:** 2026-09-16  
**Target:** `docs/intro.md`  
**Status:** Approved direction (Approach 3 — hybrid); awaiting user review of this spec

## Goal

Rewrite the site About page so professional positioning is immediately clear: certifications, core skill areas, customer technical relationship work, and industry tenure — while keeping a short human narrative and a minimal knowledge shortcut table.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Scope | Career-first full rewrite of `docs/intro.md` only |
| Tone | Hybrid: 2–3 sentence narrative opening + scannable sections |
| Knowledge index | Keep minimal 4-row table: DNS, Kubernetes, Linux, Gardener |
| Language | English (matches existing site) |
| Out of scope | Homepage (`src/pages/index.tsx`), blog welcome post, `authors.yml`, i18n copies |

## Page structure

1. **Title / hero** — `# Bryan Chen` + one-line positioning tagline  
2. **Opening narrative** — 2–3 sentences (role, hybrid infra focus, customer/industry context)  
3. **Certifications** — CKA, ITIL 4, CET-6 (enriched wording; allow “and related credentials” only if we keep “etc.” spirit without inventing named certs)  
4. **Core strengths** — Solution architecture; cloud-native / Kubernetes (including traditional VM → Kubernetes migration); OS administration (SLES, RHEL, CentOS); configuration management & IaC (Ansible, Chef, Terraform)  
5. **Customer engagement** — Enrich CTRM as technical customer relationship / support for complex cloud environments and applications (do not invent employer names)  
6. **Industry experience** — ~4 years PPP; ~2 years banking systems  
7. **Knowledge shortcuts** — four-row table with existing deep links  
8. **Contact / follow** — GitHub + this repo only  

### Remove

- Large “Who I am” metadata table (location path can be omitted or one short phrase in narrative if space allows — prefer omit to keep career-first)  
- Long multi-area Knowledge index (OpenStack, AI, AuthZ, Speaking, etc.)  
- “Latest writing” section (blog remains reachable from nav / homepage CTA)  
- Hobby paragraph (basketball, hiking, etc.) — career-first page; not required by requirements  

### Preserve / reuse links

| Area | Primary link(s) |
|------|-----------------|
| DNS | `/docs/Solution_Architect/DNS/DNS_K8S_Solution` · `/docs/DNS/Bind_K8S_design` |
| Kubernetes | `/docs/Kubernetes/kubernetes_cheatsheet` |
| Linux | `/docs/Linux/unix_cheatsheet` or `/docs/Linux/Linux_boot_procedure` |
| Gardener | `/docs/Gardener/Gardener_DNS` |
| GitHub | `https://github.com/velocityX-br` |
| Repo | `https://github.com/velocityX-br/devops-hackathons` |

Implementation may pick one strong link per row (plus optional secondary) to keep the table compact.

## Content guidelines

- Enrich and polish; do not copy user wording verbatim.  
- Do not invent employers, job titles, extra certifications, or metrics not provided.  
- Prefer concrete capability language over buzzword stacks.  
- Frontmatter: update `description` to reflect certifications + architecture / cloud-native focus.  
- Keep Markdown simple (headings, short lists/tables); no new React components.

## Draft copy (implementation baseline)

Editors may lightly refine voice, but meaning must stay within this envelope:

```markdown
# Bryan Chen

**Solution architect · Cloud-Native & platform engineer**

I design and operate hybrid infrastructure — connecting traditional VM estates with Kubernetes platforms that hold up in production. Much of my work sits at the intersection of solution architecture and customer technical engagement: helping teams run complex cloud environments and applications with clarity and reliability.

## Certifications

- **CKA** (Certified Kubernetes Administrator)
- **ITIL 4**
- **CET-6** (College English Test — Band 6)

## Core strengths

- **Solution architecture** — end-to-end platform and migration designs that balance operability, risk, and delivery
- **Cloud-native / Kubernetes** — cluster platforms and migrations of traditional VM-based applications onto Kubernetes
- **OS administration & operations** — SLES, RHEL, CentOS
- **Configuration management & IaC** — Ansible, Chef, Terraform

## Customer technical engagement

Hands-on **Customer Technical Relationship Management (CTRM)** style support: partnering with customers on complex cloud landscapes, clarifying architecture trade-offs, and keeping production applications healthy under real operational pressure.

## Industry experience

- **~4 years** in PPP-related environments
- **~2 years** supporting banking systems

## Knowledge shortcuts

| Area | Start here |
|------|------------|
| **DNS / BIND** | [HA DNS on Kubernetes](/docs/Solution_Architect/DNS/DNS_K8S_Solution) · [Bind K8s design](/docs/DNS/Bind_K8S_design) |
| **Kubernetes** | [Cheatsheet](/docs/Kubernetes/kubernetes_cheatsheet) |
| **Linux** | [Unix cheatsheet](/docs/Linux/unix_cheatsheet) · [Boot procedure](/docs/Linux/Linux_boot_procedure) |
| **Gardener** | [Gardener DNS](/docs/Gardener/Gardener_DNS) |

## Contact / follow

- GitHub: [github.com/velocityX-br](https://github.com/velocityX-br)
- This repo: [velocityX-br/devops-hackathons](https://github.com/velocityX-br/devops-hackathons)
```

## Success criteria

- A first-time visitor can answer in under 30 seconds: certifications, strongest skill areas, CTRM-style role, PPP/banking tenure.  
- Page remains a single Markdown file; `helm`-style or site build unchanged beyond content.  
- Knowledge shortcuts still provide a useful on-ramp without dominating the page.

## Implementation notes

- Single-file content change; no dependency bumps.  
- Optional follow-up (not in this spec): mirror key bullets on homepage subtitle / feature card — only if requested later.  
- Do not commit unless the user explicitly asks (repo preference).
