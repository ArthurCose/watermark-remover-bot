import Jimp from "jimp";
import { logIfDebug } from "../util";

// includes white
function isRedditGrey({ r, g, b, a }) {
  return r >= 39 && r == g && r == g && b >= r && b <= r + 2 && a == 255;
}

function isRedditBrandOrange({ r, g, b, a }) {
  return r == 255 && g == 69 && b == 0 && a == 255;
}

function isRedditWatermark(image: Jimp): boolean {
  const imageWidth = image.getWidth();
  const imageHeight = image.getHeight();

  // this is to make sure we dont crop images with pure black bars
  let containsWatermark = false;

  if (imageHeight < 33) {
    return false;
  }

  const jpegPadding = 3;
  const logoStart = imageWidth - 59 - jpegPadding;
  const logoEnd = imageWidth - 11 + jpegPadding;

  let error = 0;

  for (let y = imageHeight - 33 + jpegPadding; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const color = Jimp.intToRGBA(image.getPixelColor(x, y));

      const inLogo = x >= logoStart && x < logoEnd;
      const isGrey = isRedditGrey(color);

      if (!inLogo && !isGrey) {
        console.log("failed reddit test on:", x, y, color);
        return false;
      }

      if (inLogo) {
        if (isRedditBrandOrange(color)) {
          containsWatermark = true;
        } else if (!isGrey) {
          logIfDebug("accumulated error from:", x, y, color);
          error++;
        }
      }
    }
  }

  // we accumulate error in a region of 54x33 (1782 pixels)
  // expect some error from jpeg and color blending
  const passed = containsWatermark && error < 300 && error > 150;

  console.log(
    `${passed ? "passed" : "failed"} reddit test with error: ${error}`
  );

  return passed;
}

function findWatermarkY(image: Jimp): number {
  return isRedditWatermark(image) ? image.getHeight() - 33 : -1;
}

export default findWatermarkY;
