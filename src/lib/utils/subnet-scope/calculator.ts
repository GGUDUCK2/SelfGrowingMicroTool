import { Address4, Address6 } from 'ip-address';

export type IPVersion = 4 | 6;

export interface NetworkInfo {
  valid: boolean;
  version?: IPVersion;
  address?: string;
  subnetMask?: string;
  subnetMaskLength?: number;
  networkAddress?: string;
  broadcastAddress?: string;
  firstHost?: string;
  lastHost?: string;
  totalHosts?: string;
  binary?: string;
  binaryMask?: string;
  type?: string;
  error?: string;
  isPrivate?: boolean;
  isLoopback?: boolean;
}

export interface SubnetResult {
  network: string;
  range: string;
}

export class SubnetCalculator {
  static analyze(input: string): NetworkInfo {
    if (Address4.isValid(input)) {
      try {
        const ip4 = new Address4(input);
        return this.analyzeIPv4(ip4);
      } catch (e) {
         // ignore
      }
    }

    if (Address6.isValid(input)) {
      try {
        const ip6 = new Address6(input);
        return this.analyzeIPv6(ip6);
      } catch (e) {
        // ignore
      }
    }

    return { valid: false, error: 'Invalid IP address or CIDR' };
  }

  static generateSubnets(input: string, newMask: number): SubnetResult[] {
    // Basic VLSM generator for IPv4
    try {
        if (!Address4.isValid(input)) return [];

        const ip4 = new Address4(input);
        const currentMask = ip4.subnetMask;
        if (newMask <= currentMask) return [];
        if (newMask > 32) return [];

        const subnets: SubnetResult[] = [];
        const newBits = newMask - currentMask;
        const numSubnets = Math.pow(2, newBits);

        if (numSubnets > 1024) {
            return [{ network: "Too many subnets to display", range: "" }];
        }

        const startParts = ip4.startAddress().address.split('.').map(Number);
        const startVal = (BigInt(startParts[0]) << 24n) | (BigInt(startParts[1]) << 16n) | (BigInt(startParts[2]) << 8n) | BigInt(startParts[3]);

        const increment = BigInt(2) ** BigInt(32 - newMask);

        for (let i = 0; i < numSubnets; i++) {
            const subnetVal = startVal + (BigInt(i) * increment);
            const subnetIp = this.bigIntToIp4(subnetVal);

            const broadcastVal = subnetVal + increment - 1n;
            const broadcastIp = this.bigIntToIp4(broadcastVal);

            subnets.push({
                network: `${subnetIp}/${newMask}`,
                range: `${subnetIp} - ${broadcastIp}`
            });
        }
        return subnets;

    } catch (e) {
        return [];
    }
  }

  private static bigIntToIp4(val: bigint): string {
    const p0 = (val >> 24n) & 255n;
    const p1 = (val >> 16n) & 255n;
    const p2 = (val >> 8n) & 255n;
    const p3 = val & 255n;
    return `${p0}.${p1}.${p2}.${p3}`;
  }

  private static analyzeIPv4(ip: Address4): NetworkInfo {
    const start = ip.startAddress();
    const end = ip.endAddress();
    const mask = ip.subnetMask;
    const binary = ip.binaryZeroPad();
    const maskNum = ip.subnetMask;
    const binaryMask = '1'.repeat(maskNum) + '0'.repeat(32 - maskNum);
    const hostsBigInt = BigInt(2) ** BigInt(32 - maskNum);

    return {
      valid: true,
      version: 4,
      address: `${ip.address}${ip.address.includes('/') ? '' : '/' + mask}`,
      subnetMask: this.maskLengthToDecimal(mask),
      subnetMaskLength: ip.subnetMask,
      networkAddress: start.address,
      broadcastAddress: end.address,
      firstHost: this.adjustIP4(start.address, 1),
      lastHost: this.adjustIP4(end.address, -1),
      totalHosts: hostsBigInt.toString(),
      binary: this.formatBinary4(binary),
      binaryMask: this.formatBinary4(binaryMask),
      type: this.getIPv4Type(ip),
      isPrivate: this.isPrivateIPv4(ip),
      isLoopback: this.isLoopbackIPv4(ip)
    };
  }

  private static analyzeIPv6(ip: Address6): NetworkInfo {
    const start = ip.startAddress();
    const end = ip.endAddress();
    const mask = ip.subnetMask;
    const hostsBigInt = BigInt(2) ** BigInt(128 - mask);

    return {
      valid: true,
      version: 6,
      address: `${ip.address}${ip.address.includes('/') ? '' : '/' + mask}`,
      subnetMaskLength: ip.subnetMask,
      networkAddress: start.address,
      broadcastAddress: 'N/A',
      firstHost: start.address,
      lastHost: end.address,
      totalHosts: hostsBigInt.toString(),
      binary: this.formatBinary6(ip.binaryZeroPad()),
      binaryMask: 'N/A',
      type: ip.getType(),
      isPrivate: this.isUniqueLocalIPv6(ip) || ip.isLinkLocal(),
      isLoopback: ip.isLoopback()
    };
  }

  private static adjustIP4(ipStr: string, offset: number): string {
    const parts = ipStr.split('.').map(Number);
    let bigVal = (BigInt(parts[0]) << 24n) | (BigInt(parts[1]) << 16n) | (BigInt(parts[2]) << 8n) | BigInt(parts[3]);
    bigVal = bigVal + BigInt(offset);
    return this.bigIntToIp4(bigVal);
  }

  private static formatBinary4(bin: string): string {
    return bin.match(/.{1,8}/g)?.join('.') || bin;
  }

  private static formatBinary6(bin: string): string {
    return bin.match(/.{1,16}/g)?.join(':') || bin;
  }

  private static getIPv4Type(ip: Address4): string {
    if (this.isLoopbackIPv4(ip)) return 'Loopback';
    if (ip.isMulticast()) return 'Multicast';
    if (this.isPrivateIPv4(ip)) return 'Private';
    return 'Public';
  }

  private static isLoopbackIPv4(ip: Address4): boolean {
    // 127.0.0.0/8
    const loopback = new Address4('127.0.0.0/8');
    return ip.isInSubnet(loopback);
  }

  private static isUniqueLocalIPv6(ip: Address6): boolean {
      // fc00::/7 (Unique Local)
      // ip-address library might not have this, check manually
      // fc00::/7 covers fc00... to fdff...
      // Check first hextet
      const parts = ip.parse(ip.address); // returns array of strings
      if (parts.length > 0) {
          const first = parseInt(parts[0], 16);
          // fc00 is 64512
          // fdff is 65023
          // Binary: 1111 110x ...
          return (first & 0xfe00) === 0xfc00;
      }
      return false;
  }

  private static isPrivateIPv4(ip: Address4): boolean {
    const privateRanges = [
      new Address4('10.0.0.0/8'),
      new Address4('172.16.0.0/12'),
      new Address4('192.168.0.0/16')
    ];
    return privateRanges.some(range => ip.isInSubnet(range));
  }

  private static maskLengthToDecimal(length: number): string {
      const binaryMask = '1'.repeat(length) + '0'.repeat(32 - length);
      const parts = binaryMask.match(/.{1,8}/g)?.map(bin => parseInt(bin, 2)) || [];
      return parts.join('.');
  }
}
