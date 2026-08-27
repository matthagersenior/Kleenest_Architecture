import { CAPABILITY_REGISTRY } from './capabilityRegistry.js';

export function buildDomainServiceWiringReport(services = {}) {
  const report = {};
  for (const [domain, contract] of Object.entries(CAPABILITY_REGISTRY)) {
    const required = Array.isArray(contract?.services) ? contract.services : [];
    const missing = required.filter(name => !services?.[name]);
    report[domain] = Object.freeze({
      domain,
      required: Object.freeze([...required]),
      missing: Object.freeze([...missing]),
      wired: missing.length === 0,
    });
  }
  return Object.freeze(report);
}

export function getUnwiredDomains(report = {}) {
  return Object.values(report).filter(entry => !entry.wired).map(entry => entry.domain);
}

export function assertDomainServiceWiring(services = {}) {
  const report = buildDomainServiceWiringReport(services);
  const unwired = getUnwiredDomains(report);
  if (unwired.length) throw new Error(`Canonical domain services are not wired: ${unwired.join(', ')}`);
  return report;
}
