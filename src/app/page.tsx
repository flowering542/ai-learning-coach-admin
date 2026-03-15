'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardData {
  totalStudents: number
  activeToday: number
  totalQuestions: number
  avgAccuracy: number
  levelDistribution: {
    excellent: number
    good: number
    weak: number
    unknown: number
  }
  activityTrend: { date: string; count: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('token')
        router.push('/login')
      })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">AI学习教练 - 管理端</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/students" className="text-gray-600 hover:text-gray-900">学员管理</a>
              <a href="/codes" className="text-gray-600 hover:text-gray-900">激活码</a>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总学员数"
            value={data?.totalStudents || 0}
            color="blue"
          />
          <StatCard
            title="今日活跃"
            value={data?.activeToday || 0}
            color="green"
          />
          <StatCard
            title="总答题数"
            value={data?.totalQuestions || 0}
            color="purple"
          />
          <StatCard
            title="平均正确率"
            value={`${data?.avgAccuracy || 0}%`}
            color="orange"
          />
        </div>

        {/* 等级分布 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">学员等级分布</h2>
          <div className="grid grid-cols-4 gap-4">
            <LevelBar
              label="优秀"
              count={data?.levelDistribution.excellent || 0}
              total={data?.totalStudents || 1}
              color="bg-green-500"
            />
            <LevelBar
              label="良好"
              count={data?.levelDistribution.good || 0}
              total={data?.totalStudents || 1}
              color="bg-blue-500"
            />
            <LevelBar
              label="薄弱"
              count={data?.levelDistribution.weak || 0}
              total={data?.totalStudents || 1}
              color="bg-yellow-500"
            />
            <LevelBar
              label="未测评"
              count={data?.levelDistribution.unknown || 0}
              total={data?.totalStudents || 1}
              color="bg-gray-400"
            />
          </div>
        </div>

        {/* 活跃趋势 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">近7天活跃趋势</h2>
          <div className="flex items-end space-x-2 h-40">
            {data?.activityTrend.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all"
                  style={{
                    height: `${Math.max((day.count / Math.max(...data.activityTrend.map(d => d.count))) * 100, 10)}%`
                  }}
                />
                <span className="text-xs text-gray-600 mt-2">{day.date}</span>
                <span className="text-xs text-gray-500">{day.count}人</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// 统计卡片组件
function StatCard({ title, value, color }: { title: string; value: number | string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg mb-4}`} />
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

// 等级条组件
function LevelBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = Math.round((count / total) * 100)

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="text-2xl font-bold mb-1">{count}</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
    </div>
  )
}
