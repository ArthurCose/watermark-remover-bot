import test, { before } from "ava";
import fs from "fs-extra";
import Jimp from "jimp";

import findIfunnyWatermarkY from "../src/watermark-finders/ifunny";
import findRedditWatermarkY from "../src/watermark-finders/reddit";

const images = [];

before(async () => {
  const folderPath = "tests/files/";
  const imagePaths = await fs.readdir(folderPath);
  const imagePromises = imagePaths.map((path) => Jimp.read(folderPath + path));
  const imagesPromise = await Promise.all(imagePromises);

  images.push(...imagesPromise);
});

test("ifunny", (t) => {
  const passing = images.filter((image) => findIfunnyWatermarkY(image) > 0);
  t.is(passing.length, 5, "expect 5 passing");
});

test("reddit", (t) => {
  const passing = images.filter((image) => findRedditWatermarkY(image) > 0);
  t.is(passing.length, 1, "expect 1 passing");
});
