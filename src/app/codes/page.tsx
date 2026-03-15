'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ActivationCode {
  code: string
  version: string
  expireDays: number
  used: boolean
  usedBy?: string
  usedAt?: string
  createdAt: string
}

export default function CodesPage() {
  const [codes, setCodes] = useState<ActivationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [count, setCount] = useState(10)
  const [version, setVersion] = useState('standard')
  const [expireDays, setExpireDays] = useState(365)
  const [generatedCodes, setGeneratedCodes] = useState<ActivationCode[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchCodes()
  }, [router])

  const fetchCodes = () => {
    const token = localStorage.getItem('token')
    fetch('/api/codes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCodes(data.codes || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const token = localStorage.getItem('token')
    
    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count, version, expireDays })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setGeneratedCodes(data.codes)
        fetchCodes()
      }
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const copyCodes = () => {
    const codeText = generatedCodes.map(c => c.code).join('\n')
    navigator.clipboard.writeText(codeText)
    alert('已复制到剪贴板')
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
              <a href="/students" className="text-gray-600 hover:text-gray-900">学员管理</a>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 生成激活码 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">生成激活码</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版本</label>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">免费试用</option>
                  <option value="standard">标准版</option>
                  <option value="vip">VIP版</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">有效期(天)</label>
                <input
                  type="number"
                  value={expireDays}
                  onChange={(e) => setExpireDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
              >
                {generating ? '生成中...' : '生成激活码'}
              </button>
            </div>
            
            {/* 生成的激活码 */}
            {generatedCodes.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded">
                <h3 className="font-medium text-green-800 mb-2">生成成功！</h3>
                <div className="space-y-1 mb-3">
                  {generatedCodes.map((code) => (
                    <div key={code.code} className="font-mono text-sm bg-white p-2 rounded">
                      {code.code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={copyCodes}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  复制全部
                </button>
              </div>
            )}
          </div>

          {/* 激活码列表 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">激活码列表 ({codes.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">激活码</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">版本</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">使用者</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {codes.map((code) => (
                    <tr key={code.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{code.code}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          code.version === 'vip' ? 'bg-purple-100 text-purple-600' :
                          code.version === 'standard' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {code.version === 'vip' ? 'VIP' : 
                           code.version === 'standard' ? '标准' : '免费'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          code.used ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {code.used ? '已使用' : '未使用'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {code.usedBy || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
