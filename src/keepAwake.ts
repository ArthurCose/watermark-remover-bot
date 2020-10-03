import Koa from "koa";
import fetch from "node-fetch";

if (process.env.$PORT) {
  const app = new Koa();

  app.use((ctx) => {
    ctx.body = "I'm awake!";
  });

  app.listen(process.env.$PORT);

  // server falls asleep every 30 mins, keep it awake by messaging every 20 mins
  setInterval(async () => {
    const res = await fetch(
      `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
    );

    console.log(await res.text());
  }, 20 * 60 * 1000);
}
