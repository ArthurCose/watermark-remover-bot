import Jimp from "jimp";
import findIfunnyY from "./ifunny";
import findRedditY from "./reddit";

const watermarkFinders = [findIfunnyY, findRedditY];

function findWatermarkY(image: Jimp): number {
  for (const findY of watermarkFinders) {
    const y = findY(image);

    if (y > -1) {
      return y;
    }
  }

  return -1;
}

export default findWatermarkY;
