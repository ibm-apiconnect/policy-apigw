Copyright 2023 IBM Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# ratelimit-basic

This user defined policy is an example of how a single policy can be used to enforce a variety of pre-configured rate limits using `Rate Limit Definition` objects.

### How It Works

The main artifact for this implementation is the `export.xml` file within the `ratelimit-basic_1.0.0/implementation` directory within the `gateway-extension.zip`.

The `export.xml` file contains the following datapower objects:
```
- Assembly Function
  - Assembly
    - API Rule
      - Switch Assembly Action
        - Rate Limit Assembly Action
          - Rate Limit Definition
```
The Assembly Function represents the policy that can be called from an API Connect Assembly. It contains an Assembly with a rule named `ratelimit-basic_1.0.0` which calls a switch assembly action named `ratelimit-basic_1.0.0-switch`. Within the switch, we get the value of a request header named `plan` and call the specific API Rule associated with it. 

#### Do not confuse the plan that is defined within an API Connect Product with this header name. It is completely unrelated. The header name can be anything you require however since this example uses a type of plan model, we called it `plan`.

```
<Case>
    <Condition>$header("plan")="bronze"</Condition>
    <Execute>ratelimit-basic_1.0.0-bronze-rule</Execute>
</Case>
<Case>
    <Condition>$header("plan")="silver"</Condition>
    <Execute>ratelimit-basic_1.0.0-silver-rule</Execute>
</Case>
<Case>
    <Condition>$header("plan")="gold"</Condition>
    <Execute>ratelimit-basic_1.0.0-gold-rule</Execute>
</Case>
```

#### The JSONata expression within the switch assembly action is just one example of how you could use dynamically change which rate limit definition to call. You could use another JSONata expression that inspects a different context variable that is set by gatewayscript, xslt, etc...

The API Rule maps to a Rate Limit Assembly Action and then a Rate Limit Definition for the plan that is called. The `Rate Limit Definition` is where you configure the actual rate limit.

These are the properties of the gold plan for example:
```
<mAdminState>enabled</mAdminState>
<Type>rate</Type>
<Rate>10</Rate>
<Interval>1</Interval>
<Unit>minute</Unit>
<HardLimit>on</HardLimit>
<IsClient>on</IsClient>
<UseApiName>off</UseApiName>
<UseAppId>off</UseAppId>
<UseClientId>off</UseClientId>
<AutoReplenish>on</AutoReplenish>
<DynamicValue>$(context.message.headers.key)</DynamicValue>
<Weight>1</Weight>
<ResponseHeaders>on</ResponseHeaders>
<EmulateBurstHeaders>off</EmulateBurstHeaders>
<UseIntervalOffset>on</UseIntervalOffset>
<AllowCacheFallback>on</AllowCacheFallback>
<UseCache>off</UseCache>
```
It defines a rate limit of 10 per minute along with some other configuration. You can find more details about Rate Limit Definitions at the [IBM Knowledge Center Documentation](https://www.ibm.com/docs/en/datapower-gateway/10.5.x?topic=gateway-rate-limit-definitions)

The default rate limits in the export.xml file are:

- Bronze: 5/minute
- Silver: 7/minute
- Gold: 10/minute

**It is important to note the `DynamicValue` property of `Rate Limit Definition` objects provided in this policy.** The dynamic value allows the same `Rate Limit Definition` configuration to be applied separately to different resources. In this rate limit definition, the property is set to `$(context.message.headers.key)` to make it easy to demonstrate how a limit can be applied separately to different clients by simply changing a header (for example, in the sample below `-H 'key:client1'` would not share a rate limit with a request containing `-H 'key:client2'`. The context variable used for the dynamic variable can be set in using XSLT or GatewayScript for more complex use cases.

### Importing the user defined policy

#### You can only have one gateway extension in your gateway service so if you have an existing gateway extension, you can add this user defined policy to the extension and manifest.

Once you download the gateway-extension.zip file, you can publish this user defined policy in APIM Cloud Manager by selecting `Configure Topology`, select the three dots on the right side of the API Gateway that you want to upload the policy to and select `Configure gateway extension`. Click the `Add` button to select the gateway-extension.zip file.

This implementation is a Global-scoped user-defined policy however you can modify it to be a Catalog-scoped user-defined policy if you choose. You can get more details from the [IBM Knowledge Center Documentation](https://www.ibm.com/docs/en/api-connect/10.0.x?topic=policies-authoring-datapower-api-gateway)

### Adding the user defined policy in your api

Verify that the `ratelimit-basic` policy is available at the bottom of the API Assembly Policy palette and drag it into your assembly.

### Invoking the api and demonstrating how it works

Call your api using curl or Postman and pass in the request header `plan` with a value of either `bronze`, `silver`, or `gold`. Also, send the request header `key` with a unique value. This is used to identify the user calling the api. Every unique key that is sent has their own separate rate limits. 

For example: if a user is sending a request header of `key: client1` and they have exhausted the rate limit and are getting a 429 response, another user that sends a request header of `key: client2` would see a totally separate rate limit count based on their unique key.

### Example Request and Response
curl -kv https://example.com/myorg/sandbox/apigw/path-1 -H 'plan:bronze' -H 'key:client1'


< HTTP/2 200
< date: Mon, 13 Nov 2023 19:56:28 GMT
< content-type: application/json
< server: gunicorn/19.9.0
< access-control-allow-origin: *
< access-control-allow-credentials: true
< x-global-transaction-id: 196c55656552804f00272d82
< x-ratelimit-limit: name=ratelimit-basic_1.0.0-bronze-rld,5;
< x-ratelimit-remaining: name=ratelimit-basic_1.0.0-bronze-rld,4;

The `x-ratelimit-limit` response header shows the rate limit definition that is being enforced with the limit.
The `x-ratelimit-remaining` response header shows the rate limit definition that is being enforced with the rate limit count value.

After the count goes below 0, you get a 429 response:

{"httpCode":"429","httpMessage":"Too Many Requests","moreInformation":"Assembly Rate Limit exceeded"}

#### This user defined policy allows you to rate limit apis without subscribing to a plan in an application that uses a client id or secret. However you can also use it in addition to apis that are secured by client ids or or secrets.

## Prerequisites

    - IBM Datapower 10.5.0.x or later
