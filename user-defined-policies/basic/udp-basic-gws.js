var apim = require('apim');

/**
 * 
 * START: Modify Parameters
 * 
 * Modify the following parameters (param1/param2/.../param10 based on the number of input parameters)
 * 
 **/
 
var param1 = context.get('param1');
console.info ("param1 %s", param1);

if (param1 == null || param1 == '') {
    context.reject('Invalid Parameter', 'The paramater param1 you provided is invalid');
    context.message.statusCode = '401 Unauthorized';
}

/**
 * 
 * END: Modify Parameters
 * 
 **/

var jsonBody = {
    "param1" : param1,
    "body" : apim.getvariable('message.body')
}

session.output.write(jsonBody);