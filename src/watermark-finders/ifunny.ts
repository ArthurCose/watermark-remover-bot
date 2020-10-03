import Jimp from "jimp";

function isIfunnyBlack({ r, g, b, a }) {
  return r <= 60 && g <= 60 && b <= 60 && a == 255;
}

function isIfunnyWatermark(image: Jimp): boolean {
  const imageWidth = image.getWidth();
  const imageHeight = image.getHeight();

  // this is to make sure we dont crop images with pure black bars
  let containsWatermark = false;

  if (imageHeight < 20) {
    return false;
  }

  const jpegPadding = 3;
  const logoStart = imageWidth - 135 - jpegPadding;
  const logoEnd = imageWidth - 7 + jpegPadding;

  for (let y = imageHeight - 20 + jpegPadding; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const color = Jimp.intToRGBA(image.getPixelColor(x, y));

      const inLogo = x >= logoStart && x < logoEnd;
      const isBlack = isIfunnyBlack(color);

      if (!inLogo && !isBlack) {
        console.log("failed on:", x, y, color);
        return false;
      }

      if (inLogo && !isBlack) {
        containsWatermark = true;
      }
    }
  }

  return containsWatermark;
}

function findWatermarkY(image: Jimp): number {
  return isIfunnyWatermark(image) ? image.getHeight() - 20 : -1;
}

export default findWatermarkY;
