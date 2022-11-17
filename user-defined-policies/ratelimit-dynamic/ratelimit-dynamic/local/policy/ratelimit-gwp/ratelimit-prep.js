console.error("RATELIMIT-GWP.JS enter" + context.message.headers.plan);

var rlKey = context.message.headers.key;
console.error("RATELIMIT-GWP.JS key:" + rlKey);
context.set('key', rlKey);
