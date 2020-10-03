# Watermark Remover Bot

Watermark Remover Bot is a Discord bot that detects and removes easily croppable website watermarks. It automatically scans uploaded images in new posts for watermarks, then deletes + re-uploads the post with the watermark cropped out.

[Click to invite](https://discord.com/oauth2/authorize?client_id=761447220586479647&permissions=43008&scope=bot), currently supports Reddit and ifunny watermarks.

## Testing

Drop images in `tests/files`, sync `tests/test-findWatermarkY.ts` with the types of images you're testing against. `npm test` will run [ava](https://www.npmjs.com/package/ava) on `*.ts` files in `tests/`

## Hosting

This project is built to run on [heroku](https://heroku.com), and requires environment variable `BOT_TOKEN` and optional variable `URL`.

`URL` should be set to the domain assigned by heroku, it's used in `src/keepAwake.ts` to prevent automatic shutdown on the free tier.

## Screenshots

![](screenshots/pikachu.png)
![](screenshots/spongebob.png)
![](screenshots/god.png)
