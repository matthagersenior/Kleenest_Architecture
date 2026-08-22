export function createAdminOperationsService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = (name, args = {}) => client.rpc(name, args).then(({ data, error }) => { if (error) throw error; return data; });
  return Object.freeze({
    overview: () => rpc('admin_get_overview'),
    integrity: () => rpc('admin_data_integrity_summary'),
    pendingBusinesses: () => rpc('admin_list_pending_businesses'),
    reports: () => rpc('admin_list_reports'),
    searchUsers: query => rpc('admin_user_search', { p_query: query }),
  });
}
