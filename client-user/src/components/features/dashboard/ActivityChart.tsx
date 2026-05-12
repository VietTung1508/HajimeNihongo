'use client'

import {Card} from '@/components/ui/card'
import {useActivity} from './hooks/use-dashboard-data'
import {Loader2} from 'lucide-react'
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell} from 'recharts'
import {TrendingUp} from 'lucide-react'

export function ActivityChart() {
  const {data, isLoading, error} = useActivity()

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="flex items-center justify-center p-12 h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </Card>
    )
  }

  if (error || !data?.data) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No activity yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Start learning and reviewing to track your progress</p>
        </div>
      </Card>
    )
  }

  const chartData = data.data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
    count: point.count
  }))

  const maxCount = Math.max(...chartData.map(d => d.count), 0)

  // Check if all counts are zero
  const hasNoActivity = maxCount === 0

  if (hasNoActivity) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <TrendingUp className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Learning Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Items reviewed per day</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No activity yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Complete your first lesson to see your activity chart</p>
          </div>
        </div>
      </Card>
    )
  }
  const avgCount = chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length

  const getBarColor = (value: number) => {
    const ratio = value / maxCount
    if (ratio > 0.8) return '#6366f1'
    if (ratio > 0.5) return '#818cf8'
    return '#a5b4fc'
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <TrendingUp className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Learning Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Items reviewed per day</p>
            </div>
          </div>
          {avgCount > 0 && (
            <div className="text-right">
              <div className="text-2xl font-semibold text-slate-900 dark:text-white">{Math.round(avgCount)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">avg/day</div>
            </div>
          )}
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-slate-200 dark:stroke-slate-800" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{fill: 'currentColor', className: 'text-slate-500 dark:text-slate-400' }}
              />
              <YAxis
                className="text-xs"
                tick={{fill: 'currentColor', className: 'text-slate-500 dark:text-slate-400' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  padding: '8px 12px'
                }}
                itemStyle={{color: '#a5b4fc'}}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
