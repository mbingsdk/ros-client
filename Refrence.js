/**
 * RouterOS API Commands Reference
 *
 * This file contains common RouterOS commands that can be used with the API client.
 * Each command is shown in the format you would use with the send() method.
 */

// System Commands
const SYSTEM_COMMANDS = {
  // System identity
  getIdentity: ["/system/identity/print"],
  setIdentity: (name) => ["/system/identity/set", `=name=${name}`],

  // System resources
  getResources: ["/system/resource/print"],

  // System routerboard
  getRouterboard: ["/system/routerboard/print"],

  // System health
  getHealth: ["/system/health/print"],

  // System clock
  getClock: ["/system/clock/print"],
  setClock: (dateTime) => [
    "/system/clock/set",
    `=date=${dateTime.date}`,
    `=time=${dateTime.time}`,
  ],

  // System history
  getHistory: ["/system/history/print"],

  // System license
  getLicense: ["/system/license/print"],

  // System logging
  getLogs: ["/log/print"],
  getLogTopics: ["/system/logging/print"],
  addLogTopic: (topic, action) => [
    "/system/logging/add",
    `=topics=${topic}`,
    `=action=${action}`,
  ],

  // System users
  getUsers: ["/user/print"],
  addUser: (name, password, group) => [
    "/user/add",
    `=name=${name}`,
    `=password=${password}`,
    `=group=${group}`,
  ],
  removeUser: (id) => ["/user/remove", `=.id=${id}`],

  // System reboot
  reboot: ["/system/reboot"],

  // System shutdown
  shutdown: ["/system/shutdown"],

  // System upgrade
  checkForUpdates: ["/system/package/update/check-for-updates"],
  upgradePackages: ["/system/package/update/install"],
};

// Interface Commands
const INTERFACE_COMMANDS = {
  // Get all interfaces
  getAll: ["/interface/print"],

  // Get specific interface
  getByType: (type) => ["/interface/print", `?type=${type}`],

  // Enable/disable interface
  enable: (id) => ["/interface/enable", `=.id=${id}`],
  disable: (id) => ["/interface/disable", `=.id=${id}`],

  // Get interface statistics
  getStatistics: ["/interface/monitor-traffic"],

  // Ethernet interfaces
  getEthernet: ["/interface/ethernet/print"],
  setEthernetMtu: (id, mtu) => [
    "/interface/ethernet/set",
    `=.id=${id}`,
    `=mtu=${mtu}`,
  ],

  // Wireless interfaces
  getWireless: ["/interface/wireless/print"],
  setWirelessSsid: (id, ssid) => [
    "/interface/wireless/set",
    `=.id=${id}`,
    `=ssid=${ssid}`,
  ],

  // Bridge interfaces
  getBridges: ["/interface/bridge/print"],
  addBridge: (name) => ["/interface/bridge/add", `=name=${name}`],
  addBridgePort: (bridge, interface) => [
    "/interface/bridge/port/add",
    `=bridge=${bridge}`,
    `=interface=${interface}`,
  ],

  // VLAN interfaces
  getVlans: ["/interface/vlan/print"],
  addVlan: (name, vlanId, interface) => [
    "/interface/vlan/add",
    `=name=${name}`,
    `=vlan-id=${vlanId}`,
    `=interface=${interface}`,
  ],
};

// IP Commands
const IP_COMMANDS = {
  // IP addresses
  getAddresses: ["/ip/address/print"],
  addAddress: (address, interface) => [
    "/ip/address/add",
    `=address=${address}`,
    `=interface=${interface}`,
  ],
  removeAddress: (id) => ["/ip/address/remove", `=.id=${id}`],

  // DHCP server
  getDhcpServer: ["/ip/dhcp-server/print"],
  addDhcpServer: (name, interface, addressPool) => [
    "/ip/dhcp-server/add",
    `=name=${name}`,
    `=interface=${interface}`,
    `=address-pool=${addressPool}`,
  ],

  // DHCP leases
  getDhcpLeases: ["/ip/dhcp-server/lease/print"],

  // DNS
  getDnsSettings: ["/ip/dns/print"],
  setDnsServers: (servers) => ["/ip/dns/set", `=servers=${servers}`],
  getDnsCache: ["/ip/dns/cache/print"],

  // Firewall
  getFirewallFilter: ["/ip/firewall/filter/print"],
  addFirewallRule: (chain, action, params) => {
    const command = [
      "/ip/firewall/filter/add",
      `=chain=${chain}`,
      `=action=${action}`,
    ];
    for (const [key, value] of Object.entries(params)) {
      command.push(`=${key}=${value}`);
    }
    return command;
  },

  // NAT
  getNatRules: ["/ip/firewall/nat/print"],
  addNatRule: (chain, action, params) => {
    const command = [
      "/ip/firewall/nat/add",
      `=chain=${chain}`,
      `=action=${action}`,
    ];
    for (const [key, value] of Object.entries(params)) {
      command.push(`=${key}=${value}`);
    }
    return command;
  },

  // Routes
  getRoutes: ["/ip/route/print"],
  addRoute: (dst, gateway) => [
    "/ip/route/add",
    `=dst-address=${dst}`,
    `=gateway=${gateway}`,
  ],

  // Services
  getServices: ["/ip/service/print"],
  enableService: (name) => ["/ip/service/set", `=name=${name}`, "=disabled=no"],
  disableService: (name) => [
    "/ip/service/set",
    `=name=${name}`,
    "=disabled=yes",
  ],
};

// Queue Commands
const QUEUE_COMMANDS = {
  // Simple queues
  getSimpleQueues: ["/queue/simple/print"],
  addSimpleQueue: (name, target, maxLimit) => [
    "/queue/simple/add",
    `=name=${name}`,
    `=target=${target}`,
    `=max-limit=${maxLimit}`,
  ],
  updateSimpleQueue: (id, params) => {
    const command = ["/queue/simple/set", `=.id=${id}`];
    for (const [key, value] of Object.entries(params)) {
      command.push(`=${key}=${value}`);
    }
    return command;
  },
  removeSimpleQueue: (id) => ["/queue/simple/remove", `=.id=${id}`],

  // Tree queues
  getTreeQueues: ["/queue/tree/print"],

  // Queue types
  getQueueTypes: ["/queue/type/print"],
};

// PPP Commands
const PPP_COMMANDS = {
  // PPP profiles
  getProfiles: ["/ppp/profile/print"],

  // PPP secrets
  getSecrets: ["/ppp/secret/print"],
  addSecret: (name, password, service) => [
    "/ppp/secret/add",
    `=name=${name}`,
    `=password=${password}`,
    `=service=${service}`,
  ],

  // PPP active
  getActive: ["/ppp/active/print"],
};

// Tools Commands
const TOOLS_COMMANDS = {
  // Ping
  ping: (address, count = 4) => [
    "/ping",
    `=address=${address}`,
    `=count=${count}`,
  ],

  // Traceroute
  traceroute: (address) => ["/tool/traceroute", `=address=${address}`],

  // Bandwidth test
  bandwidthTest: (address, direction = "both") => [
    "/tool/bandwidth-test",
    `=address=${address}`,
    `=direction=${direction}`,
  ],

  // Traffic monitor
  trafficMonitor: (interface) => [
    "/interface/monitor-traffic",
    `=interface=${interface}`,
  ],

  // Profile
  getCpuProfile: (time = "10s") => ["/tool/profile", `=time=${time}`],

  // Torch (real-time traffic monitoring)
  torch: (interface) => ["/tool/torch", `=interface=${interface}`],
};

// Wireless Commands
const WIRELESS_COMMANDS = {
  // Get wireless interfaces
  getInterfaces: ["/interface/wireless/print"],

  // Get wireless registration table (connected clients)
  getRegistrationTable: ["/interface/wireless/registration-table/print"],

  // Scan for wireless networks
  scan: (interface) => ["/interface/wireless/scan", `=interface=${interface}`],

  // Get security profiles
  getSecurityProfiles: ["/interface/wireless/security-profiles/print"],

  // Add security profile
  addSecurityProfile: (name, mode, authentication, encryption, passphrase) => [
    "/interface/wireless/security-profiles/add",
    `=name=${name}`,
    `=mode=${mode}`,
    `=authentication-types=${authentication}`,
    `=encryption=${encryption}`,
    `=wpa-pre-shared-key=${passphrase}`,
    `=wpa2-pre-shared-key=${passphrase}`,
  ],
};
