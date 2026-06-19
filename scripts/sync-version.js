import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const tauriConf = resolve(root, "src-tauri/tauri.conf.json");
writeFileSync(
  tauriConf,
  readFileSync(tauriConf, "utf8").replace(/"version": "[^"]+"/, `"version": "${version}"`),
);

const cargo = resolve(root, "src-tauri/Cargo.toml");
writeFileSync(
  cargo,
  readFileSync(cargo, "utf8").replace(/^version = "[^"]+"/m, `version = "${version}"`),
);

console.log(`Synced version ${version} → tauri.conf.json, Cargo.toml`);
