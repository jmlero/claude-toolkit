import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export function settingsPath(scope, cwd = process.cwd()) {
  if (scope === "user") return path.join(os.homedir(), ".claude", "settings.json");
  if (scope === "project") return path.join(cwd, ".claude", "settings.json");
  throw new Error(`Unknown scope: ${scope}`);
}

export function readSettings(scope, cwd) {
  const p = settingsPath(scope, cwd);
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    throw new Error(`Failed to parse ${p}: ${e.message}`);
  }
}

export function writeSettings(scope, data, cwd) {
  const p = settingsPath(scope, cwd);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
  return p;
}

// Registers the marketplace (always at user scope — marketplaces are global)
// and enables the plugin at the requested scope.
// Returns { alreadyEnabled, marketplaceAdded, scopeUsed, settingsFile }.
export function installPlugin({ pluginId, marketplace, scope, cwd }) {
  // 1. Marketplace registration is user-global
  const userSettings = readSettings("user");
  userSettings.extraKnownMarketplaces ??= {};
  let marketplaceAdded = false;
  if (!userSettings.extraKnownMarketplaces[marketplace.name]) {
    userSettings.extraKnownMarketplaces[marketplace.name] = {
      source: { source: "github", repo: marketplace.repo },
    };
    writeSettings("user", userSettings);
    marketplaceAdded = true;
  }

  // 2. enabledPlugins goes in the requested scope's settings
  const settings = readSettings(scope, cwd);
  settings.enabledPlugins ??= {};
  const key = `${pluginId}@${marketplace.name}`;
  const alreadyEnabled = settings.enabledPlugins[key] === true;
  if (!alreadyEnabled) {
    settings.enabledPlugins[key] = true;
    writeSettings(scope, settings, cwd);
  }

  return {
    alreadyEnabled,
    marketplaceAdded,
    scopeUsed: scope,
    settingsFile: settingsPath(scope, cwd),
  };
}

// Checks if a plugin is already enabled at either scope.
export function isPluginEnabled({ pluginId, marketplace, cwd }) {
  const key = `${pluginId}@${marketplace.name}`;
  for (const scope of ["user", "project"]) {
    try {
      const s = readSettings(scope, cwd);
      if (s?.enabledPlugins?.[key]) return scope;
    } catch {}
  }
  return null;
}
