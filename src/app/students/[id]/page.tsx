'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface StudentDetail {
  userId: string
  level?: string
  version?: string
  expireDate?: string
  activated?: boolean
  activationCode?: string
  stats: {
    total: number
    correct: number
    wrong: number
  }
  streakDays: number
  achievements: string[]
  wrongQuestionsDetails: {
    id: string
    question: string
    dimension: string
    correctCount: number
    lastWrongAt?: string
  }[]
  dimensionStats: Record<string, { total: number; correct: number }>
  accuracy: number
  lastActive?: string
  assessment?: {
    score: number
    level: string
  }
}

export default function StudentDetailPage() {
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch(`/api/students/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('获取失败')
        return res.json()
      })
      .then(data => {
        setStudent(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [userId, router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      '优秀': 'text-green-600 bg-green-100',
      '良好': 'text-blue-600 bg-blue-100',
      '薄弱': 'text-yellow-600 bg-yellow-100'
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">学员不存在</div>
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
              <a href="/" className="text-gray-600 hover:text-gray-900">数据看板</a>
              <a href="/students" className="text-gray-600 hover:text-gray-900">学员列表</a>
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
        {/* 头部信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{student.userId}</h2>
              <div className="flex items-center space-x-4 mt-2">
                {student.level && (
                  <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(student.level)}`}>
                    {student.level}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  student.version === 'vip' ? 'bg-purple-100 text-purple-600' :
                  student.version === 'standard' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {student.version === 'vip' ? 'VIP版' : 
                   student.version === 'standard' ? '标准版' : '免费版'}
                </span>
                {student.activated && (
                  <span className="text-sm text-green-600">✓ 已激活</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">最后活跃</p>
              <p className="font-medium">
                {student.lastActive 
                  ? new Date(student.lastActive).toLocaleString() 
                  : '从未'}
              </p>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              {[
                { id: 'overview', label: '概览' },
                { id: 'stats', label: '答题统计' },
                { id: 'wrong', label: `错题 (${student.wrongQuestionsDetails.length})` },
                { id: 'achievements', label: `徽章 (${student.achievements.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* 概览 */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="总答题" value={student.stats.total} />
                <StatCard title="正确" value={student.stats.correct} color="green" />
                <StatCard title="错误" value={student.stats.wrong} color="red" />
                <StatCard title="正确率" value={`${student.accuracy}%`} color="blue" />
                <StatCard title="连续打卡" value={`${student.streakDays}天`} />
                <StatCard title="徽章数" value={student.achievements.length} />
                {student.assessment && (
                  <>
                    <StatCard title="测评分数" value={student.assessment.score} />
                    <StatCard title="测评等级" value={student.assessment.level} />
                  </>
                )}
              </div>
            )}

            {/* 答题统计 */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <h3 className="font-semibold">各维度答题情况</h3>
                {Object.entries(student.dimensionStats).map(([dim, stats]) => (
                  <div key={dim} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <span className="font-medium">{dim}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{stats.total}题</span>
                      <span className="text-sm text-green-600">{stats.correct}正确</span>
                      <span className="text-sm font-medium">
                        {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 错题 */}
            {activeTab === 'wrong' && (
              <div className="space-y-4">
                {student.wrongQuestionsDetails.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无错题 🎉</p>
                ) : (
                  student.wrongQuestionsDetails.map((wq, index) => (
                    <div key={wq.id} className="p-4 bg-gray-50 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <p className="font-medium mt-1">{wq.question}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-500">{wq.dimension}</span>
                            <span className="text-green-600">✓ {wq.correctCount}次</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 徽章 */}
            {activeTab === 'achievements' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {student.achievements.length === 0 ? (
                  <p className="text-gray-500 col-span-4 text-center py-8">暂无徽章</p>
                ) : (
                  student.achievements.map((badge) => (
                    <div key={badge} className="p-4 bg-yellow-50 rounded text-center">
                      <div className="text-3xl mb-2">🏅</div>
                      <p className="font-medium text-sm">{badge}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: string | number; color?: string }) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600'
  }

  return (
    <div className="bg-gray-50 p-4 rounded text-center">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color ? colorClasses[color] : ''}`}>{value}</p>
    </div>
  )
}
