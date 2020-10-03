function useCatcher(fn) {
  return function (...args) {
    try {
      const result = fn(...args);

      if (result && result.catch) {
        result.catch(console.error);
      }

      return result;
    } catch (err) {
      console.error(err);
    }
  };
}

function isImageURL(url: string) {
  return url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg");
}

export { useCatcher, isImageURL };
