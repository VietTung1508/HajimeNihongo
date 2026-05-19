import { useSelector } from 'react-redux'
import { selectPermissions } from '@/store'

export function usePermission() {
  const permissions = useSelector(selectPermissions)
  return { can: (key: string) => permissions.includes(key) }
}
