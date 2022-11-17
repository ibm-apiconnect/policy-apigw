const ranges = JSON.parse(context.get("local.parameter.ip-limit"));
console.error(ranges)

const ip = context.get('message.headers.X-Client-Ip');
console.error("client ip:" + ip)

const inRange = ranges.some(
  ([min, max]) => IPtoNum(min) < IPtoNum(ip) && IPtoNum(max) > IPtoNum(ip)
);

console.error(inRange);
if(inRange){
    context.reject('IPError', 'Your IP is not allowed to make this API');
    context.message.statusCode = '403 Frobidden';
}
function IPtoNum(ip) {
  return Number(
    ip
      .split(".")
      .map((d) => ("000" + d).substr(-3))
      .join("")
  );
}
