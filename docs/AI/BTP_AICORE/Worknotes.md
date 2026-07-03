

```
⏺ 🎉 Notebook executed successfully end-to-end

  All cells passed. Here's the full trace:

  ┌───────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │       Cell        │                                               Output                                                │
  ├───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ imports           │ ✅ SDK modules loaded                                                                               │
  ├───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ load-creds        │ ✅ Credentials loaded from ~/.aicore/config.json                                                    │
  ├───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ set-env           │ ✅ AI Core client ready (resource group: default)                                                   │
  ├───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ create-config     │ ✅ Configuration created — ID: 13621e00-753f-457c-b6bc-a922eefcabbd, Name: config-new-orchestration │
  ├───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ create-deployment │ ✅ Deployment created — ID: deb74100d0d90a43                                                        │
  ├───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ wait-running      │ ✅ Deployment is ready — Status: RUNNING                                                            │
  └───────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────┘

  New deployment URL

  https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com/v2/inference/deployments/deb74100d0d90a43

  What was set up

  - uv project in /Users/<USER_ID>/Workdir/Github/POC/btp_ai_orchestration/ with sap-ai-sdk-gen, ai-core-sdk, jupyter
  - main.ipynb implementing Step 3 (Python SDK) of the SAP tutorial
  - Scenario: orchestration • Executable: orchestration • Config name: config-new-orchestration

  Note

  Your tenant now has two running orchestration deployments:
  - d1c627bc9d8ad9a7 (the one auto-created at onboarding)
  - deb74100d0d90a43 (the one this notebook just created)

  Since the auto-created one is sufficient for using orchestration in Generative AI Hub, you may want to delete the new one to save compute:

  ai_core_client.deployment.modify(deployment_id="deb74100d0d90a43", target_status="STOPPED")
  # Once stopped:
  ai_core_client.deployment.delete(deployment_id="deb74100d0d90a43")

  Ready to proceed with Step 4 — Consume LLMs through Orchestration whenever you'd like.

✻ Crunched for 2m 49s

⏺ Background command "Execute notebook end-to-end" completed (exit code 0)

⏺ The task has already completed and I've already retrieved and reported the results in my previous response. The notebook executed successfully end-to-end:

  - Configuration created: 13621e00-753f-457c-b6bc-a922eefcabbd (name: config-new-orchestration)
  - Deployment created: deb74100d0d90a43
  - Deployment status: RUNNING
  - Deployment URL: https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com/v2/inference/deployments/deb74100d0d90a43

  No further action needed unless you'd like to proceed to Step 4 (consume LLMs through orchestration) or clean up the newly-created deployment.
```