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

DataPower Processing Rules are required to do the actual validation of a XML Kerberos AP-REQ message sent from a client.
The processing rule `kerberos-validation-policy_2.0.0` utilizes a DataPower AAA action to do this
validation. The DataPower AAA action will validate the Kerberos AP-REQ message using a custom authentication stylesheet to
parse and verify a Kerberos AP-REQ message from the client.
If an error is found in the AAA action, the processing rule `kerberos-validation-policy_2.0.0-error` will
be utilized to reject the called rule processing and provide a HTTP status code and reason phrase for the rejection.
These two DataPower rules and associated file(s) are found in the `kerberos-validation-policy-calledRules.zip`
file included in this package. The custom AAA authentication stylesheet's job is to validate the message using the DataPower Kerberos Keytab and 
Kerberos Key Distribution Center (KDC) Server object names.
The stylesheet utilizes a DataPower context variable to access the policy instance's properties,
specifically getting the names of these two required objects.

The DataPower configuration for these called rules should be deployed using a Gateway Extension zip file. This would
be accomplished by adding the `kerberos-validation-policy-calledRules.zip` file into a Gateway Extension zip file, and then referencing this
file in the manifest.json file of that extension in the files array as a type `dp-import` as follows:

```
      {
        "filename": "kerberos-validation-policy-calledRules.zip",
        "deploy": "immediate",
        "type": "dp-import"
      },
```
This Gateway Extension zip file will be deployed using the Cloud Management Console (CMC) of the API Connect product and will
ensure this DataPower configuration will be present on all DataPower instances associated with the API Connect Gateway service.
The Gateway Extension zip file will contain a manifest.json file and other files (.zip and .yaml) files that will be referenced
by the manifest.json file. For more information on the Gateway Extension and the manifest.json file, see
[https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest](https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest)

These DataPower processing rule are called from a GatewayScript policy that is the only policy of the SAML
Validation user defined policy. This policy uses the multistep module callRuleWrapperInit and callRuleWrapper
functions that were introduced with DataPower version 10.6.0.0. See 
[https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module](https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module) for more information on the use of these functions.

# Kerberos Validation Policy

The Kerberos Validation policy can be used in IBM API Connect to authenticate a Kerberos AP-REQ XML message sent from a client.
The content type of the message must be an XML type, for example application/xml or text/xml. The XML message must contain a WS Security
Header with a BinarySecurityToken specifying a Kerberos Type token.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`kerberos-validation-policy_2.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
AAA action to do the actual validation and requires the referenced DataPower Kerberos Key Distribution Center (KDC) Server and Kerberos Server KeyTab objects to be present.

The policy yaml may be included in a gateway extension zip file, referenced by the extension's
manifest.json file with a type of `user-defined-policy-yaml`, and will be deployed globally for
all catalogs in the Gateway.

The policy may also be deployed to a specific catalog by using the API manager and navigating to the catalog's
settings and using the upload button on an api gateway's policy view page. See [https://www.ibm.com/docs/en/api-connect/10.0.8?topic=apdag-defining-packaging-publishing-catalog-scoped-policy-api-gateway](https://www.ibm.com/docs/en/api-connect/10.0.8?topic=apdag-defining-packaging-publishing-catalog-scoped-policy-api-gateway)
section 3.  The policy yaml file must be placed in a zip file of its own, and bullet point 3 provides detailed instructions on how to deploy the policy.
It may also be deployed using the API Connect Toolkit. See
[https://ibm-apiconnect.github.io/clidocs/docs/v1008/apim/apic_policies_create](https://ibm-apiconnect.github.io/clidocs/docs/v1008/apim/apic_policies_create) for detailed instructions.

## Usage

    The policy has the following properties:
    - Input Message:
        This is an optional property. Specify the name of the API Gateway context message to use as input to the policy.
        If not specified, the `message` context message will be assumed. The input payload will be taken from the context
        message's .body property.
    - Keytab Name:
        This is a required property. Specify the name of the DataPower Kerberos Server Keytab object used to do the validation
    - Server Principal:
        This is a required property. Specify the name of the DataPower Kerberos Key Distribution Center (KDC) Server object
        used to do the validation.

## Inputs

    - A valid XML message containing a WSSecurity Header with a BinarySecurityToken specifying a Kerberos Type token. 

## Outputs

    - The policy produces no output. It will either pass or throw an exception indication that the validation has failed.

## Prerequisites

    - IBM API Management 10.0.8.0
    - IBM DataPower 10.6.0.0 
    - The referenced Kerberos Server Keytab and Kerberos Key Distribution Center (KDC) Server objects must exist on the DataPower appliance.
