# ratelimit-dynamic

This custom policy is an example of how a single policy can be used to enforce a variety of pre-configured rate limits

The key artifacts for this implementation are:
 - ratelimit-dynamic.zip 
 - assembly-rate-limit-list.zip

The file `ratelimit-dynamic.zip` is the policy implementation for the rate limiting behavior. It consists of 5 DataPower GatewayScript files and some DataPower configuration. Note that the files `log-r10-per-min.js`,`log-r5-per-min.js`,`log-r2-per-min.js`, and `log-r1-per-min.js` only exist to provide logging information for debug purposes - these files and their corresponding configuration can be removed once you're familiar with how the policy operates

The file `assembly-rate-limit-list.zip` is a  list of pre-onfigured. See here for more information about gateway extensions
https://www.ibm.com/support/knowledgecenter/SSMNED_2018/com.ibm.apic.cmc.doc/rapic_gw_ext_guide_apigw.html. This extension applies the pre-configured rate limits after an API Connect publish event. Note that the extension **must** be modified to configure the correct API Collection, so you must change the line in the embedded `cfg` file to refer to the collection name that you use instead of the text that's currently in the file: `api-collection "<api-connect-collection-name>"`