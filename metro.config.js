import { getDefaultConfig } from "expo/metro-config.js";
import { withNativeWind } from "nativewind/dist/metro/index.js";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

export default withNativeWind(config, {
  input: "./global.css",
});
