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

DataPower Processing Rules are required to do the actual encryption and decryption of SOAP messages.
The processing rule `encrypt-soap-message_1.0.0` utilizes a DataPower Encrypt action to do the
encryption of a SOAP message using the WS Security Encryption method. The processing rule
`decrypt-soap-message_1.0.0` utilizes a DataPower Decrypt action to do the decryption of a SOAP
message using the WS Security Encryption method. These two DataPower rules and associated file(s) are found
in the `soap-encrypt-decrypt-calledRules.zip` file included in this package.  Both the Encrypt and Decrypt
actions utilize a DataPower context variable to specify the name of a DataPower object referencing a X.509 public
certificate (encryption) or a X.509 private key (decryption). These object names are passed from the API Gateway's
user defined policy using a standardized DataPower context variable containing the user defined policy's properties.
A DataPower Transformation action will use the context variable containing the policy's properties to setup its
subsequent action's specific context variable to provide the dynamic nature of the processing of the particular action
within the rule.

The DataPower configuration for these called rules should be deployed using a Gateway Extension zip file. This would
be accomplished by adding the `soap-encrypt-decrypt-calledRules.zip` file into a Gateway Extension zip file, and then referencing this
file in the manifest.json file of that extension in the files array as a type `dp-import` as follows:

```
      {
        "filename": "soap-encrypt-decrypt-calledRules.zip",
        "deploy": "immediate",
        "type": "dp-import"
      },
```
This Gateway Extension zip file will be deployed using the Cloud Managment Console (CMC) of the API Connect product and will
ensure this DataPower configuration will be present on all DataPower instances associated with the API Connect Gateway service.
The Gateway Extension zip file will contain a manifest.json file and other files (.zip and .yaml) files that will be referenced
by the manifest.json file. For more information on the Gateway Extension and the manifest.json file, see
[https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest](https://www.ibm.com/docs/en/api-connect/10.0.8?topic=gateway-extensions-manifest)

These DataPower processing rule are called from a GatewayScript policy that is the only policy of the SOAP
Encrypt and Decrypt user defined policies. These policies use the multistep module callRuleWrapperInit and callRuleWrapper
functions that were introduced with DataPower version 10.6.0.0. See 
[https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module](https://www.ibm.com/docs/en/datapower-gateway/10.6?topic=apis-multistep-module) for more information on the use of these functions.

# Soap Encrypt Policy
            
The SOAP Encrypt Policy can be used in IBM API Connect to encrypt the root body element of a
SOAP message using the WS Security Encryption method. The content type of the message to be encrypted
must be an XML type, for example application/xml or text/xml. The message must also be either a SOAP 1.1
or SOAP 1.2 message, containing a root element with the local name of `Envelope` and specifying the
appropriate SOAP namespace uri.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`encrypt-soap-message_1.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
Encrypt action to do the actual encryption, using the public certificate object specified in the policy instance's properties.

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
    - Recipient certificate:
        This is a required properly. Specify the name of the DataPower Crypto Certificate Object used to encrypt the message. Note
        that the desired public certificate file must be referenced by the Crypto Certificate Object provided. Any decryption of
        of this message must utilize the private key file that is associated with the public certificate file used.  

## Inputs

    - A valid SOAP XML message utilizing either the SOAP 1.1 or SOAP 1.2 standard.

## Outputs

    - A valid SOAP XML message where the root body element has been replaced with an XML element containing the encryption of the
      root body element.

# Soap Decrypt Policy
            
The SOAP Decrypt Policy can be used in IBM API Connect to decrypt the root body element of a
SOAP message using the WS Security Decryption method. The content type of the message to be decrypted
must be an XML type, for example application/xml or text/xml. The message must also be either a SOAP 1.1
or SOAP 1.2 message, containing a root element with the local name of `Envelope` and specifying the
appropriate SOAP namespace uri. It must contain as the root body element and element with a local name of
`EncryptedData` with child elements that would specify the encrypted data of the original root body element.

The policy only contains a GatewayScript policy. This GatewayScript policy will call the DataPower Processing Rule
`decrypt-soap-message_1.0.0` using the multistep module callRuleWrapper function. The called rule uses a DataPower
Decrypt action to do the actual decryption, using the private key object specified in the policy instance's properties.

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
    - Private key:
        This is a required properly. Specify the name of the DataPower Crypto Key Object used to decrypt the message. Note
        that the desired private key file must be referenced by the Crypto Key Object provided. The decryption of
        of this message must utilize the private key file that is associated with the public certificate file used to originally
        encrypt the message.
## Inputs

    - A valid SOAP XML message utilizing either the SOAP 1.1 or SOAP 1.2 standard that has previously had the root body element
      encrypted using the WS Security method.

## Outputs

    - A valid SOAP XML message where the encrypted root body element has been replaced with the original decrypted root body element.

## Prerequisites

    - IBM API Management 10.0.8.0
    - IBM DataPower 10.6.0.0 
    - The Crypto Certificate and Crypto Key objects referenced by the policy and associated files must be present in the IBM API Connect domain on the DataPower appliance
