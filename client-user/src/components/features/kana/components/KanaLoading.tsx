export function KanaLoading() {
  return (
    <div className='flex min-h-[calc(100vh-64px)]'>
      {/* Sidebar skeleton */}
      <aside className='w-60 shrink-0 border-r p-4 space-y-6'>
        <div className='space-y-2'>
          <div className='h-3 w-16 bg-muted rounded animate-pulse' />
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-6 w-full bg-muted rounded animate-pulse' />
          ))}
        </div>
        <div className='space-y-2'>
          <div className='h-3 w-16 bg-muted rounded animate-pulse' />
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-6 w-full bg-muted rounded animate-pulse' />
          ))}
        </div>
      </aside>
      {/* Content skeleton */}
      <main className='flex-1 p-8 space-y-4 max-w-4xl'>
        <div className='h-8 w-32 bg-muted rounded animate-pulse' />
        {[...Array(3)].map((_, i) => (
          <div key={i} className='h-20 bg-muted rounded animate-pulse' />
        ))}
      </main>
    </div>
  )
}
