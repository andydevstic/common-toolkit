import * as geoip from "geoip-country";

export function lookupIp(address: string): geoip.Lookup {
  return geoip.lookup(address);
}
