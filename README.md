# API Gateway Policies
Sample global and custom policies for DataPower APIGateway

A global policy runs before or after certain APIs and is it's own assembly.
A user defined policy is a "building block" in the assembly that does something in the API. have a look at [this very basic policy](./user-defined-policies/basic/README.md)

To deploy them there are multiple ways to achieve this, in short it's gateway configuration that needs to somehow get to the gateway the possible mechanisms are
- a gateway extension
- direct on the gateway (using a config sequence possibly )
- using the custom resource and drive through the operator.


To create and handle global policies have a read through of this page.
https://www.ibm.com/docs/en/api-connect/10.0.5.x_lts?topic=policies-authoring-datapower-api-gateway

For user defined policies, these are just DataPower configuration the APIgw will push their availability to API manager