'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
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
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      '优秀': 'text-green-600 bg-green-100',
      '良好': 'text-blue-600 bg-blue-100',
      '薄弱': 'text-yellow-600 bg-yellow-100',
      '未测评': 'text-gray-600 bg-gray-100'
    }
    return colors[level] || colors['未测评']
  }

  const getVersionColor = (version: string) => {
    const colors: Record<string, string> = {
      'vip': 'text-purple-600 bg-purple-100',
      'standard': 'text-blue-600 bg-blue-100',
      'free': 'text-gray-600 bg-gray-100'
    }
    return colors[version] || colors['free']
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
              <a href="/" className="text-gray-600 hover:text-gray-900">数据看板</a>
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">学员列表 ({students.length}人)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">等级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">版本</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">答题数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">正确率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">连续打卡</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">徽章</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后活跃</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr 
                    key={student.userId} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/students/${student.userId}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(student.level)}`}>
                        {student.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getVersionColor(student.version)}`}>
                        {student.version === 'vip' ? 'VIP' : student.version === 'standard' ? '标准版' : '免费'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.stats.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.stats.accuracy}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.streakDays}天
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.achievements}个
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.lastActive 
                        ? new Date(student.lastActive).toLocaleDateString() 
                        : '从未'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
