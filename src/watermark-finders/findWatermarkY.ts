import Jimp from "jimp";
import findIfunnyY from "./ifunny";

const watermarkFinders = [findIfunnyY];

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
