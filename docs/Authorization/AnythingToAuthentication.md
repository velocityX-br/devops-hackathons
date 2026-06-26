
- SAML 2.0
    - 
- OIDC
- OAUTH
- SSO
- Token
- Cookies
- DEX

Bible!:
https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc 

OATH2.0 flow/authorization code flow (mostly used by web applications)
__Terminologies__:
- Resource Owners: You, owner of identity,data. Permit Perform any action
- Client: "Terrible Pun Of The Day" Access data on behalf of you (resource owner)
- Authorization Server: Application knows the resources own that has an account
- Resource Server: API or service that client want to use on behalf of the owner. Sometime Authorization Server = Resource Server. Sometime not E.g authorization server can be a thirty party server you trust. 
- Redirect URL (callback): authroziation server will redirect resource owners back to you after granting permission to the client. 
- Response Type: type of info that client expect to receive E.g authorization code
- Scope (granular): access to data, or perform the actions
- Consent: authorization servers take the scope that client is requesting.
- ClientID (identify client with authorization server): identify the ID with client and authorization server. 
- ClientSecret: secret password only authorization server and client knows. Allow them to securely share information off the scene.
- Authorization Code: short live temporary code that authorization server send back to the client. Client privately send authorization code back to authorizaton server along with clientsecret in exchange for an access token. 
- Access Token: Access token is the key that client will use to communicate to Resources Server. Key card to give client permission to perform action from resources server on your behalf. 

```
(ResourceOwner)
+--------+                                   +-------------------+
|  User  |                                   | Authorization     |
|        |                                   | Server (IdP)      |
+---+----+                                   +---------+---------+
    |                                                  |
    | 1. Login Request                                 |
    |------------------------------------------------->|
    |                                                  |
    | 2. User Authentication                           |
    |<------------------------------------------------>|
    |                                                  |
    | 3. Authorization Code                            |
    |<-------------------------------------------------|
    |
    | Browser Redirect
    v
(PunOfTheDay)
+--------+                                   +-------------------+
| Client |                                   | Authorization     |
|  App   |                                   | Server (IdP)      |
+---+----+                                   +---------+---------+
    |                                                  |
    | 4. Exchange Code for Token                       |
    |------------------------------------------------->|
    |                                                  |
    | 5. Access Token + Refresh Token                  |
    |<-------------------------------------------------|
    |
    |
    v

+--------+                                   +-------------------+
| Client |                                   | Resource Server   |
|  App   |                                   | (API)             |
+---+----+                                   +---------+---------+
    |                                                  |
    | 6. API Request with Access Token                 |
    |------------------------------------------------->|
    |                                                  |
    | 7. Protected Resource                            |
    |<-------------------------------------------------|
```