import { ShieldOff } from 'lucide-react'

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
    <ShieldOff className="w-12 h-12 text-muted-foreground" />
    <div>
      <h2 className="text-xl font-semibold">Access Denied</h2>
      <p className="text-sm text-muted-foreground mt-1">
        You don't have permission to view this page.
      </p>
    </div>
  </div>
)

export default AccessDenied
