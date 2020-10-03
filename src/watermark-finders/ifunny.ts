import Jimp from "jimp";
import { within, logIfDebug } from "../util";

function isIfunnyBrandYellow({ r, g, b, a }) {
  return r == 255 && within(205 - g, 10) && within(70 - b, 15) && a == 255;
}

function isIfunnyYellow({ r, g, b, a }) {
  return r > 120 && g > 100 && b < (r + g) / 3 && a == 255;
}

function isIfunnyBlack({ r, g, b, a }) {
  return r <= 60 && g <= 60 && b <= 60 && a == 255;
}

function isIfunnyWatermark(image: Jimp): boolean {
  const imageWidth = image.getWidth();
  const imageHeight = image.getHeight();

  // this is to make sure we dont crop images with pure black bars
  let containsBrandColor = false;

  if (imageHeight < 20) {
    return false;
  }

  const jpegPadding = 3;
  const logoStart = imageWidth - 135 - jpegPadding;
  const logoEnd = imageWidth - 7 + jpegPadding;

  let error = 0;

  for (let y = imageHeight - 20 + jpegPadding; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const color = Jimp.intToRGBA(image.getPixelColor(x, y));

      const inLogo = x >= logoStart && x < logoEnd;
      const isBlack = isIfunnyBlack(color);

      if (!inLogo && !isBlack) {
        console.log("failed ifunny test on:", x, y, color);
        return false;
      }

      if (inLogo) {
        if (isIfunnyBrandYellow(color)) {
          containsBrandColor = true;
        } else if (!isBlack && !isIfunnyYellow(color)) {
          logIfDebug("accumulated error from:", x, y, color);
          error++;
        }
      }
    }
  }

  // we accumulate error in a region of 132x20 (2640 pixels)
  // expect some error from jpeg and color blending
  const passed = containsBrandColor && error < 300 && error > 200;

  console.log(
    `${passed ? "passed" : "failed"} reddit test with error: ${error},`,
    ` contains brand color: ${containsBrandColor}`
  );

  return passed;
}

function findWatermarkY(image: Jimp): number {
  return isIfunnyWatermark(image) ? image.getHeight() - 20 : -1;
}

export default findWatermarkY;
