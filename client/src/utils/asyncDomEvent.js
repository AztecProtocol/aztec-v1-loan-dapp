export default function asyncDomEvent(eventName, callback) {
  return new Promise((resolve, reject) => {
    document.addEventListener(eventName, async () => {
      const result = await callback();
      resolve(result);
    });
  });
}
