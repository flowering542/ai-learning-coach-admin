'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  Activity, 
  Target, 
  TrendingUp,
  LogOut,
  ChevronRight
} from '@phosphor-icons/react'

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20
    }
  }
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Target weight="fill" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                AI学习教练
              </h1>
            </div>
            
            <div className="flex items-center space-x-1">
              <NavLink href="/students" label="学员管理" />
              <NavLink href="/codes" label="激活码" />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* 欢迎标题 */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              数据概览
            </h2>
            <p className="mt-2 text-slate-600">
              实时监控学员学习进度与平台运营数据
            </p>
          </motion.div>

          {/* 统计卡片 - Bento Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="总学员数"
              value={data?.totalStudents || 0}
              icon={Users}
              trend="+12%"
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              title="今日活跃"
              value={data?.activeToday || 0}
              icon={Activity}
              trend="实时"
              color="from-emerald-500 to-teal-500"
              live
            />
            <StatCard
              title="总答题数"
              value={data?.totalQuestions || 0}
              icon={Target}
              trend="+8%"
              color="from-violet-500 to-purple-500"
            />
            <StatCard
              title="平均正确率"
              value={`${data?.avgAccuracy || 0}%`}
              icon={TrendingUp}
              trend="稳定"
              color="from-amber-500 to-orange-500"
            />
          </motion.div>

          {/* 等级分布 + 活跃趋势 */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* 等级分布 */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/50 p-6 card-hover">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">学员等级分布</h3>
              
              <div className="space-y-4">
                <LevelBar
                  label="优秀"
                  count={data?.levelDistribution.excellent || 0}
                  total={data?.totalStudents || 1}
                  color="bg-emerald-500"
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
                  color="bg-amber-500"
                />
                <LevelBar
                  label="未测评"
                  count={data?.levelDistribution.unknown || 0}
                  total={data?.totalStudents || 1}
                  color="bg-slate-400"
                />
              </div>
            </div>

            {/* 活跃趋势 */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/50 p-6 card-hover">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">近7天活跃趋势</h3>
                <span className="text-sm text-slate-500">每日活跃学员数</span>
              </div>
              
              <div className="flex items-end space-x-2 h-48">
                {data?.activityTrend.map((day, index) => {
                  const maxCount = Math.max(...data.activityTrend.map(d => d.count), 1)
                  const height = Math.max((day.count / maxCount) * 100, 8)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 100, 
                        damping: 20,
                        delay: index * 0.1 
                      }}
                      className="flex-1 flex flex-col items-center group"
                    >
                      <div className="relative w-full">
                        <div className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity" 
                          style={{ height: '100%' }} 
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.count}人
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 mt-2">{day.date}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

// 导航链接组件
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-1 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
    >
      <span>{label}</span>
      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </a>
  )
}

// 统计卡片组件
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color,
  live 
}: { 
  title: string
  value: string | number
  icon: any
  trend: string
  color: string
  live?: boolean
}) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-slate-200/50 p-6 card-hover relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />
      
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon weight="fill" className="w-5 h-5 text-white" />
          </div>
          {live && (
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
          )}
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{title}</p>
      </div>
    </motion.div>
  )
}

// 等级条组件
function LevelBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = Math.round((count / total) * 100)

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-slate-600 w-16">{label}</span>
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className={`h-full ${color} rounded-full`} 
            />
          </div>
          <span className="text-sm font-medium text-slate-900 w-12 text-right">
            {count}
          </span>
        </div>
      </div>
    </div>
  )
}
