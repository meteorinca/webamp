import WebampLazy from "./webamp/js/webampLazy";
import { getWebampConfig } from "./webampConfig";
// @ts-ignore
import isButterchurnSupported from "butterchurn/dist/isSupported.min";

async function main() {
  const appElement = document.getElementById("app") as HTMLDivElement;

  if (!WebampLazy.browserIsSupported()) {
    appElement.innerHTML = `
      <div style="color: white; text-align: center; margin-top: 50px; font-family: sans-serif;">
        <h2>Browser Not Supported</h2>
        <p>Your browser does not support Web Audio API or WebGL required for Webamp.</p>
      </div>
    `;
    return;
  }

  const butterchurnSupported = isButterchurnSupported();
  const config = await getWebampConfig(butterchurnSupported);
  const webamp = new WebampLazy(config);

  // Expose webamp globally for visualizer debugging/testing
  (window as any).__webamp = webamp;

  await webamp.renderWhenReady(appElement);
  console.log("🚀 YoYo Webamp & Visualizer initialized!");
}

main();
