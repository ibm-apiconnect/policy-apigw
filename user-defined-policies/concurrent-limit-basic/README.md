# License
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

# concurrent-limit-basic

This is the api gateway version of the v5c user defined policy named circuit-breaker-slm-clustered https://github.com/ibm-apiconnect/policy/tree/master/circuit-breaker-slm-clustered

This user defined policy is an example of how a single policy can be used to limit the number of concurrent users for a unique resource using the limit type `count` in a `Rate Limit Definition` object.

### How It Works

The main artifact for this implementation is the `export.xml` file within the `concurrent-limit-basic_1.0.0/implementation` directory within the `gateway-extension.zip`.

The `export.xml` file contains the following datapower objects:
```
- Assembly Function
  - Assembly
    - API Rule
      - Switch Assembly Action
        - Rate Limit Assembly Action
          - Rate Limit Definition
```
The Assembly Function represents the policy that can be called from an API Connect Assembly. 

The policy contains two properties: `limit` and `key`

`limit` represents the number of concurrent requests allowed at one time for a unique resource. The limit value is an enum that is defined in the `concurrent-limit-basic-schema-1.0.0.json` schema which is referenced by the `concurrent-limit-basic-enum_1.0.0` Datapower Schema object.

`key` represents the unique identifier for the resource that you want to limit against. This key is a string that can be whatever value you want.

The Assembly Function contains an Assembly with a rule which calls a switch assembly action named `concurrent-limit-basic_1.0.0-switch`. Within the switch, we get the value from the `limit` enum that was defined in the policy and calls the specific API Rule associated with that value.

```
<Case>
    <Condition>local.parameter.limit="5"</Condition>
    <Execute>concurrent-limit-basic_1.0.0-max-5-rule</Execute>
</Case>
<Case>
    <Condition>local.parameter.limit="7"</Condition>
    <Execute>concurrent-limit-basic_1.0.0-max-7-rule</Execute>
</Case>
<Case>
    <Condition>local.parameter.limit="10"</Condition>
    <Execute>concurrent-limit-basic_1.0.0-max-10-rule</Execute>
</Case>
```

The API Rule maps to a Rate Limit Assembly Action and then a Rate Limit Definition is called. The `Rate Limit Definition` is where you configure the actual count limits.

These are the properties of the max-10 rate limit definition for example:
```
<mAdminState>enabled</mAdminState>
<Type>count</Type>
<Rate>10</Rate>
<HardLimit>on</HardLimit>
<IsClient>on</IsClient>
<UseApiName>off</UseApiName>
<UseAppId>off</UseAppId>
<UseClientId>off</UseClientId>
<AutoReplenish>on</AutoReplenish>
<DynamicValue>$(local.parameter.key)</DynamicValue>
<Weight>1</Weight>
<ResponseHeaders>on</ResponseHeaders>
<EmulateBurstHeaders>off</EmulateBurstHeaders>
<UseIntervalOffset>on</UseIntervalOffset>
<AllowCacheFallback>on</AllowCacheFallback>
<UseCache>off</UseCache>
```
It defines a concurrency limit of 10 connections at one time along with some other configuration. There is no interval or unit for `count` rate limit types even though one if listed in the configuration. You can find more details about Rate Limit Definitions at the [IBM Knowledge Center Documentation](https://www.ibm.com/docs/en/datapower-gateway/10.5.x?topic=gateway-rate-limit-definitions)

The default count limits in the export.xml file are:

- max-5: 5
- max-7: 7
- max-10: 10

**It is important to note the `DynamicValue` property of `Rate Limit Definition` objects provided in this policy.** The dynamic value allows the same `Rate Limit Definition` configuration to be applied separately to different resources. In this rate limit definition, the property is set to `$(local.parameter.key)` which is the string that was entered into the `key` property in your concurrent-limit-basic policy.

### Importing the user defined policy

#### You can only have one gateway extension in your gateway service so if you have an existing gateway extension, you can add this user defined policy to the extension and manifest.

Once you download the gateway-extension.zip file, you can publish this user defined policy in APIM Cloud Manager by selecting `Configure Topology`, select the three dots on the right side of the API Gateway that you want to upload the policy to and select `Configure gateway extension`. Click the `Add` button to select the gateway-extension.zip file.

This implementation is a Global-scoped user-defined policy however you can modify it to be a Catalog-scoped user-defined policy if you choose. You can get more details from the [IBM Knowledge Center Documentation](https://www.ibm.com/docs/en/api-connect/10.0.x?topic=policies-authoring-datapower-api-gateway)

### Adding the user defined policy in your api

Verify that the `concurrent-limit-basic` policy is available at the bottom of the API Assembly Policy palette and drag it into your assembly. Double click the policy and select the `limit` value you want to use along with a string you want to use as your unique identifier for the resource.

### Invoking the api and demonstrating how it works

Call your api using curl or Postman using more concurrent connections than the limit defined. We tested it by opening 6 terminals and curling a backend that it highly latent so that all of the requests were open at the same time. Since we had 5 as the limit, the 6th request was rejected with a 429 response until the other transactions complete.

### Example Request and Response
curl -kv https://example.com/myorg/sandbox/apigw/path-1 


< HTTP/2 429
< content-type: application/json
< user-agent: curl/8.1.2
< accept: */*
< x-global-transaction-id: 196c55656568e74f000f4dc2
< x-countlimit-limit: name=concurrent-limit-basic_1.0.0-max-5-rld,5;
< x-countlimit-remaining: name=concurrent-limit-basic_1.0.0-max-5-rld,0;

The `x-countlimit-limit` response header shows the rate limit definition that is being enforced with the limit.
The `x-countlimit-remaining` response header shows the rate limit definition that is being enforced with the rate limit count value.

After the count goes below 0, you get a 429 response:

{"httpCode":"429","httpMessage":"Too Many Requests","moreInformation":"Assembly Rate Limit exceeded"}

## Prerequisites
    - IBM API Management 10.0.1.0
    - IBM DataPower 10.0.1.0 
