require("dotenv").config({ path: ".env.local" });
const { Redis } = require("@upstash/redis");
const redis = Redis.fromEnv();
(async () => {
  const day = new Date().toISOString().slice(0, 10);
  const key = `dl-quota:ip:::1:${day}`;
  const val = await redis.get(key);
  console.log("current value:", val);
})();
