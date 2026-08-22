export function createPartnerProgramService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    list: async () => { const { data, error } = await client.rpc('business_list_partner_programs'); if (error) throw error; return data ?? []; },
    memberships: async () => { const { data, error } = await client.rpc('list_my_partner_memberships'); if (error) throw error; return data ?? []; },
    join: async (programId) => { const { data, error } = await client.rpc('join_partner_program', { p_program_id: programId }); if (error) throw error; return data; },
    requestAgreement: async (programId, partnerBusinessId) => { const { data, error } = await client.rpc('business_request_partner_agreement', { p_partner_program_id: programId, p_partner_business_id: partnerBusinessId }); if (error) throw error; return data; },
    acceptAgreement: async (agreementId) => { const { data, error } = await client.rpc('accept_partner_agreement', { p_agreement_id: agreementId }); if (error) throw error; return data; }
  });
}
