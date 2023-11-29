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

# JWS Verify Policy
            
The JWS Verify Policy can be used in IBM API Connect to verify a digital signatures for
any payload for REST APIs. The content type of the decrypted message could be any content type,
and the policy will set the output content type header to either application/json, application/xml, or
text/plain based upon inspection of the verified and decrypted payload.

The policy yaml may be included in a gateway extension zip file, referenced by the extension's
manifest.json file with a type of `user-defined-policy-yaml`, and will be deployed globally for
all catalogs in the Gateway. See https://www.ibm.com/docs/en/api-connect/10.0.1.x?topic=gateway-extensions-manifest
for additional detail.

It may also be deployed to a specific catalog by using the API manager and navigating to the catalog's
settings and using the upload button on an api gateway's policy view page. See https://www.ibm.com/docs/en/api-connect/10.0.1.x?topic=apdag-defining-packaging-publishing-catalog-scoped-policy-api-gateway
section 3, bullet point 3 for detailed instructions. It may also be deployed using the API Connect Toolkit. See
https://www.ibm.com/docs/en/api-connect/10.0.1.x?topic=policies-apic-policiescreate for detailed instructions.

## Usage

    The policy has the following properties:
    - Input Message:
        This is an optional property. Specify the name of the API Gateway context message to use as input to the policy.
        If not specified, the `message` context message will be assumed. The input payload will be taken from the context
        message's .body property.
    - Output Message:
        This is an optional property. Specify the name of the API Gateway context message to save the output of the policy.
        If not specified, the `message` context message will be assumed. If a context message name is provided that does
        not exist, it will be created. The output payload will be written to the context message's .body property. The context
        message's headers.content-type will be set based upon the payload that is verified.
    - Crypto Object:
        This is a required properly. Specify the name of the DataPower Crypto Object used to digitally sign the message. Note that:
        - If the original message was signed with a Shared Secret Key, the Crypto Object specified must be the Shared Secret Key
        - If the original message was signed with a private key, Crypto Object specified must be the associated Crypto Certificate (public certificate)
        - The crypto files (public certificate file or shared secret key file) must be referenced by the Crypto object provided.

## Inputs

    - JSON object containing the digitally signed payload to be verified

## Outputs

    - Clear text verified and decrypted result

## Prerequisites

    - IBM API Management 10.0.1.0
    - IBM DataPower 10.0.1.0 
    - The Crypto Objects referenced by the policy and associated files must be present in the IBM API Connect domain on the DataPower appliance
