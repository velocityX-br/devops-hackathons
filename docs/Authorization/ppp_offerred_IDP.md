

  PPP uses two distinct identity providers depending on whether the application is internal or external:

```
  ┌───────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────┬─────────────────┐
  │                    IdP                    │                              Used For                               │    Protocol     │
  ├───────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼─────────────────┤
  │ Microsoft Entra ID (Azure AD)             │ All PPP-internal applications (Jira, ServiceNow, etc.)              │ SAML 2.0 / OIDC │ SSO, IDP ?
  ├───────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────┼─────────────────┤
  │ PPP IAS (Identity Authentication Service) │ Customer-facing PPP cloud apps (Concur, Ariba, SuccessFactors, BTP) │ SAML 2.0 / OIDC │
  └───────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────┴─────────────────┘

Per IES Security Guidelines: All internal applications must use Azure AD as IdP. Only hybrid/external/BTP applications continue using PPP IDS/IAS.
```

Key references:
https://wiki.one.int.pppdemands.com/wiki/spaces/idservice/pages/1626014896/How+to+Request+a+Tenant+of+Identity+Authentication+Service 
https://wiki.one.int.pppdemands.com/wiki/spaces/S4HANAEPPM/pages/3775359511/IAS+SCI+tenant+setup

PPP Cloud Identity Services: PPP Cloud Identity Services are a group of services, designed to enable identity and access management across systems. They aim to provide a seamless single sign-on experience for users in the cloud while ensuring that system and data access are secure.
https://help.pppdemands.com/docs/cloud-identity-services/cloud-identity-services/what-is-identity-authentication