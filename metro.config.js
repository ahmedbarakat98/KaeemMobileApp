const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix Supabase / ws / stream issue in Expo React Native
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
