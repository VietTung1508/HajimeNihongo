import { Button } from '@/components/ui/button'

const Dashboard = () => {
  return (
    <div>
       <div className='mb-2 flex items-center justify-between space-y-2'>
          <div className='mb-4 flex w-full items-center justify-between'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Operation Dashboard
            </h1>
            <Button className='text-red-50'>
              Best
            </Button>
          </div>
        </div>
        <div className='space-y-5'>
        </div>
    </div>
  )
}

export default Dashboard
