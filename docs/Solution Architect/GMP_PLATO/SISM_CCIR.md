# SISM → CMDB → ServiceNow ITSM Flow Diagram

## End-to-End Data & Routing Flow

```mermaid
flowchart TD
    subgraph PLAT-A_SRC["PLAT-A / TIC (Landscape & Ownership Source)"]
        SPC[SPC / Landscape Object<br/>Run Team, Service attributes]
    end

    subgraph SISM["SISM — Service Master Data"]
        SG[Service Group<br/>e.g. GLDS Production Landscape]
        ST[Service Team<br/>e.g. GLDS SM Linux]
        SO[Service Offering / Component<br/>e.g. GCID-Compute-Guest OS Services]
        AG[Assignment Group<br/>e.g. GCID GLDS PROD SM]
        DL[Distribution List / Owner<br/>e.g. DL 0176000317E IT GLDS]
    end

    subgraph CCIR["CCIR / Integration Layer"]
        SYNC[Scheduled Sync<br/>Master Data + CI Attributes]
    end

    subgraph CMDB["ServiceNow CMDB"]
        CI[Configuration Item<br/>VM / DB / App / Cluster]
        BSVC[Business Service<br/>derived from SISM Service Group]
        SUP[Support Group<br/>derived from SISM Service Team]
        OWN[Owned by / Managed by<br/>derived from SISM DL]
    end

    subgraph SNOW["ServiceNow ITSM"]
        INC[Incident]
        REQ[Service Request]
        CHG[Change]
        PRB[Problem]
    end

    SPC -- "Run Team / Service attrs" --> SG
    SPC -- "Run Team / Service attrs" --> ST
    SPC -- "Run Team / Service attrs" --> SO
    SPC -- "Run Team / Service attrs" --> AG
    SPC -- "Run Team / Service attrs" --> DL

    SG --> SYNC
    ST --> SYNC
    SO --> SYNC
    AG --> SYNC
    DL --> SYNC

    SPC -. "CI inventory<br/>hostname, IP, OS, env" .-> SYNC

    SYNC --> CI
    SYNC --> BSVC
    SYNC --> SUP
    SYNC --> OWN

    CI --> INC
    CI --> REQ
    CI --> CHG
    CI --> PRB

    BSVC --> INC
    SUP --> INC
    AG -. "routing target" .-> INC
    AG -. "routing target" .-> REQ
    AG -. "routing target" .-> CHG

    classDef plat-a fill:#1f4e79,stroke:#0d3050,color:#fff
    classDef sism fill:#5b3a8a,stroke:#3c2360,color:#fff
    classDef ccir fill:#7a5c00,stroke:#4d3a00,color:#fff
    classDef cmdb fill:#2e6b3e,stroke:#1c4226,color:#fff
    classDef snow fill:#8a3a3a,stroke:#5b2424,color:#fff

    class SPC plat-a
    class SG,ST,SO,AG,DL sism
    class SYNC ccir
    class CI,BSVC,SUP,OWN cmdb
    class INC,REQ,CHG,PRB snow
```

---

## Sequence View — Ticket Routing at Runtime

```mermaid
sequenceDiagram
    participant User as End User / Monitoring
    participant SNOW as ServiceNow ITSM
    participant CMDB as ServiceNow CMDB
    participant SISMData as SISM-derived data<br/>(in CMDB)

    User->>SNOW: Create Incident on CI<br/>(e.g. hostname xyz)
    SNOW->>CMDB: Lookup CI by hostname
    CMDB-->>SNOW: CI record + linked attributes
    SNOW->>SISMData: Resolve Service Offering<br/>+ Assignment Group<br/>+ Support Group
    SISMData-->>SNOW: GLDS Production Landscape<br/>GCID GLDS PROD SM<br/>GLDS SM Linux
    SNOW->>SNOW: Route Incident to<br/>Assignment Group "GCID GLDS PROD SM"
    SNOW-->>User: Incident assigned & acknowledged
```

---

## Sync View — Ownership Transfer Propagation

```mermaid
sequenceDiagram
    participant Admin as PLAT-A/TIC Admin
    participant PLAT-A as PLAT-A / TIC
    participant SISM as SISM
    participant CCIR as CCIR / Integration
    participant CMDB as ServiceNow CMDB
    participant ITSM as ServiceNow ITSM

    Admin->>PLAT-A: Change SPC Run Team<br/>(CLM AM → GLDS)
    PLAT-A->>SISM: Update Service Group / Team /<br/>Offering / Assignment Group / DL
    Note over SISM: Master data updated<br/>to GLDS values
    SISM->>CCIR: Scheduled export
    CCIR->>CMDB: Sync Service / Support Group /<br/>Owned-by on linked CIs
    CMDB->>ITSM: New tickets pick up<br/>updated Assignment Group
    Note over ITSM: New Incidents now routed to<br/>"GCID GLDS PROD SM"
```

---

## Layer Responsibilities (Quick Reference)

| Layer | Role | Key Entities |
|---|---|---|
| **PLAT-A / TIC** | Landscape & ownership source | SPC, Run Team, hostnames, IPs |
| **SISM** | Service master data (authoritative for ownership) | Service Group, Service Team, Service Offering, Assignment Group, DL |
| **CCIR / Integration** | Sync conduit | Scheduled jobs, transformations |
| **ServiceNow CMDB** | CI inventory + linked service/ownership | CI, Business Service, Support Group, Owned-by |
| **ServiceNow ITSM** | Operational ticketing | Incident, Request, Change, Problem |

---

If you'd like, I can also produce:
- A **swimlane diagram** showing failure points when SISM and CMDB drift out of sync
- A **C4 container diagram** for architecture documentation
- The same flow rendered specifically for the **CLM AM → GLDS transfer** scenario

Just let me know which format would be most useful.