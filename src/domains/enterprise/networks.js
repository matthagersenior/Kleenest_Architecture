export function createEnterprisePartnerNetworkService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    get: async (networkId, start, end) => { const { data, error } = await client.rpc('get_enterprise_partner_network', { p_network_id: networkId, p_start: start, p_end: end }); if (error) throw error; return data; },
    benchmark: async (networkId, start, end) => { const { data, error } = await client.rpc('get_partner_network_benchmark', { p_network_id: networkId, p_start: start, p_end: end }); if (error) throw error; return data; },
    allocationRoi: async (networkId, start, end) => { const { data, error } = await client.rpc('get_partner_allocation_roi', { p_network_id: networkId, p_start: start, p_end: end }); if (error) throw error; return data; },
    campaignRoi: async (campaignId, start, end) => { const { data, error } = await client.rpc('get_partner_campaign_roi', { p_campaign_id: campaignId, p_start: start, p_end: end }); if (error) throw error; return data; },
    createNetwork: async (name) => { const { data, error } = await client.rpc('create_enterprise_partner_network', { p_name: name }); if (error) throw error; return data; },
    createCampaign: async (networkId, name, campaignType, goal) => { const { data, error } = await client.rpc('create_enterprise_partner_campaign', { p_network_id: networkId, p_name: name, p_campaign_type: campaignType, p_goal: goal }); if (error) throw error; return data; },
    invitePartner: async (networkId, partnerBusinessId) => { const { data, error } = await client.rpc('invite_enterprise_partner', { p_network_id: networkId, p_partner_business_id: partnerBusinessId }); if (error) throw error; return data; },
    setMembershipStatus: async (membershipId, status) => { const { data, error } = await client.rpc('set_enterprise_partner_status', { p_membership_id: membershipId, p_status: status }); if (error) throw error; return data; }
  });
}
