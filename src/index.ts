import {
  Attachment,
  ClientEvents,
  Client as DiscordClient,
  Message as DiscordMessage,
  IntentsBitField,
  OAuth2Scopes,
  Partials,
  PermissionFlagsBits,
} from "discord.js";
import findWatermarkY from "./watermark-finders/findWatermarkY";
import { useCatcher, isImageURL } from "./util";
import Jimp from "jimp";
import { config as configEnv } from "dotenv";

configEnv();

const client = new DiscordClient({
  intents: [
    IntentsBitField.Flags.MessageContent,
    // IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
  ],
  partials: [Partials.Message, Partials.Channel],
});

// helpers

function listenWithCatcher<K extends keyof ClientEvents>(event: K, listener) {
  client.on(event, useCatcher(listener));
}

// listeners

listenWithCatcher("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const inviteUrl = client.generateInvite({
    scopes: [OAuth2Scopes.Bot],
    permissions: [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.SendMessagesInThreads,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.AttachFiles,
    ],
  });

  console.log(`Invite with ${inviteUrl}`);
});

listenWithCatcher("messageCreate", async (message: DiscordMessage) => {
  if (
    process.env.DEBUG_CHANNEL &&
    process.env.DEBUG_CHANNEL != message.channel.id
  ) {
    return;
  }

  // ignore self
  if (message.author.id == client.user.id) {
    return;
  }

  let foundWatermark = false;
  const files: (Attachment | Buffer)[] = [];

  for (const [_id, inputAttachment] of message.attachments) {
    if (!isImageURL(inputAttachment.url)) {
      files.push(inputAttachment);
      continue;
    }

    let image = await Jimp.read(inputAttachment.url);

    const y = findWatermarkY(image);

    if (y == -1) {
      files.push(inputAttachment);
      continue;
    }

    image = image.crop(0, 0, image.getWidth(), y);
    foundWatermark = true;

    const attachment = await image.getBufferAsync("image/png");
    files.push(attachment);
  }

  // no need to delete + reupload post if there's no watermarked images
  if (!foundWatermark) {
    return;
  }

  const outgoingMessage = {
    content: `<@${message.author.id}> uploaded:\n${message.content}`,
    files,
  };

  let outgoingPromise = message.thread
    ? message.thread.send(outgoingMessage)
    : message.channel.send(outgoingMessage);

  await Promise.all([message.delete(), outgoingPromise]);
});

client.login(process.env.BOT_TOKEN);
