export function createPartnerProgramService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function rpc(name, args = {}) { const { data, error } = await client.rpc(name, args); if (error) throw error; return data; }
  return Object.freeze({
    list: () => rpc('business_list_partner_programs').then(data => data ?? []),
    memberships: () => rpc('list_my_partner_memberships').then(data => data ?? []),
    join: programId => rpc('join_partner_program', { p_program_id: programId }),
    requestAgreement: (programId, partnerBusinessId) => rpc('business_request_partner_agreement', { p_partner_program_id: programId, p_partner_business_id: partnerBusinessId }),
    acceptAgreement: agreementId => rpc('accept_partner_agreement', { p_agreement_id: agreementId }),
    benchmarkAnalytics: () => rpc('enterprise_partner_benchmark_analytics'),
    campaignRoi: () => rpc('enterprise_campaign_roi_analytics'),
    allocationRoi: () => rpc('enterprise_allocation_roi_analytics'),
    campaignAnalytics: () => rpc('enterprise_campaign_analytics'),
    fleetAccess: () => rpc('enterprise_fleet_access_summary')
  });
}
