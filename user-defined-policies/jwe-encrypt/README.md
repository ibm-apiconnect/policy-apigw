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

# JWE Encrypt Policy
            
The JWE Encrypt Policy policy can be used in IBM API Connect to encrypt
any payload for REST APIs.

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
        message's headers.content-type will be set to `application/json`.
    - Encryption Algorithm:
        This is a required properly. Select an encryption algorithm to be used for the encryption.  Choose from the following:
        algorithm names:
        - A128CBC-HS256
        - A192CBC-HS384
        - A256CBC-HS512
        - A128GCM
        - A192GCM
        - A256GCM
    - Key Encryption Algorithm:
        This is a required properly. Select a key encryption algorithm to be used for the encryption.  Choose from the following:
        - RSA1_5
        - RSA-OAEP
        - RSA-OAEP-256
        - A128KW
        - A192KW
        - A256KW
    - Crypto Object:
        This is a required properly. Specify the name of the DataPower Crypto Object used to encrypt the message. Note that:
        - The Crypto Object referenced must be a Crypto Certificate (public certificate)
        - The public certificate file must be referenced by the Crypto Certificate object provided.

## Inputs

    - Clear text payload to be encrypted

## Outputs

    - JSON object containing the encrypted payload

## Prerequisites

    - IBM API Management 10.0.1.0 or later
    - IBM DataPower 10.0.1.0 or later
    - The Crypto Objects referenced by the policy and associated files must be present in the IBM API Connect domain on the DataPower Gateway
