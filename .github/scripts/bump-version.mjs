import fs from "node:fs";

const versionPath = "VERSION";
const addonPath = "homeassistant/config.yaml";
const integrationPath = "custom_components/weather_app/manifest.json";
const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/;

const current = fs.readFileSync(versionPath, "utf8").trim();
const match = semverPattern.exec(current);

if (!match) {
  throw new Error(`Invalid release version in ${versionPath}: ${current}`);
}

const addon = fs.readFileSync(addonPath, "utf8");
const addonVersion = addon.match(/^version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];
const integration = JSON.parse(fs.readFileSync(integrationPath, "utf8"));

if (addonVersion !== current || integration.version !== current) {
  throw new Error(
    `Release versions must match: VERSION=${current}, add-on=${addonVersion}, integration=${integration.version}`,
  );
}

if (process.argv.includes("--check")) {
  console.log(current);
  process.exit(0);
}

const next = `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;

fs.writeFileSync(versionPath, `${next}\n`);
fs.writeFileSync(addonPath, addon.replace(/^version:.*$/m, `version: "${next}"`));
integration.version = next;
fs.writeFileSync(integrationPath, `${JSON.stringify(integration, null, 2)}\n`);

console.log(next);
