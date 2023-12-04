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

# Access Control By ClientIP Policy

The Access Control By ClientIP policy can be used in IBM API Connect to enforce
if a request from a client IP address will be allowed.

The policy yaml may be included in a gateway extension zip file, referenced by the extension's
manifest.json file with a type of `user-defined-policy-yaml`, and will be deployed globally for
all catalogs in the Gateway. See https://www.ibm.com/docs/en/api-connect/10.0.1.x?topic=gateway-extensions-manifest
for additional detail.

It may also be deployed to a specific catalog by using the API manager and navigating to the catalog's
settings and using the upload button on an api gateway's policy view page. See https://www.ibm.com/docs/en/api-connect/10.0.1.x?topic=apdag-defining-packaging-publishing-catalog-scoped-policy-api-gateway
section 3, bullet point 3 for detailed instructions. It may also be deployed using the API Connect Toolkit. See
https://www.ibm.com/docs/en/api-connect/10.0.1.x?topic=policies-apic-policiescreate for detailed instructions.

## Usage

The policy properties will be an array of ipACL objects. Use each object to specify a range of IPs. Each object will contain:

    - ipRange - a string with either a specific IP or a range of IPs as specified in CIDR notation
      - 10.0.0.100 will only specify an ipRange with just the single IP address of 10.0.0.100
      - 10.0.0.100/24 will specify an ipRange that would include all IP addresses between 10.0.0.0 and 10.0.0.255.
        See https://www.rfc-editor.org/rfc/rfc4632.html for more information on CIDR notation.
    - accessType - a string indicating that the ipRange will either be allowed or denied access

If a specific client IP address is found in both an allow and deny ipACL object, the client IP address will be allowed.

## Inputs

    - The client IP address making the request to the Gateway

## Outputs

    - No output, the policy either passes or fails with an exception that would return a HTTP 403 Forbidden status code

## Prerequisites

    - IBM API Management 10.0.1.0
    - IBM DataPower 10.0.1.0 
