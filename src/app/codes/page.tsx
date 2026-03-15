'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Key,
  Crown,
  Copy,
  Check,
  Plus,
  LogOut,
  Target,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Download
} from '@phosphor-icons/react'

interface ActivationCode {
  code: string
  version: string
  expireDays: number
  used: boolean
  usedBy?: string
  usedAt?: string
  createdAt: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

export default function CodesPage() {
  const [codes, setCodes] = useState<ActivationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [count, setCount] = useState(10)
  const [version, setVersion] = useState('standard')
  const [expireDays, setExpireDays] = useState(365)
  const [generatedCodes, setGeneratedCodes] = useState<ActivationCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const copyAllCodes = () => {
    const codeText = generatedCodes.map(c => c.code).join('\n')
    navigator.clipboard.writeText(codeText)
  }

  const exportCodes = () => {
    const csv = [
      '激活码,版本,有效期(天),状态,使用者,创建时间',
      ...codes.map(c => 
        `${c.code},${c.version},${c.expireDays},${c.used ? '已使用' : '未使用'},${c.usedBy || '-'},${new Date(c.createdAt).toLocaleString()}`
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `activation-codes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const getVersionConfig = (version: string) => {
    const configs: Record<string, { icon: any; label: string; color: string; gradient: string }> = {
      vip: { 
        icon: Crown, 
        label: 'VIP版', 
        color: 'text-purple-600',
        gradient: 'from-purple-500 to-pink-500'
      },
      standard: { 
        icon: Key, 
        label: '标准版', 
        color: 'text-blue-600',
        gradient: 'from-blue-500 to-cyan-500'
      },
      free: { 
        icon: Target, 
        label: '免费版', 
        color: 'text-slate-600',
        gradient: 'from-slate-500 to-slate-400'
      }
    }
    return configs[version] || configs.free
  }

  const usedCount = codes.filter(c => c.used).length
  const unusedCount = codes.filter(c => !c.used).length

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
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-lg flex items-center justify-center"
003e
                <Target weight="fill" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                AI学习教练
              </h1>
            </div>
            
            <div className="flex items-center space-x-1">
              <NavLink href="/" label="数据看板" />
              <NavLink href="/students" label="学员管理" />
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
                激活码管理
              </h2>
              <p className="mt-1 text-slate-600">
                共 {codes.length} 个激活码，{unusedCount} 个未使用
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportCodes}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>导出CSV</span>
            </motion.button>
          </div>

          {/* 统计卡片 */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <StatCard 
              title="总激活码" 
              value={codes.length} 
              icon={Key}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard 
              title="未使用" 
              value={unusedCount} 
              icon={Check}
              color="from-emerald-500 to-teal-500"
            />
            <StatCard 
              title="已使用" 
              value={usedCount} 
              icon={User}
              color="from-slate-500 to-slate-400"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 生成激活码 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200/50 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-6">生成激活码</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">数量</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <span className="w-12 text-center font-semibold text-slate-900">{count}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">版本</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['free', 'standard', 'vip'].map((v) => {
                      const config = getVersionConfig(v)
                      return (
                        <button
                          key={v}
                          onClick={() => setVersion(v)}
                          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                            version === v 
                              ? 'border-sky-500 bg-sky-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <config.icon className={`w-5 h-5 mb-1 ${config.color}`} />
                          <span className="text-xs">{config.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">有效期</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={expireDays}
                      onChange={(e) => setExpireDays(parseInt(e.target.value))}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                    <span className="text-sm text-slate-500">天</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>生成激活码</span>
                    </>
                  )}
                </motion.button>
              </div>
              
              {/* 生成的激活码 */}
              <AnimatePresence>
                {generatedCodes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-emerald-800">生成成功！</h4>
                      <button
                        onClick={copyAllCodes}
                        className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制全部</span>
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {generatedCodes.map((code) => (
                        <motion.div
                          key={code.code}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-white rounded-lg font-mono text-sm"
                        >
                          <span className="font-semibold text-slate-900">{code.code}</span>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="text-slate-400 hover:text-sky-600 transition-colors"
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 激活码列表 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">激活码列表</h3>
                <span className="text-sm text-slate-500">最近50个</span>
              </div>
              
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {codes.map((code, index) => {
                    const config = getVersionConfig(code.version)
                    return (
                      <motion.div
                        key={code.code}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        custom={index}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                              <config.icon className="w-5 h-5 text-white" />
                            </div>
                            
                            <div>
                              <p className="font-mono font-semibold text-slate-900">{code.code}</p>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{code.expireDays}天</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{new Date(code.createdAt).toLocaleDateString()}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {code.used ? (
                              <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                  已使用
                                </span>
                                {code.usedBy && (
                                  <p className="text-xs text-slate-400 mt-1 truncate max-w-[120px]">
                                    {code.usedBy}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">
                                未使用
                              </span>
                            )}
                            
                            <button
                              onClick={() => copyCode(code.code)}
                              className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                
                {codes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">暂无激活码</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
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

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: number
  icon: any
  color: string
}) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-slate-200/50 p-5 card-hover"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon weight="fill" className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </div>
    </motion.div>
  )
}
