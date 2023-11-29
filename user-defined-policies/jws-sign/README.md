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

# JWS Sign Policy
            
The JWS Sign Policy can be used in IBM API Connect to digitally sign
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
    - Cryptographic Algorithm:
        This is a required properly. Select a cryptographic algorithm to be used for the digital signing.  Choose from the following:
        - HS256
        - HS384
        - HS512
        - RS256
        - RS384
        - RS512
        - ES256
        - ES384
        - ES512
        - PS256
        - PS384
        - PS512
        Although you can use PSxxx algorithms, HSM acceleration for these algorithms applies to only appliances with the HSM 3 (hsm3) accelerator.
    - Crypto Object:
        This is a required properly. Specify the name of the DataPower crypto object used to digitally sign the message. Note that:
        - For algorithm types HS256, HS385, and HS512 the Crypto Object referenced must be a Shared Secret Key.
        - For algorithm types RS256, RS385, RS512, ES256, ES384, ES512, PS256, PS384, and PS512 the Crypto Object referenced must be a Crypto Key (private key).
        - The crypto files (private key file or shared secret key file) must be referenced by the Crypto Object provided.

## Inputs

    - Clear text payload to be digitally signed

## Outputs

    - JSON object containing the digitally signed payload

## Prerequisites
    - IBM API Management 10.0.1.0
    - IBM DataPower 10.0.1.0 
    - The crypto objects referenced by the policy and associated files must be present in the IBM API Connect domain on the DataPower appliance
