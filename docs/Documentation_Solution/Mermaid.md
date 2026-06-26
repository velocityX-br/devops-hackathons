
https://mermaid.ai/docs/mermaid-oss/syntax/gantt.html#section-statements

https://mermaid.ai/app/projects/00000000-0000-4000-8000-000000000001/diagrams/00000000-0000-4000-8000-000000000002/version/v0.1/edit 

https://mermaid.ai/docs/mermaid-oss/syntax/gantt.html#gantt-diagrams 
https://mermaid.ai/app/projects/00000000-0000-4000-8000-000000000001/diagrams/00000000-0000-4000-8000-000000000002/version/v0.1/edit 

```mermaid
---
config:
  theme: forest
  themeVariables: {}
---
gantt
    title       SPC Runtime Handover, Cutover & Go-live Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    excludes    weekends
    section Governance
    Weekly GLDS & SNI Forum : active, g1, 2025-02-02, 2025-05-01
    section KT/Handover
    Handover sessions : active, b1, 2025-02-05, 2025-04-15
    section Stateless Migration
    MISC Automation migration (Terraform, Gitlab) : t2, 2025-03-01, 2025-04-01
    Create & Onboard GLDS CAM Profile : t2, 2025-02-12, 2025-03-15
    Ansible codes (GITHUB ORG) migration :  t1, 2025-03-01, 2025-04-01
    section Cutover Activities
    Ansible GLDS Cutover (Successful VM Installation) : crit, c1,  2025-04-01, 2025-05-01
    TU & TTU Access : crit, c2, 2025-04-15, 2025-05-01
    CCIR Change (Asset Owner Change) : crit, c3, 2025-04-15, 2025-05-01
    ServiceNow Alerts : crit, c4, 2025-04-15, 2025-05-01
    SPC System Integration With GLDS SNOW Queue : crit, 5, 2025-04-15, 2025-05-01
    section Go-live & Support
    Go-live (GLDS Offically start to operate SPC Runtime) : milestone, m1, 2025-05-01, 0d
    Shadow support (1 month) : active, s1, after m1, 30d
```