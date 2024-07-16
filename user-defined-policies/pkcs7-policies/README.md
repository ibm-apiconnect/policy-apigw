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

DataPower Processing Rules are required to do the actual pkcs#7 encryption, decryption, sign, and verify of input message payloads.
The processing rule `pkcs7-encrypt-policy_2.0.0` utilizes a DataPower CryptoBin action with the pkcs#7 encrypt operation to do the
pkcs#7 encryption of any message.
The processing rule `pkcs7-decrypt-policy_2.0.0` utilizes a DataPower CryptoBin action with the pkcs#7 decrypt operation to do the
decryption of any message previously encrypted with the pkcs#7 encrypt operation.
The processing rule `pkcs7-sign-policy_2.0.0` utilizes a DataPower CryptoBin action with the pkcs#7 sign operation to do the
pkcs#7 digital signing of any message.
The processing rule `pkcs7-verify-policy_2.0.0` utilizes a DataPower CryptoBin action with the pkcs#7 verify operation to do the
verification of any message previously signed with the pkcs#7 sign operation.

These four DataPower rules and associated file(s) are found
in the `pkcs7-policies-calledRules.zip` file included in this package.  The Encrypt, Decrypt, Sign, and Verify
CryptoBin actions utilize a DataPower context variable to specify the name of a DataPower object referencing a X.509 public
certificate (encryption), an identification credential referencing the X.509 public certificate and X.509 private key (decryption and sign),
and validation credential referencing the X.509 public certificate (verify). Other DataPower context variables specify operation specific
properties which are dynamically set based upon the values of the user defined policy instance's properties.
 
These object names and operation properties are passed from the API Gateway's user defined policy using a standardized DataPower context variable
containing the user defined policy's properties.
A DataPower Transformation action will use the context variable containing the policy's properties to setup its
subsequent action's specific context variable to provide the dynamic nature of the processing of the particular action within the rule.

The DataPower configuration for these called rules should be deployed using a Gateway Extension zip file. This would
be accomplished by adding the `pkcs7-policies-calledRules.zip` file into a Gateway Extension zip file, and then referencing this
file in the manifest.json file of that extension in the files array as a type `dp-import` as follows:
```
      {
        "filename": "pkcs7-policies-calledRules.zip",
        "deploy": "immediate",
        "type": "dp-import"
      },
```
This Gateway Extension zip file will be deployed using the Cloud Management Console (CMC) of the API Connect product and will
ensure this DataPower configuration will be present on all DataPower instances associated with the API Connect Gateway service.
The Gateway Extension zip file will contain a manifest.json file and other files (.zip and .yaml) files that will be referenced
by the manifest.json file. For more information on the Gateway Extension and the manifest.json file, see
[https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest](https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest).

These DataPower processing rule are called from a GatewayScript policy that is the only policy of the PKCS#7 Encrypt, Decrypt, Sign and Verify user defined policies.
These policies use the multistep module callRuleWrapperInit and callRuleWrapper functions that were introduced with DataPower version 10.6.0.0. See 
[https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module](https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module)
for more information on the use of these functions.

# PKCS#7 Encrypt Policy

The PKCS#7 Encrypt Policy can be used in IBM API Connect to encrypt any message using the PKCS#7 encrypt method. The input message can be of any
content type.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`pkcs7-encrypt-policy_2.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
CryptoBin action to do the actual encryption, using the public certificate object specified in the policy instance's properties.
It will also use other policy instance's properties to configure options for the encryption operation.

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
    - Input Message:
        This is an optional property. Specify the name of the API Gateway context message to use as input to the policy.
        If not specified, the `message` context message will be assumed. The input payload will be taken from the context
        message's .body property.
    - Output Message:
        This is an optional property. Specify the name of the API Gateway context message to save the output of the policy.
        If not specified, the `message` context message will be assumed. If a context message name is provided that does
        not exist, it will be created. The output payload will be written to the context message's .body property.
    - Encryption algorithm:
        This is a required property. Select an encryption algorithm to be used for the encryption.  Choose from the following:
        algorithm names. "tripledes-cbc" is the default.
        - tripledes-cbc
        - aes128-cbc
        - aes192-cbc
        - aes256-cbc
        - rc2-40-cbc
        - rc2-64-cbc
        - rc2-cbc
    - Binary Data:
        This is a required property. This property indicates the data being encrypted is true binary (contains valid 8-bit data).
        Specify "on" or "off" from the dropdown.  The default value is "on".
    - Input Encoding:
        This is a required property. This property indicates the data being encrypted has an encoding format. The default value
        is "none". Choose from the following encoding formats:
        - none
        - base64
    - Output Encoding:
      This is a required property. This property indicates the encrypted output will have an encoding format. The default value
        is "base64-der". Choose from the following encoding formats:
        - base64-der
        - der
        - pem
        - smime
    - Recipients:
        This is a required property. Specify an array of name(s) of the DataPower Crypto Certificate Object(s) used to encrypt the message. Note
        that the desired public certificate file(s) must be referenced by the Crypto Certificate Object(s) provided. Any decryption of
        this message must utilize the private key file(s) that is associated with the public certificate file(s) used.

## Inputs

    - A non-empty message body.

## Outputs

    - An pkcs#7 encrypted message that is encrypted based upon the policy properties provided.

# PKCS#7 Decrypt Policy

The PKCS#7 Decrypt Policy can be used in IBM API Connect to decrypt any message previously encrypted with the PKCS#7 encrypt method. The message can be of any
content type.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`pkcs7-decrypt-policy_2.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
CryptoBin action to do the actual decryption, using the private key found in an identification credential object specified in the policy instance's properties.

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
    - Input Encoding:
      This is a required property. This property indicates the data being decrypted has an encoding format. The default value
        is "base64-der". Choose from the following encoding formats:
        - base64-der
        - der
        - pem
        - smime
    - Output Encoding:
      This is a required property. This property indicates the decrypted output will have an encoding format. The default value
        is "none". Choose from the following encoding formats:
        - none
        - base64
    - Recipients:
      This is a required property. Specify an array of name(s) of the DataPower Identification Credential Object(s) used to decrypt the message.
      Note that the desired private key file(s) must be referenced by the Crypto Key Object referenced by the Identification Credential Object(s)
      provided. The desired public certificate file(s) must also be referenced by the Crypto Certificate Object referenced by the Identification
      Credential Object(s) provided. The decryption of this message must utilize the private key file(s) that is associated with the public
      certificate file(s) used to originally encrypt the message.

## Inputs

    - A non-empty message body that has been previously encrypted using the pkcs#7 encryption public certificate. 

## Outputs

    - A message containing the decrypted equivalent of the original message.

# PKCS#7 Sign Policy

The PKCS#7 Sign Policy can be used in IBM API Connect to sign any message using the PKCS#7 sign method. The message can be of any
content type.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`pkcs7-sign-policy_2.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
CryptoBin action to do the actual signing, using the public certificate object specified in the policy instance's properties.

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
    - Signature algorithm:
        This is a required property. Select an signature algorithm to be used for the signing.  Choose from the following:
        algorithm names. "dsa-sha1" is the default.
        - dsa-sha1
        - rsa-md5
        - rsa-sha1
        - rsa-sha256
        - rsa-sha384
        - rsa-sha512
    - Binary Data:
        This is a required property. This property indicates the data being signed is true binary (contains valid 8-bit data).
        Specify "on" or "off" from the dropdown.  The default value is "on".
    - Input Encoding:
        This is a required property. This property indicates the data being signed has an encoding format. The default value
        is "none". Choose from the following encoding formats:
        - none
        - base64
    - Output Encoding:
      This is a required property. This property indicates the signed output will have an encoding format. The default value
        is "base64-der". Choose from the following encoding formats:
        - base64-der
        - der
        - pem
        - smime
    - Signers:
        This is a required property. Specify an array of name(s) of the DataPower Identification Credential Object(s) used to sign the message.
        Note that the desired private key file(s) must be referenced by the Crypto Key Object referenced by the Identification Credential Object(s)
        provided. The desired public certificate file(s) must also be referenced by the Crypto Certificate Object referenced by the Identification
        Credential Object(s) provided. Any verification of the signed output of this policy must utilize the public certificate file(s) that is
        associated with the private key file used to sign this message.
        
## Inputs

    - A non-empty message body.

## Outputs

    - An pkcs#7 signed message that is based upon the policy properties provided. 

# PKCS#7 Verify Policy

The PKCS#7 Verify Policy can be used in IBM API Connect to verify any message previously signed with the PKCS#7 sign method. The message can be of any
content type.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`pkcs7-verify-policy_2.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
CryptoBin action to do the actual decryption, using the private key found in an identification credential object specified in the policy instance's properties.

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
    - Input Encoding:
        This is a required property. This property indicates the data being verified has an encoding format. The default value
        is "base64-der". Choose from the following encoding formats:
        - base64-der
        - der
        - pem
        - smime
    - Output Encoding:
      This is a required property. This property indicates the output of the verified message has an encoding format. The default value
        is "none". Choose from the following encoding formats:
        - none
        - base64
    - Validation Credentials:
      This is a required property. Specify an array of name(s) of the DataPower Validation Credential Object(s) used to verify the message.
      Note that the desired public certificate file(s) must also be referenced by the Crypto Certificate Object referenced by the Validation
      Credential Object(s) provided. The verification of this message must utilize the public certificate file(s) that is associated with the
      private key file(s) used to originally sign the message.

## Inputs

    - A non-empty message body that has been previously signed using the pkcs#7 signature private key. 

## Outputs

    - An pkcs#7 verified message that is based upon the policy properties provided. 

## Prerequisites

    - IBM API Management 10.0.8.0
    - IBM DataPower 10.6.0.0 
    - The Crypto Certificate and Crypto Key objects referenced by the Crypto Identification Credential objecets or Crypto Validation Credential
      objects referenced by the policy and associated files must be present in the IBM API Connect domain on the DataPower appliance.
