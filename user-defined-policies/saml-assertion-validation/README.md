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

DataPower Processing Rules are required to do the actual validation of a SAML assertion within an XML document.
The processing rule `saml-validation-policy_2.0.0` utilizes a DataPower AAA action to do this
validation. The DataPower AAA action will validate the SAML assertion signature.
The assumption is also made that the message with the assertion is digitally signed (which requires use of a private key)
and the AAA action will validate that the private key used for this signing is trusted by using
a DataPower validation credential containing the certificate associated with the trusted private key. If an error is
found in the AAA action, the processing rule `saml-validation-policy_2.0.0-error` will
be utilized to reject the called rule processing and provide a HTTP status code and reason phrase for the rejection.
These two DataPower rules and associated file(s) are found in the `saml-validation-policy-calledRules.zip`
file included in this package. The AAA action has a statically configured validation credential object that will
accept any digitally signed message. This pre-configured object reference is replaced using a AAA post processing dynamic
configuration stylesheet that uses the existing AAA object as a template. This stylesheet's job is to determine
the DataPower deployed name of the desired validation credential object name and to replace the object name in the current template.
The stylesheet utilizes a DataPower context variable to access the policy instance's properties,
specifically getting the name of an API Connect TLS Client Profile provided. When a TLS Profile
is associated with a given catalog in the API Manager, the DataPower objects created for this TLS Profile will
be named based on the organization name, catalog name and version of the profile. For example, a TLS Profile name
of `test` will be deployed to DataPower using a naming convention of `orgname_catalogname_tlsp-testV1.0.0`
for the TLS Profile object. The DataPower validation credential object associated with the TLS Profile object will use the same name
with a `-valcred` suffix.
The XSLT stylesheet will take the TLS Profile name, provide it the apim:getTLSProfileObjName extension function found
in `store:///dp/apim.custom.xsl` to get this DataPower object name for the current organization and catalog, and will
add the suffix to that name.  It will then use that name to update
the AAA action template with the desired validation credential object name. When the AAA action executes, the certificate validation
will be done using the desired validation credential.

The DataPower configuration for these called rules should be deployed using a Gateway Extension zip file. This would
be accomplished by adding the `saml-validation-policy-calledRules.zip` file into a Gateway Extension zip file, and then referencing this
file in the manifest.json file of that extension in the files array as a type `dp-import` as follows:

```
      {
        "filename": "saml-validation-policy-calledRules.zip",
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

# SAML Validation Policy

The SAML Validation policy can be used in IBM API Connect to authenticate a XML message that contains a digitally signed SAML assertion.
The content type of the message must be an XML type, for example application/xml or text/xml. The XML message must contain a SAML
assertion that has been digitally signed to enforce non-repudiation.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`saml-validation-policy_2.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
AAA action to do the actual validation and requires the API Connect TLS Profile name to use for validation of the digital
signature. 

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
    - Output Message:
        This is an optional property. Specify the name of the API Gateway context message to save the output of the policy.
        If not specified, the `message` context message will be assumed. If a context message name is provided that does
        not exist, it will be created. The output payload will be written to the context message's .body property.
    - TLS Profile:
        This is a required property. Specify the name of the API Connect TLS Profile to be used to validate the digital signature
        of the message. The TLS Profile must contain a TLS Trust Store that contains the public certificate(s) used to validate the
        digital signature of the message.  Note this TLS Profile must be associated with the catalog of the API using this policy.
        That association will deploy all required DataPower objects for that TLS Profile required by the called rule.

## Inputs

    - A valid XML message containing a SAML assertion that has also been digitally signed. 

## Outputs

    - The policy produces no output. It will either pass or throw an exception indication that the validation has failed.

## Prerequisites

    - IBM API Management 10.0.8.0
    - IBM DataPower 10.6.0.0 
    - The TLS Profile name provided in a policy instance must have been created as an API Manager Resource. This profile must
      contain a Trust Store that contains the certificate file(s) that is associated with the private key used to digitally sign the
      message. Finally, the TLS Profile name must be associated with the catalog that the API using this policy is published.
