/**
 * RouterOS API Commands Reference Documentation
 * 
 * This file contains a comprehensive reference of all RouterOS API commands
 * organized by category with detailed TypeScript types.
 * 
 * Each command is provided as either:
 * - Static array for simple commands: ["/path/to/command"]
 * - Function for parameterized commands: (param) => ["/path/to/command", "=param=value"]
 * 
 * Usage with RouterOS API Client:
 * const result = await api.send(SYSTEM_COMMANDS.getIdentity);
 * const result = await api.send(SYSTEM_COMMANDS.setIdentity("new-name"));
 * 
 * @version 2.0.0
 * @author AviStudio (https://github.com/AviStudio)
 * @contributor RouterOS API Client Library
 */

// ===================== TYPE DEFINITIONS =====================

type Command = string[];
type CommandFunction<TArgs extends any[] = any[]> = (...args: TArgs) => Command;

interface ClockParams {
  date: string;
  time: string;
}

interface DhcpLeaseParams {
  address?: string;
  macAddress?: string;
  server?: string;
  comment?: string;
  disabled?: string;
}

interface AddressListParams {
  address?: string;
  list?: string;
  comment?: string;
  disabled?: string;
}

interface FirewallRuleParams {
  [key: string]: string;
}

// ===================== SYSTEM COMMANDS =====================

const SYSTEM_COMMANDS = {
  getIdentity: ["/system/identity/print"] as Command,

  setIdentity: (name: string): Command => {
    if (!name) throw new Error("Name is required for setIdentity");
    return ["/system/identity/set", `=name=${name}`];
  },

  getResources: ["/system/resource/print"] as Command,

  getRouterboard: ["/system/routerboard/print"] as Command,

  getHealth: ["/system/health/print"] as Command,

  getClock: ["/system/clock/print"] as Command,

  setClock: ({ date, time }: ClockParams): Command => {
    if (!date || !time)
      throw new Error("Date and time are required for setClock");
    return ["/system/clock/set", `=date=${date}`, `=time=${time}`];
  },

  getHistory: ["/system/history/print"] as Command,

  getLicense: ["/system/license/print"] as Command,

  getLogs: ["/log/print"] as Command,

  getLogTopics: ["/system/logging/print"] as Command,

  addLogTopic: (topic: string, action: string): Command => {
    if (!topic || !action)
      throw new Error("Topic and action are required for addLogTopic");
    return ["/system/logging/add", `=topics=${topic}`, `=action=${action}`];
  },

  getUsers: ["/user/print"] as Command,

  addUser: (name: string, password: string, group: string): Command => {
    if (!name || !password || !group)
      throw new Error("Name, password, and group are required for addUser");
    return [
      "/user/add",
      `=name=${name}`,
      `=password=${password}`,
      `=group=${group}`,
    ];
  },

  removeUser: (id: string): Command => {
    if (!id) throw new Error("User ID is required for removeUser");
    return ["/user/remove", `=.id=${id}`];
  },

  reboot: ["/system/reboot"] as Command,

  shutdown: ["/system/shutdown"] as Command,

  checkForUpdates: ["/system/package/update/check-for-updates"] as Command,

  upgradePackages: ["/system/package/update/install"] as Command,
};

// ===================== INTERFACE COMMANDS =====================

const INTERFACE_COMMANDS = {
  getAll: ["/interface/print"] as Command,

  getByType: (type: string): Command => {
    if (!type) throw new Error("Type is required for getByType");
    return ["/interface/print", `?type=${type}`];
  },

  enable: (id: string): Command => {
    if (!id) throw new Error("Interface ID is required for enable");
    return ["/interface/enable", `=.id=${id}`];
  },

  disable: (id: string): Command => {
    if (!id) throw new Error("Interface ID is required for disable");
    return ["/interface/disable", `=.id=${id}`];
  },

  monitorTraffic: (iface: string): Command => {
    if (!iface)
      throw new Error("Interface name is required for monitorTraffic");
    return ["/interface/monitor-traffic", `=interface=${iface}`];
  },

  getEthernet: ["/interface/ethernet/print"] as Command,

  setEthernetMtu: (id: string, mtu: string | number): Command => {
    if (!id || !mtu) throw new Error("ID and MTU required for setEthernetMtu");
    return ["/interface/ethernet/set", `=.id=${id}`, `=mtu=${mtu}`];
  },

  getBridges: ["/interface/bridge/print"] as Command,

  addBridge: (name: string): Command => {
    if (!name) throw new Error("Bridge name required");
    return ["/interface/bridge/add", `=name=${name}`];
  },

  addBridgePort: (bridge: string, iface: string): Command => {
    if (!bridge || !iface) throw new Error("Bridge and interface required");
    return [
      "/interface/bridge/port/add",
      `=bridge=${bridge}`,
      `=interface=${iface}`,
    ];
  },

  getVlans: ["/interface/vlan/print"] as Command,

  addVlan: (name: string, vlanId: string | number, iface: string): Command => {
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

const IP_COMMANDS = {
  getAddresses: ["/ip/address/print"] as Command,

  addAddress: (address: string, iface: string): Command => {
    if (!address || !iface) throw new Error("Address and interface required");
    return ["/ip/address/add", `=address=${address}`, `=interface=${iface}`];
  },

  removeAddress: (id: string): Command => {
    if (!id) throw new Error("ID required for removeAddress");
    return ["/ip/address/remove", `=.id=${id}`];
  },

  getDhcpServer: ["/ip/dhcp-server/print"] as Command,

  addDhcpServer: (name: string, iface: string, pool: string): Command => {
    if (!name || !iface || !pool)
      throw new Error("Name, interface, addressPool required");
    return [
      "/ip/dhcp-server/add",
      `=name=${name}`,
      `=interface=${iface}`,
      `=address-pool=${pool}`,
    ];
  },

  getDhcpLeases: ["/ip/dhcp-server/lease/print"] as Command,

  addDhcpLease: (
    address: string,
    macAddress: string,
    server?: string,
    comment?: string
  ): Command => {
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

  setDhcpLease: (id: string, params: DhcpLeaseParams = {}): Command => {
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

  removeDhcpLease: (id: string): Command => {
    if (!id) throw new Error("Lease ID required for removeDhcpLease");
    return ["/ip/dhcp-server/lease/remove", `=.id=${id}`];
  },

  getDnsSettings: ["/ip/dns/print"] as Command,

  setDnsServers: (servers: string): Command => {
    if (!servers) throw new Error("Servers required for setDnsServers");
    return ["/ip/dns/set", `=servers=${servers}`];
  },

  getDnsCache: ["/ip/dns/cache/print"] as Command,

  getFirewallFilter: ["/ip/firewall/filter/print"] as Command,

  addFirewallRule: (
    chain: string,
    action: string,
    params: FirewallRuleParams = {}
  ): Command => {
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

  getNatRules: ["/ip/firewall/nat/print"] as Command,

  addNatRule: (
    chain: string,
    action: string,
    params: FirewallRuleParams = {}
  ): Command => {
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

  getRoutes: ["/ip/route/print"] as Command,

  addRoute: (dst: string, gateway: string): Command => {
    if (!dst || !gateway)
      throw new Error("Destination and gateway required for addRoute");
    return ["/ip/route/add", `=dst-address=${dst}`, `=gateway=${gateway}`];
  },

  getServices: ["/ip/service/print"] as Command,

  enableService: (name: string): Command => {
    if (!name) throw new Error("Service name required");
    return ["/ip/service/set", `=name=${name}`, "=disabled=no"];
  },

  disableService: (name: string): Command => {
    if (!name) throw new Error("Service name required");
    return ["/ip/service/set", `=name=${name}`, "=disabled=yes"];
  },

  addToAddressList: (list: string, address: string, comment?: string): Command => {
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

  setAddressList: (id: string, params: AddressListParams = {}): Command => {
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

  removeAddressList: (id: string): Command => {
    if (!id) throw new Error("Address-list ID required for removeAddressList");
    return ["/ip/firewall/address-list/remove", `=.id=${id}`];
  },
};

// ===================== QUEUE COMMANDS =====================

const QUEUE_COMMANDS = {
  getSimpleQueues: ["/queue/simple/print"] as Command,

  addSimpleQueue: (name: string, target: string, maxLimit: string): Command => {
    if (!name || !target || !maxLimit)
      throw new Error("Name, target, and maxLimit required");
    return [
      "/queue/simple/add",
      `=name=${name}`,
      `=target=${target}`,
      `=max-limit=${maxLimit}`,
    ];
  },

  updateSimpleQueue: (id: string, params: Record<string, string> = {}): Command => {
    if (!id) throw new Error("ID required for updateSimpleQueue");
    const command = ["/queue/simple/set", `=.id=${id}`];
    for (const [key, value] of Object.entries(params)) {
      command.push(`=${key}=${value}`);
    }
    return command;
  },

  removeSimpleQueue: (id: string): Command => {
    if (!id) throw new Error("ID required for removeSimpleQueue");
    return ["/queue/simple/remove", `=.id=${id}`];
  },

  getTreeQueues: ["/queue/tree/print"] as Command,

  getQueueTypes: ["/queue/type/print"] as Command,
};

// ===================== PPP COMMANDS =====================

const PPP_COMMANDS = {
  getProfiles: ["/ppp/profile/print"] as Command,

  getSecrets: ["/ppp/secret/print"] as Command,

  addSecret: (name: string, password: string, service: string): Command => {
    if (!name || !password || !service)
      throw new Error("Name, password, service required for addSecret");
    return [
      "/ppp/secret/add",
      `=name=${name}`,
      `=password=${password}`,
      `=service=${service}`,
    ];
  },

  getActive: ["/ppp/active/print"] as Command,
};

// ===================== TOOLS COMMANDS =====================

const TOOLS_COMMANDS = {
  ping: (address: string, count: number = 4): Command => {
    if (!address) throw new Error("Address required for ping");
    return ["/ping", `=address=${address}`, `=count=${count}`];
  },

  traceroute: (address: string): Command => {
    if (!address) throw new Error("Address required for traceroute");
    return ["/tool/traceroute", `=address=${address}`];
  },

  bandwidthTest: (address: string, direction: string = "both"): Command => {
    if (!address) throw new Error("Address required for bandwidthTest");
    return [
      "/tool/bandwidth-test",
      `=address=${address}`,
      `=direction=${direction}`,
    ];
  },

  trafficMonitor: (iface: string): Command => {
    if (!iface) throw new Error("Interface required for trafficMonitor");
    return ["/interface/monitor-traffic", `=interface=${iface}`];
  },

  getCpuProfile: (time: string = "10s"): Command => ["/tool/profile", `=time=${time}`],

  torch: (iface: string): Command => {
    if (!iface) throw new Error("Interface required for torch");
    return ["/tool/torch", `=interface=${iface}`];
  },
};

// ===================== WIRELESS COMMANDS =====================

const WIRELESS_COMMANDS = {
  getInterfaces: ["/interface/wireless/print"] as Command,

  getRegistrationTable: ["/interface/wireless/registration-table/print"] as Command,

  scan: (iface: string): Command => {
    if (!iface) throw new Error("Interface required for scan");
    return ["/interface/wireless/scan", `=interface=${iface}`];
  },

  getSecurityProfiles: ["/interface/wireless/security-profiles/print"] as Command,

  addSecurityProfile: (
    name: string,
    mode: string,
    authentication: string,
    encryption: string,
    passphrase: string
  ): Command => {
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

export type {
  Command,
  CommandFunction,
  ClockParams,
  DhcpLeaseParams,
  AddressListParams,
  FirewallRuleParams,
};