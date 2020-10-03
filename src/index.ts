import {
  Client as DiscordClient,
  Message as DiscordMessage,
  FileOptions,
} from "discord.js";
import findWatermarkY from "./watermark-finders/findWatermarkY";
import { useCatcher, isImageURL } from "./util";
import Jimp from "jimp";
import fetch from "node-fetch";
import { config as configEnv } from "dotenv";
import { Stream } from "stream";

configEnv();

const client = new DiscordClient();

// helpers

function listenWithCatcher(event, listener) {
  client.on(event, useCatcher(listener));
}

async function getAttachmentBufferOrStream(
  attachment: string | Buffer | Stream
): Promise<Buffer | Stream> {
  if (typeof attachment == "string") {
    const res = await fetch(attachment);
    return res.body;
  }

  return attachment;
}

// listeners

listenWithCatcher("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client
    .generateInvite(["SEND_MESSAGES", "MANAGE_MESSAGES", "ATTACH_FILES"])
    .then((link) => console.log(`Invite with: ${link}`))
    .catch(console.log);
});

listenWithCatcher("message", async (message: DiscordMessage) => {
  if (process.env.DEBUG && message.channel.id != "761758145860730890") {
    return;
  }

  // ignore self
  if (message.author.id == client.user.id) {
    return;
  }

  let foundWatermark = false;
  const files: FileOptions[] = [];

  for (const [id, messageAttachment] of message.attachments) {
    let { attachment } = messageAttachment;

    if (typeof attachment == "string" && isImageURL(attachment)) {
      let image = await Jimp.read(attachment);

      const y = findWatermarkY(image);

      if (y > 0) {
        image = image.crop(0, 0, image.getWidth(), y);

        attachment = await image.getBufferAsync("image/png");
        foundWatermark = true;
      }
    }

    files.push({
      attachment: await getAttachmentBufferOrStream(attachment),
      name: messageAttachment.name,
    });
  }

  // no need to delete + reupload post if there's no watermarked images
  if (!foundWatermark) {
    return;
  }

  await Promise.all([
    message.delete(),
    message.channel.send({
      content: `<@${message.author.id}> uploaded:\n${message.content}`,
      files,
    }),
  ]);
});

client.login(process.env.BOT_TOKEN);
