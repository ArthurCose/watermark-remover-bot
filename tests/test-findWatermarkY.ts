import test, { before } from "ava";
import fs from "fs-extra";
import Jimp from "jimp";

import findWatermarkY from "../src/watermark-finders/findWatermarkY";

const images = [];

before(async () => {
  const folderPath = "tests/files/";
  const imagePaths = await fs.readdir(folderPath);
  const imagePromises = imagePaths.map((path) => Jimp.read(folderPath + path));
  const imagesPromise = await Promise.all(imagePromises);

  images.push(...imagesPromise);
});

test("ifunny", async (t) => {
  const passing = images.filter((image) => findWatermarkY(image) > 0);
  t.is(passing.length, 5, "expect 5 passing");
});
