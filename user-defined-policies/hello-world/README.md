# License

Copyright 2024 IBM Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

# DataPower Processing Rule Configuration

DataPower Processing Rules are required to return the desired hello world response.
The processing rule `hello-world_1.0.0` utilizes a DataPower Transformation action to return a simple XML response saying hello
to the name specified in the policy properties.

This DataPower rules and associated file(s) are found
in the `helloworld-calledrule.zip` file included in this package.  Transformation action utilizes a DataPower context variable
to specify the name to add to the XML output of a hello world message.  This name will be dynamically set based upon the values of the
user defined policy instance's properties.
 
The name is passed from the API Gateway's user defined policy using a standardized DataPower context variable
containing the user defined policy's properties.
A DataPower Transformation action will use the context variable containing the policy's properties to provide the dynamic nature
of the processing of the particular action within the rule.

The DataPower configuration for these called rules should be deployed using a Gateway Extension zip file. This would
be accomplished by adding the `helloworld-calledrule.zip` file into a Gateway Extension zip file, and then referencing this
file in the manifest.json file of that extension in the files array as a type `dp-import` as follows:

```
      {
        "filename": "helloworld-calledrule.zip",
        "deploy": "immediate",
        "type": "dp-import"
      },
```
This Gateway Extension zip file will be deployed using the Cloud Management Console (CMC) of the API Connect product and will
ensure this DataPower configuration will be present on all DataPower instances associated with the API Connect Gateway service.
The Gateway Extension zip file will contain a manifest.json file and other files (.zip and .yaml) files that will be referenced
by the manifest.json file. For more information on the Gateway Extension and the manifest.json file, see
[https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest](https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest).

These DataPower processing rule are called from a GatewayScript policy that is the only policy of the Hello World user defined policy.
This policy uses the multistep module callRuleWrapperInit and callRuleWrapper functions that were introduced with DataPower version 10.6.0.0. See 
[https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module](https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module)
for more information on the use of these functions.

# Hello World Policy

The Hello World Policy can be used in IBM API Connect to receive an XML response with the configured individual's name in the policy properties. It is meant to be
as simple example of using the new multistep module functions made available in DataPower release 10.6.0.0.  There is no input message
required for this policy.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`hello-world_1.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
Transformation action to build an XML response base upon the name specified in the policy instance's properties.

The policy yaml may be included in a gateway extension zip file, referenced by the extension's
manifest.json file with a type of `user-defined-policy-yaml`, and will be deployed globally for
all catalogs in the Gateway.

The policy may also be deployed to a specific catalog by using the API manager and navigating to the catalog's
settings and using the upload button on an api gateway's policy view page. See 
[https://www.ibm.com/docs/en/api-connect/10.0.8?topic=apdag-defining-packaging-publishing-catalog-scoped-policy-api-gateway](https://www.ibm.com/docs/en/api-connect/10.0.8?topic=apdag-defining-packaging-publishing-catalog-scoped-policy-api-gateway)
section 3.  The policy yaml file must be placed in a zip file of its own, and bullet point 3 provides detailed instructions on how to deploy the policy.
It may also be deployed using the API Connect Toolkit. See
[https://ibm-apiconnect.github.io/clidocs/docs/v1008/apim/apic_policies_create](https://ibm-apiconnect.github.io/clidocs/docs/v1008/apim/apic_policies_create) for detailed instructions.

## Usage

    The policy has the following properties:
    - Output Message:
        This is an optional property. Specify the name of the API Gateway context message to save the output of the policy.
        If not specified, the `message` context message will be assumed. If a context message name is provided that does
        not exist, it will be created. The output payload will be written to the context message's .body property.

## Inputs

    - none

## Outputs

    - An XML message that says hello to the name in the policy properties provided.

## Prerequisites

    - IBM API Management 10.0.8.0
    - IBM DataPower 10.6.0.0 
