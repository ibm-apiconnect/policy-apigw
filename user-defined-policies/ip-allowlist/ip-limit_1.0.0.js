const ip = context.get('message.headers.X-Client-Ip') //| context.get('session.clientAddress');
console.error("client ip:" + ip);

console.error(context.get("local.parameter.ranges"))
const ranges = JSON.parse(context.get("local.parameter.ranges"));
console.debug('IP ranges to check against :' + ranges)

let checkmode = context.get("local.parameter.mode");
if(checkmode.toUpperCase() != 'DENY'){  
  checkmode = "Allow"
} else {
  checkmode = "Deny"
}
console.debug('Using mode :'+ checkmode);

console.debug("client ip:" + ip)

const inRange = ranges.some(
  ([min, max]) => IPtoNum(min) < IPtoNum(ip) && IPtoNum(max) > IPtoNum(ip)
);

console.debug(inRange);
console.error(inRange);
if (checkmode === 'Deny') {
  if(inRange){
      context.reject('IPError', 'Your IP is not allowed to call this API');
      context.message.statusCode = '403 Forbidden';
  }
} else {
  if(!(inRange)){
      context.reject('IPError', 'Your IP is not allowed to call this API');
      context.message.statusCode = '403 Forbidden';
  }
}

function IPtoNum(ip) {
  return Number(
    ip
      .split(".")
      .map((d) => ("000" + d).substr(-3))
      .join("")
  );
}
