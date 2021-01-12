# policy-apigw
Sample global and custom policies for DataPower APIGateway

The request is handled by the policy in ase-prehook.yml.
The required data is extracted from the request and sent to the configure AI endpoint before it gets sent to the backend.

The response is handled by ase-posthook.yml. 
When the reponse is received from the backend, the required response data is extracted and sent to AI endpoint before sending to client.
