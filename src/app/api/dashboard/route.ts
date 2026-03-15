import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = process.env.DATA_DIR || '../ai-learning-coach/data'

export async function GET() {
  try {
    // 读取所有学员数据
    const studentsDir = path.join(DATA_DIR, 'students')
    let students: any[] = []
    
    if (fs.existsSync(studentsDir)) {
      const files = fs.readdirSync(studentsDir).filter(f => f.endsWith('.json'))
      students = files.map(f => {
        const content = fs.readFileSync(path.join(studentsDir, f), 'utf8')
        return JSON.parse(content)
      })
    }
    
    // 统计数据
    const totalStudents = students.length
    const activeToday = students.filter((s: any) => {
      const lastActive = s.lastActive || s.stats?.lastPracticeDate
      if (!lastActive) return false
      const lastDate = new Date(lastActive).toDateString()
      const today = new Date().toDateString()
      return lastDate === today
    }).length
    
    const totalQuestions = students.reduce((sum: number, s: any) => 
      sum + (s.stats?.total || 0), 0
    )
    
    const avgAccuracy = students.length > 0 
      ? Math.round(students.reduce((sum: number, s: any) => {
          const acc = s.stats?.total > 0 
            ? (s.stats.correct / s.stats.total * 100) 
            : 0
          return sum + acc
        }, 0) / students.length)
      : 0
    
    // 等级分布
    const levelDistribution = {
      excellent: students.filter((s: any) => s.level === '优秀').length,
      good: students.filter((s: any) => s.level === '良好').length,
      weak: students.filter((s: any) => s.level === '薄弱').length,
      unknown: students.filter((s: any) => !s.level).length
    }
    
    // 最近7天活跃趋势
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()
    
    const activityTrend = last7Days.map(date => {
      const count = students.filter((s: any) => {
        const lastActive = s.lastActive || s.stats?.lastPracticeDate
        if (!lastActive) return false
        return lastActive.startsWith(date)
      }).length
      return { date: date.slice(5), count }
    })
    
    return NextResponse.json({
      totalStudents,
      activeToday,
      totalQuestions,
      avgAccuracy,
      levelDistribution,
      activityTrend
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 })
  }
}
