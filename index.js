/**
 * RouterOS API Client
 * A Node.js module for interacting with MikroTik RouterOS API
 */

const RouterOSClient = require("./lib/client");
const commands = require("./lib/commands");

// Export the main client class
module.exports = RouterOSClient;

// Export commands as a property
module.exports.commands = commands;
