import { useQuery } from '@tanstack/react-query'
import { adminDashboardApi, type AdminDashboardResponse } from '@/lib/api/admin-dashboard-api'

export function useDashboard() {
  return useQuery<AdminDashboardResponse>({
    queryKey: ['admin-dashboard'],
    queryFn: adminDashboardApi.get,
    staleTime: 60_000,
  })
}
