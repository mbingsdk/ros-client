/**
 * RouterOS API Commands Reference Documentation
 * 
 * This file contains a comprehensive reference of all RouterOS API commands
 * organized by category with detailed JSDoc documentation.
 * 
 * Each command is provided as either:
 * - Static array for simple commands: ["/path/to/command"]
 * - Function for parameterized commands: (param) => ["/path/to/command", "=param=value"]
 * 
 * Usage with RouterOS API Client:
 * const result = await api.send(SYSTEM_COMMANDS.getIdentity);
 * const result = await api.send(SYSTEM_COMMANDS.setIdentity("new-name"));
 * 
 * @version 1.1.0
 * @author AviStudio (https://github.com/AviStudio)
 * @contributor RouterOS API Client Library
 */

/**
 * RouterOS API Commands Reference (with JSDoc)
 *
 * Each command is a function or array, returning the proper array format for the MikroTik API.
 * Use these with your API client: send(...command)
 */

// ===================== SYSTEM COMMANDS =====================

/**
 * System-level commands for basic info, management, and users.
 */
const SYSTEM_COMMANDS = {
  /**
   * Get system identity (hostname).
   * @returns {string[]} Command array.
   */
  getIdentity: ["/system/identity/print"],

  /**
   * Set system identity (hostname).
   * @param {string} name - The new identity.
   * @returns {string[]} Command array.
   */
  setIdentity: (name) => {
    if (!name) throw new Error("Name is required for setIdentity");
    return ["/system/identity/set", `=name=${name}`];
  },

  /**
   * Get system resource usage and details.
   * @returns {string[]} Command array.
   */
  getResources: ["/system/resource/print"],

  /**
   * Get routerboard hardware info.
   * @returns {string[]} Command array.
   */
  getRouterboard: ["/system/routerboard/print"],

  /**
   * Get system health (voltages, temperature, etc).
   * @returns {string[]} Command array.
   */
  getHealth: ["/system/health/print"],

  /**
   * Get current system date/time.
   * @returns {string[]} Command array.
   */
  getClock: ["/system/clock/print"],

  /**
   * Set system date and time.
   * @param {{date: string, time: string}} param0 - Object with 'date' (YYYY-MM-DD) and 'time' (HH:MM:SS).
   * @returns {string[]} Command array.
   */
  setClock: ({ date, time }) => {
    if (!date || !time)
      throw new Error("Date and time are required for setClock");
    return ["/system/clock/set", `=date=${date}`, `=time=${time}`];
  },

  /**
   * Get command history.
   * @returns {string[]} Command array.
   */
  getHistory: ["/system/history/print"],

  /**
   * Get system license details.
   * @returns {string[]} Command array.
   */
  getLicense: ["/system/license/print"],

  /**
   * Get system log entries.
   * @returns {string[]} Command array.
   */
  getLogs: ["/log/print"],

  /**
   * Get logging topics.
   * @returns {string[]} Command array.
   */
  getLogTopics: ["/system/logging/print"],

  /**
   * Add a new logging topic/action.
   * @param {string} topic - The logging topic (e.g., "firewall").
   * @param {string} action - The action (e.g., "echo", "memory", etc).
   * @returns {string[]} Command array.
   */
  addLogTopic: (topic, action) => {
    if (!topic || !action)
      throw new Error("Topic and action are required for addLogTopic");
    return ["/system/logging/add", `=topics=${topic}`, `=action=${action}`];
  },

  /**
   * Get all users.
   * @returns {string[]} Command array.
   */
  getUsers: ["/user/print"],

  /**
   * Add a new user.
   * @param {string} name - Username.
   * @param {string} password - User's password.
   * @param {string} group - User group (e.g., "full").
   * @returns {string[]} Command array.
   */
  addUser: (name, password, group) => {
    if (!name || !password || !group)
      throw new Error("Name, password, and group are required for addUser");
    return [
      "/user/add",
      `=name=${name}`,
      `=password=${password}`,
      `=group=${group}`,
    ];
  },

  /**
   * Remove a user by ID.
   * @param {string} id - User's .id (from /user/print).
   * @returns {string[]} Command array.
   */
  removeUser: (id) => {
    if (!id) throw new Error("User ID is required for removeUser");
    return ["/user/remove", `=.id=${id}`];
  },

  /**
   * Reboot the router.
   * @returns {string[]} Command array.
   */
  reboot: ["/system/reboot"],

  /**
   * Shutdown the router.
   * @returns {string[]} Command array.
   */
  shutdown: ["/system/shutdown"],

  /**
   * Check for RouterOS package updates.
   * @returns {string[]} Command array.
   */
  checkForUpdates: ["/system/package/update/check-for-updates"],

  /**
   * Install available updates.
   * @returns {string[]} Command array.
   */
  upgradePackages: ["/system/package/update/install"],
};

// ===================== INTERFACE COMMANDS =====================

/**
 * Commands for working with network interfaces, bridges, VLANs, etc.
 */
const INTERFACE_COMMANDS = {
  /**
   * Get all interfaces.
   * @returns {string[]} Command array.
   */
  getAll: ["/interface/print"],

  /**
   * Get interfaces of a specific type (ether, vlan, wireless, etc).
   * @param {string} type - Interface type.
   * @returns {string[]} Command array.
   */
  getByType: (type) => {
    if (!type) throw new Error("Type is required for getByType");
    return ["/interface/print", `?type=${type}`];
  },

  /**
   * Enable an interface by ID.
   * @param {string} id - Interface .id.
   * @returns {string[]} Command array.
   */
  enable: (id) => {
    if (!id) throw new Error("Interface ID is required for enable");
    return ["/interface/enable", `=.id=${id}`];
  },

  /**
   * Disable an interface by ID.
   * @param {string} id - Interface .id.
   * @returns {string[]} Command array.
   */
  disable: (id) => {
    if (!id) throw new Error("Interface ID is required for disable");
    return ["/interface/disable", `=.id=${id}`];
  },

  /**
   * Monitor traffic for an interface (real-time).
   * @param {string} iface - Interface name.
   * @returns {string[]} Command array.
   */
  monitorTraffic: (iface) => {
    if (!iface)
      throw new Error("Interface name is required for monitorTraffic");
    return ["/interface/monitor-traffic", `=interface=${iface}`];
  },

  /**
   * Get all ethernet interfaces.
   * @returns {string[]} Command array.
   */
  getEthernet: ["/interface/ethernet/print"],

  /**
   * Set MTU for ethernet interface.
   * @param {string} id - Ethernet interface .id.
   * @param {string|number} mtu - MTU value.
   * @returns {string[]} Command array.
   */
  setEthernetMtu: (id, mtu) => {
    if (!id || !mtu) throw new Error("ID and MTU required for setEthernetMtu");
    return ["/interface/ethernet/set", `=.id=${id}`, `=mtu=${mtu}`];
  },

  /**
   * Get all bridges.
   * @returns {string[]} Command array.
   */
  getBridges: ["/interface/bridge/print"],

  /**
   * Add a bridge.
   * @param {string} name - Bridge name.
   * @returns {string[]} Command array.
   */
  addBridge: (name) => {
    if (!name) throw new Error("Bridge name required");
    return ["/interface/bridge/add", `=name=${name}`];
  },

  /**
   * Add a port to a bridge.
   * @param {string} bridge - Bridge name or ID.
   * @param {string} iface - Interface to add.
   * @returns {string[]} Command array.
   */
  addBridgePort: (bridge, iface) => {
    if (!bridge || !iface) throw new Error("Bridge and interface required");
    return [
      "/interface/bridge/port/add",
      `=bridge=${bridge}`,
      `=interface=${iface}`,
    ];
  },

  /**
   * Get all VLANs.
   * @returns {string[]} Command array.
   */
  getVlans: ["/interface/vlan/print"],

  /**
   * Add a VLAN interface.
   * @param {string} name - VLAN name.
   * @param {string|number} vlanId - VLAN ID.
   * @param {string} iface - Parent interface.
   * @returns {string[]} Command array.
   */
  addVlan: (name, vlanId, iface) => {
    if (!name || !vlanId || !iface)
      throw new Error("Name, vlanId, and interface required");
    return [
      "/interface/vlan/add",
      `=name=${name}`,
      `=vlan-id=${vlanId}`,
      `=interface=${iface}`,
    ];
  },
};

// ===================== IP COMMANDS =====================

/**
 * IP-level commands: addresses, DHCP, DNS, firewall, NAT, etc.
 */
const IP_COMMANDS = {
  /**
   * Get all IP addresses.
   * @returns {string[]} Command array.
   */
  getAddresses: ["/ip/address/print"],

  /**
   * Add an IP address to an interface.
   * @param {string} address - IP/CIDR (e.g. 192.168.88.10/24).
   * @param {string} iface - Interface name.
   * @returns {string[]} Command array.
   */
  addAddress: (address, iface) => {
    if (!address || !iface) throw new Error("Address and interface required");
    return ["/ip/address/add", `=address=${address}`, `=interface=${iface}`];
  },

  /**
   * Remove an IP address by ID.
   * @param {string} id - Address .id.
   * @returns {string[]} Command array.
   */
  removeAddress: (id) => {
    if (!id) throw new Error("ID required for removeAddress");
    return ["/ip/address/remove", `=.id=${id}`];
  },

  /**
   * Get all DHCP servers.
   * @returns {string[]} Command array.
   */
  getDhcpServer: ["/ip/dhcp-server/print"],

  /**
   * Add a DHCP server.
   * @param {string} name - Server name.
   * @param {string} iface - Interface.
   * @param {string} pool - Address pool.
   * @returns {string[]} Command array.
   */
  addDhcpServer: (name, iface, pool) => {
    if (!name || !iface || !pool)
      throw new Error("Name, interface, addressPool required");
    return [
      "/ip/dhcp-server/add",
      `=name=${name}`,
      `=interface=${iface}`,
      `=address-pool=${pool}`,
    ];
  },

  /**
   * Get all DHCP leases.
   * @returns {string[]} Command array.
   */
  getDhcpLeases: ["/ip/dhcp-server/lease/print"],

  /**
   * Add a DHCP lease.
   * @param {string} address - IP address to lease.
   * @param {string} macAddress - MAC address of the device.
   * @param {string} [server] - (Optional) DHCP server name.
   * @param {string} [comment] - (Optional) Comment (will be uppercased).
   * @returns {string[]} Command array.
   */
  addDhcpLease: (address, macAddress, server, comment) => {
    if (!address || !macAddress)
      throw new Error("Address and MAC address required for addDhcpLease");
    const command = [
      "/ip/dhcp-server/lease/add",
      `=address=${address}`,
      `=mac-address=${macAddress}`,
    ];
    if (server) command.push(`=server=${server}`);
    if (comment) command.push(`=comment=${comment.toUpperCase()}`);
    return command;
  },

  /**
   * Update a DHCP lease by ID.
   * @param {string} id - Lease .id (from /ip/dhcp-server/lease/print).
   * @param {Object} params - Lease parameters to set/update.
   * @param {string} [params.address] - IP address to set.
   * @param {string} [params.macAddress] - MAC address to set.
   * @param {string} [params.server] - DHCP server name.
   * @param {string} [params.comment] - Comment (will be uppercased).
   * @param {string} [params.disabled] - "yes" or "no" to enable/disable lease.
   * @returns {string[]} Command array.
   */
  setDhcpLease: (id, params = {}) => {
    if (!id) throw new Error("Lease ID required for setDhcpLease");
    const command = ["/ip/dhcp-server/lease/set", `=.id=${id}`];
    for (const [key, value] of Object.entries(params)) {
      if (key === "comment" && typeof value === "string") {
        command.push(`=comment=${value.toUpperCase()}`);
      } else {
        command.push(`=${key}=${value}`);
      }
    }
    return command;
  },

  /**
   * Remove a DHCP lease by ID.
   * @param {string} id - Lease .id.
   * @returns {string[]} Command array.
   */
  removeDhcpLease: (id) => {
    if (!id) throw new Error("Lease ID required for removeDhcpLease");
    return ["/ip/dhcp-server/lease/remove", `=.id=${id}`];
  },

  /**
   * Get DNS server settings.
   * @returns {string[]} Command array.
   */
  getDnsSettings: ["/ip/dns/print"],

  /**
   * Set DNS servers.
   * @param {string} servers - DNS servers (comma separated).
   * @returns {string[]} Command array.
   */
  setDnsServers: (servers) => {
    if (!servers) throw new Error("Servers required for setDnsServers");
    return ["/ip/dns/set", `=servers=${servers}`];
  },

  /**
   * Get DNS cache entries.
   * @returns {string[]} Command array.
   */
  getDnsCache: ["/ip/dns/cache/print"],

  /**
   * Get firewall filter rules.
   * @returns {string[]} Command array.
   */
  getFirewallFilter: ["/ip/firewall/filter/print"],

  /**
   * Add a firewall filter rule.
   * @param {string} chain - Chain name (input, forward, output).
   * @param {string} action - Action (accept, drop, etc).
   * @param {Object} params - Additional parameters (src-address, dst-address, comment, etc).
   * @returns {string[]} Command array.
   */
  addFirewallRule: (chain, action, params = {}) => {
    if (!chain || !action)
      throw new Error("Chain and action required for addFirewallRule");
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

  /**
   * Get NAT rules.
   * @returns {string[]} Command array.
   */
  getNatRules: ["/ip/firewall/nat/print"],

  /**
   * Add a NAT rule.
   * @param {string} chain - Chain name.
   * @param {string} action - Action (src-nat, dst-nat, masquerade, etc).
   * @param {Object} params - Additional parameters (src-address, dst-address, etc).
   * @returns {string[]} Command array.
   */
  addNatRule: (chain, action, params = {}) => {
    if (!chain || !action)
      throw new Error("Chain and action required for addNatRule");
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

  /**
   * Get all routes.
   * @returns {string[]} Command array.
   */
  getRoutes: ["/ip/route/print"],

  /**
   * Add a route.
   * @param {string} dst - Destination (e.g. 0.0.0.0/0).
   * @param {string} gateway - Gateway IP.
   * @returns {string[]} Command array.
   */
  addRoute: (dst, gateway) => {
    if (!dst || !gateway)
      throw new Error("Destination and gateway required for addRoute");
    return ["/ip/route/add", `=dst-address=${dst}`, `=gateway=${gateway}`];
  },

  /**
   * Get IP service list (API, Winbox, etc).
   * @returns {string[]} Command array.
   */
  getServices: ["/ip/service/print"],

  /**
   * Enable an IP service by name.
   * @param {string} name - Service name.
   * @returns {string[]} Command array.
   */
  enableService: (name) => {
    if (!name) throw new Error("Service name required");
    return ["/ip/service/set", `=name=${name}`, "=disabled=no"];
  },

  /**
   * Disable an IP service by name.
   * @param {string} name - Service name.
   * @returns {string[]} Command array.
   */
  disableService: (name) => {
    if (!name) throw new Error("Service name required");
    return ["/ip/service/set", `=name=${name}`, "=disabled=yes"];
  },

  /**
   * Add an address to a specific firewall address-list.
   * @param {string} list - The address-list name.
   * @param {string} address - The IP address to add.
   * @param {string} [comment] - Optional comment for the entry (will be uppercased).
   * @returns {string[]} API command array.
   */
  addToAddressList: (list, address, comment) => {
    if (!list || !address)
      throw new Error("Address-list name and address are required");
    const command = [
      "/ip/firewall/address-list/add",
      `=list=${list}`,
      `=address=${address}`,
    ];
    if (comment) command.push(`=comment=${comment.toUpperCase()}`);
    return command;
  },

  /**
   * Update an address-list entry by ID.
   * @param {string} id - The .id of the address-list entry.
   * @param {Object} params - Parameters to update (e.g. {address, list, comment, disabled}).
   * @param {string} [params.address] - New IP address for the entry.
   * @param {string} [params.list] - Address-list name (to move entry).
   * @param {string} [params.comment] - Comment (will be uppercased).
   * @param {string} [params.disabled] - "yes" or "no" to disable/enable this entry.
   * @returns {string[]} API command array.
   *
   * @example
   * // Update address and comment
   * setAddressList("*8", { address: "192.168.88.201", comment: "permanent" });
   */
  setAddressList: (id, params = {}) => {
    if (!id) throw new Error("Address-list ID required for setAddressList");
    const command = ["/ip/firewall/address-list/set", `=.id=${id}`];
    for (const [key, value] of Object.entries(params)) {
      if (key === "comment" && typeof value === "string") {
        command.push(`=comment=${value.toUpperCase()}`);
      } else {
        command.push(`=${key}=${value}`);
      }
    }
    return command;
  },

  /**
   * Remove an address-list entry by ID.
   * @param {string} id - The .id of the address-list entry to remove.
   * @returns {string[]} API command array.
   */
  removeAddressList: (id) => {
    if (!id) throw new Error("Address-list ID required for removeAddressList");
    return ["/ip/firewall/address-list/remove", `=.id=${id}`];
  },
};

// ===================== QUEUE COMMANDS =====================

/**
 * Queue management commands (simple, tree, types).
 */
const QUEUE_COMMANDS = {
  /**
   * Get all simple queues.
   * @returns {string[]} Command array.
   */
  getSimpleQueues: ["/queue/simple/print"],

  /**
   * Add a simple queue.
   * @param {string} name - Queue name.
   * @param {string} target - Target address (IP or subnet).
   * @param {string} maxLimit - Max bandwidth (e.g., "10M/10M").
   * @returns {string[]} Command array.
   */
  addSimpleQueue: (name, target, maxLimit) => {
    if (!name || !target || !maxLimit)
      throw new Error("Name, target, and maxLimit required");
    return [
      "/queue/simple/add",
      `=name=${name}`,
      `=target=${target}`,
      `=max-limit=${maxLimit}`,
    ];
  },

  /**
   * Update a simple queue by ID.
   * @param {string} id - Queue .id.
   * @param {Object} params - Fields to update (name, target, max-limit, etc).
   * @returns {string[]} Command array.
   */
  updateSimpleQueue: (id, params = {}) => {
    if (!id) throw new Error("ID required for updateSimpleQueue");
    const command = ["/queue/simple/set", `=.id=${id}`];
    for (const [key, value] of Object.entries(params)) {
      command.push(`=${key}=${value}`);
    }
    return command;
  },

  /**
   * Remove a simple queue by ID.
   * @param {string} id - Queue .id.
   * @returns {string[]} Command array.
   */
  removeSimpleQueue: (id) => {
    if (!id) throw new Error("ID required for removeSimpleQueue");
    return ["/queue/simple/remove", `=.id=${id}`];
  },

  /**
   * Get all tree queues.
   * @returns {string[]} Command array.
   */
  getTreeQueues: ["/queue/tree/print"],

  /**
   * Get all queue types.
   * @returns {string[]} Command array.
   */
  getQueueTypes: ["/queue/type/print"],
};

// ===================== PPP COMMANDS =====================

/**
 * PPP (Point-to-Point Protocol) management commands.
 */
const PPP_COMMANDS = {
  /**
   * Get all PPP profiles.
   * @returns {string[]} Command array.
   */
  getProfiles: ["/ppp/profile/print"],

  /**
   * Get all PPP secrets.
   * @returns {string[]} Command array.
   */
  getSecrets: ["/ppp/secret/print"],

  /**
   * Add a PPP secret (user).
   * @param {string} name - Username.
   * @param {string} password - Password.
   * @param {string} service - Service type (pppoe, pptp, l2tp, etc).
   * @returns {string[]} Command array.
   */
  addSecret: (name, password, service) => {
    if (!name || !password || !service)
      throw new Error("Name, password, service required for addSecret");
    return [
      "/ppp/secret/add",
      `=name=${name}`,
      `=password=${password}`,
      `=service=${service}`,
    ];
  },

  /**
   * Get all active PPP connections.
   * @returns {string[]} Command array.
   */
  getActive: ["/ppp/active/print"],
};

// ===================== TOOLS COMMANDS =====================

/**
 * Network tools and diagnostics (ping, traceroute, etc).
 */
const TOOLS_COMMANDS = {
  /**
   * Ping an address.
   * @param {string} address - IP or hostname.
   * @param {number} [count=4] - Number of pings.
   * @returns {string[]} Command array.
   */
  ping: (address, count = 4) => {
    if (!address) throw new Error("Address required for ping");
    return ["/ping", `=address=${address}`, `=count=${count}`];
  },

  /**
   * Traceroute to an address.
   * @param {string} address - IP or hostname.
   * @returns {string[]} Command array.
   */
  traceroute: (address) => {
    if (!address) throw new Error("Address required for traceroute");
    return ["/tool/traceroute", `=address=${address}`];
  },

  /**
   * Run a bandwidth test.
   * @param {string} address - Target IP/host.
   * @param {string} [direction="both"] - "send", "receive", or "both".
   * @returns {string[]} Command array.
   */
  bandwidthTest: (address, direction = "both") => {
    if (!address) throw new Error("Address required for bandwidthTest");
    return [
      "/tool/bandwidth-test",
      `=address=${address}`,
      `=direction=${direction}`,
    ];
  },

  /**
   * Monitor traffic for a specific interface (real-time).
   * @param {string} iface - Interface name.
   * @returns {string[]} Command array.
   */
  trafficMonitor: (iface) => {
    if (!iface) throw new Error("Interface required for trafficMonitor");
    return ["/interface/monitor-traffic", `=interface=${iface}`];
  },

  /**
   * Get CPU profiling information.
   * @param {string} [time="10s"] - Duration (e.g., "10s").
   * @returns {string[]} Command array.
   */
  getCpuProfile: (time = "10s") => ["/tool/profile", `=time=${time}`],

  /**
   * Real-time packet/connection monitoring (torch).
   * @param {string} iface - Interface name.
   * @returns {string[]} Command array.
   */
  torch: (iface) => {
    if (!iface) throw new Error("Interface required for torch");
    return ["/tool/torch", `=interface=${iface}`];
  },
};

// ===================== WIRELESS COMMANDS =====================

/**
 * Wireless interface management and monitoring.
 */
const WIRELESS_COMMANDS = {
  /**
   * Get all wireless interfaces.
   * @returns {string[]} Command array.
   */
  getInterfaces: ["/interface/wireless/print"],

  /**
   * Get wireless registration table (connected clients).
   * @returns {string[]} Command array.
   */
  getRegistrationTable: ["/interface/wireless/registration-table/print"],

  /**
   * Scan for wireless networks.
   * @param {string} iface - Wireless interface name.
   * @returns {string[]} Command array.
   */
  scan: (iface) => {
    if (!iface) throw new Error("Interface required for scan");
    return ["/interface/wireless/scan", `=interface=${iface}`];
  },

  /**
   * Get all wireless security profiles.
   * @returns {string[]} Command array.
   */
  getSecurityProfiles: ["/interface/wireless/security-profiles/print"],

  /**
   * Add a wireless security profile.
   * @param {string} name - Profile name.
   * @param {string} mode - Security mode (dynamic-keys, static-keys-required, etc).
   * @param {string} authentication - Authentication types (e.g., wpa2-psk).
   * @param {string} encryption - Encryption types (aes-ccm, tkip, etc).
   * @param {string} passphrase - WPA/WPA2 pre-shared key.
   * @returns {string[]} Command array.
   */
  addSecurityProfile: (name, mode, authentication, encryption, passphrase) => {
    if (!name || !mode || !authentication || !encryption || !passphrase)
      throw new Error("All parameters required for addSecurityProfile");
    return [
      "/interface/wireless/security-profiles/add",
      `=name=${name}`,
      `=mode=${mode}`,
      `=authentication-types=${authentication}`,
      `=encryption=${encryption}`,
      `=wpa-pre-shared-key=${passphrase}`,
      `=wpa2-pre-shared-key=${passphrase}`,
    ];
  },
};

// ===================== EXPORTS =====================
export {
  SYSTEM_COMMANDS,
  INTERFACE_COMMANDS,
  IP_COMMANDS,
  QUEUE_COMMANDS,
  PPP_COMMANDS,
  TOOLS_COMMANDS,
  WIRELESS_COMMANDS,
};
