'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, 
  Crown, 
  ChartBar, 
  Fire,
  Medal,
  Calendar,
  ArrowRight,
  LogOut,
  Target,
  MagnifyingGlass,
  Faders
} from '@phosphor-icons/react'

interface Student {
  userId: string
  level: string
  version: string
  expireDate?: string
  stats: {
    total: number
    accuracy: number
  }
  streakDays: number
  lastActive?: string
  achievements: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVersion, setFilterVersion] = useState('all')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStudents(data)
        setFilteredStudents(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [router])

  useEffect(() => {
    let filtered = students
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.userId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (filterVersion !== 'all') {
      filtered = filtered.filter(s => s.version === filterVersion)
    }
    
    setFilteredStudents(filtered)
  }, [searchQuery, filterVersion, students])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      '优秀': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      '良好': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      '薄弱': 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    }
    return colors[level] || 'bg-slate-500/10 text-slate-600 border-slate-500/20'
  }

  const getVersionIcon = (version: string) => {
    if (version === 'vip') return <Crown weight="fill" className="w-4 h-4 text-purple-500" />
    if (version === 'standard') return <Medal weight="fill" className="w-4 h-4 text-blue-500" />
    return <Target className="w-4 h-4 text-slate-400" />
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
              <NavLink href="/" label="数据看板" />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 头部 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                学员管理
              </h2>
              <p className="mt-1 text-slate-600">
                共 {students.length} 名学员，{filteredStudents.length} 名符合筛选条件
              </p>
            </div>
          </div>

          {/* 筛选栏 */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200/50 p-4 flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索学员ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Faders className="w-5 h-5 text-slate-400" />
              <select
                value={filterVersion}
                onChange={(e) => setFilterVersion(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
              >
                <option value="all">全部版本</option>
                <option value="vip">VIP版</option>
                <option value="standard">标准版</option>
                <option value="free">免费版</option>
              </select>
            </div>
          </motion.div>

          {/* 学员卡片网格 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.userId}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push(`/students/${student.userId}`)}
                className="bg-white rounded-2xl border border-slate-200/50 p-5 cursor-pointer card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center"
                    >
                      <Users className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 truncate max-w-[150px]">
                        {student.userId}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getVersionIcon(student.version)}
                        <span className="text-xs text-slate-500 capitalize">
                          {student.version === 'vip' ? 'VIP版' : 
                           student.version === 'standard' ? '标准版' : '免费版'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <ChartBar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{student.stats.total}</p>
                    <p className="text-xs text-slate-500">答题</p>
                  </div>
                  
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Target className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{student.stats.accuracy}%</p>
                    <p className="text-xs text-slate-500">正确率</p>
                  </div>
                  
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Fire className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{student.streakDays}</p>
                    <p className="text-xs text-slate-500">连续</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getLevelColor(student.level)}`}>
                    {student.level}
                  </span>
                  
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {student.lastActive 
                        ? new Date(student.lastActive).toLocaleDateString() 
                        : '从未活跃'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlass className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">未找到符合条件的学员</p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-1 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
    >
      <span>{label}</span>
    </a>
  )
}
