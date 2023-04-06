import test from "ava";
import fs from "fs/promises";
import Jimp from "jimp";

import findIfunnyWatermarkY from "../src/watermark-finders/ifunny";
import findRedditWatermarkY from "../src/watermark-finders/reddit";

let ifunnyImages: Jimp[] = [];
let redditImages: Jimp[] = [];
let noWatermarkImages: Jimp[] = [];

async function loadImages(folderPath: string): Promise<Jimp[]> {
  const imagePaths = await fs.readdir(folderPath);
  const imagePromises = imagePaths.map((path) => Jimp.read(folderPath + path));

  return await Promise.all(imagePromises);
}

test.before(async () => {
  ifunnyImages = await loadImages("tests/files/ifunny/");
  redditImages = await loadImages("tests/files/reddit/");
  noWatermarkImages = await loadImages("tests/files/no-watermark/");
});

function countPassing(
  images: Jimp[],
  searchFunc: (image: Jimp) => number
): number {
  return images.filter((image) => searchFunc(image) > 0).length;
}

type PassingResults = {
  reddit: number;
  ifunny: number;
  noWatermark: number;
};

function countEachPassing(
  testName: string,
  searchFunc: (image: Jimp) => number
): PassingResults {
  console.log(`-- ${testName} test, with ifunny images`);
  const ifunny = countPassing(ifunnyImages, searchFunc);

  console.log(`-- ${testName} test, with reddit images`);
  const reddit = countPassing(redditImages, searchFunc);

  console.log(`-- ${testName} test, with no-watermark images`);
  const noWatermark = countPassing(noWatermarkImages, searchFunc);

  return {
    ifunny,
    reddit,
    noWatermark,
  };
}

test("ifunny", (t) => {
  const result = countEachPassing(t.title, findIfunnyWatermarkY);

  t.is(result.ifunny, ifunnyImages.length, "expect all ifunny passing");
  t.is(result.reddit, 0, "expect 0 reddit passing");
  t.is(result.noWatermark, 0, "expect 0 no-watermark passing");
});

test("reddit", (t) => {
  const result = countEachPassing(t.title, findRedditWatermarkY);

  t.is(result.reddit, redditImages.length, "expect all reddit passing");
  t.is(result.ifunny, 0, "expect 0 ifunny passing");
  t.is(result.noWatermark, 0, "expect 0 no-watermark passing");
});
