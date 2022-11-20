/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2019
*/
var urlopen = require('urlopen');


var counter = 0;

function APICMQErrorHelper(name, message, code) {

    if (!code) {
        code = 400;
    }
    context.set("message.status.code",code)
    context.set("message.status.reason",name)
    context.set("message.body",message)
}

function NoQueueFoundException(responseCode, queue) {
    return APICMQErrorHelper("NoQueueFoundException", "APICMQ001 : Response code '" + responseCode + "' was received when connecting to a either a request or response queue . Please check the Queue name is correct.", 404);
}

function NoQueueManagerFoundException(queueManagerObjectName) {
    return APICMQErrorHelper("NoQueueManagerFoundException", "APICMQ002 : API Connect was unable to find a QueueManager Object with the name '" + queueManagerObjectName + "'", 404);
}

function ResponseTimeOutException() {
    return APICMQErrorHelper("ResponseTimeOutException", "APICMQ004 : A response was not received in the given time. ", 408);
}

function InvalidSOAPResponse(SOAPResponse) {
    return APICMQErrorHelper("InvalidSOAPResponse", "APICMQ005 : Invalid SOAP Response  : Please check the BackOut Queue for the message", 500);
}

function InvalidRequest(SOAPResponse) {
    return APICMQErrorHelper("InvalidResponse", "APICMQ006 : Error occured when reading the input was the inputData XML or JSON", 400);
}

function NoBOQ() {
    return APICMQErrorHelper("NOBackOutQueue", "APICMQ007 : No Backout Queue Specified", 400);
}

function MessageOnBoQ(data, response) {

    if (boq == '') {
        NoBOQ();
    } else {
        var h = response.get({
            type: 'mq'
        }, 'MQMD')

        var newBOC = h.MQMD.BackoutCount.$ + 1
        h.MQMD.BackoutCount = {
            $: newBOC
        }
        var options = {
            target: boqURL,
            data: data,
            headers: {
                MQMD: h,
                MQRFH2: MQRFH2
            }
        }
        urlopen.open(options, function(connectError, res) {
            if (connectError) {
                APICMQErrorHelper("ErrorPuttingMessageOnBO", connectError, 400);
            }
            console.error(res.get({
                type: 'mq'
            }, 'MQMD'));
            console.error(res)
        });
    }
}


function process(options) {


    try {

        urlopen.open(options, function(connectError, res) {
            if (res) {
                console.error('Received MQ ' + res.statusCode + ' for target ' + options.target);
            }
            if (connectError) {
                NoQueueManagerFoundException(qm)
            } else if (res.statusCode === 0) {
                console.error("Message on Queue");
                console.error(options);
                if (respq == '') {
                    var mqmd = XML.parse(res.get('MQMD'));
                    console.debug(mqmd);
                    context.set("message.body",mqmd);
                } else {
                    res.readAsXML(function(readAsXMLError, xmlDom) {
                        if (readAsXMLError) {
                            res.readAsJSON(function(readAsJSONError, jsonObj) {
                                if (readAsJSONError) {
                                    res.readAsBuffer(function(readAsBufferError, buffer) {
                                        console.error("Unable to read response as XML or JSON");
                                        if (!readAsBufferError) {
                                            MessageOnBoQ(buffer, res);
                                            InvalidSOAPResponse();
                                        } else {
                                            InvalidSOAPResponse("Error : " + readAsBufferError);
                                        }
                                    });
                                } else {
                                    console.error(jsonObj);

                                    context.set("message.body",jsonObj);
                                }
                            });
                        } else {

                            context.set("message.body",xmlDom);
                        }
                    });
                }
            } else if (res.statusCode === 2085) {
                NoQueueFoundException(2085, reqq)
            } else if (res.statusCode === 2059) {
                NoQueueManagerFoundException(qm)
            } else if (res.statusCode === 2033) {
                ResponseTimeOutException()
            } else {
                if (counter > 4) {
                    res.readAsBuffer(function(readAsBufferError, buffer) {
                        console.error("Attempting to parse the response message to put on the BackOut Queue");
                        if (!readAsBufferError) {
                            MessageOnBoQ(buffer, res.headers);
                        }
                    });

                    var errorMessage = 'Thrown error on urlopen.open for target ' + options.target + ':   statusCode:' + res.statusCode
                    APICMQErrorHelper("Unknown Error", errorMessage, 500)
                } else {
                    counter++;
                    console.error('Failed to put message on to Queue Retry: ' + counter + ' of 5');
                    process(options);
                }
            }

        });
    } catch (error) {
        var errorMessage = 'Thrown error on urlopen.open for target ' + options.target + ': ' + error.message + ', error object errorCode=' + error.errorCode.toString();
        APICMQErrorHelper("Unknown Error", errorMessage, 400)
    }
}


var qm = context.get('local.parameter.qmgrobj')
var boq = context.get('local.parameter.boq')
var reqq = context.get('local.parameter.queue')
var respq = context.get('local.parameter.replyqueue')
var timeout = context.get('local.parameter.timeout')

// console.error("*******************")
// console.error(qm)
// console.error(boq)
// console.error(reqq)
// console.error(respq)
// console.error(timeout)
// console.error("*******************")

var mqURL = "unset"
var MsgType = -1;
var ReplyToQ = "";
if (respq == '') {
    MsgType = 8
    mqURL = 'dpmq://' + qm + '/?RequestQueue=' + reqq + ';timeout=' + timeout
} else {
    MsgType = 1
    ReplyToQ = respq
    mqURL = 'dpmq://' + qm + '/?RequestQueue=' + reqq + ';ReplyQueue=' + respq + ';timeout=' + timeout
}
var boqURL = 'dpmq://' + qm + '/?RequestQueue=' + boq + ';timeout=' + timeout

var MQMD = {
        MsgType: {
            "$": MsgType
        },
        ReplyToQ: {
            "$": ReplyToQ
        },
        Format: {
            "$": 'MQHRF2'
        }
}

// '<MQMD>' +
//    '<StructId>MD</StructId>' +
//    '<Format>MQHRF2</Format>' +
//    '<MsgType>' + MsgType + '</MsgType>' +
//    '<Persistence>1</Persistence>' +
//    '<ReplyToQ>' + ReplyToQ + '</ReplyToQ>' +
//    '</MQMD>'
//


// var MQRFH2 = '<MQRFH2>' +
//     '<Version>' + props.vrsn + '</Version>' +
//     '<Format>' + props.format + '</Format>' +
//     '<StrucId>'+props.structid+'</StrucId>'+
//     '</MQRFH2>';
var MQRFH2 = {
        StrucId: {
            "$": context.get('local.parameter.structureid') || "RFH"
        },
        Version: {
            "$": context.get('local.parameter.rfh-version') || "MQRFH_VERSION_2"
        },
        Format: {
            "$": context.get('local.parameter.format') || "MQSTR"
        },
        Encoding: {
            "$": context.get('local.parameter.encoding') || "MQENC_NATIVE"
        },
        CodedCharSetId: {
            "$": context.get('local.parameter.codedcharsetid') || "MQCCSI_INHERIT"
        },
        Flags: {
            "$": context.get('local.parameter.flags')|| "MQRFH_NONE"
        },
        NameValueCCSID: {
            "$": context.get('local.parameter.ccsid')|| "1208"
        }
}

var outputObject = {};

//Read the payload as XML
process({
    target: mqURL,
    data: context.get('message.body'),
    headers: {
        MQMD: MQMD,
        MQRFH2: MQRFH2

    }
})
