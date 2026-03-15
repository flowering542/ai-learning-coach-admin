import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = process.env.DATA_DIR || '../ai-learning-coach/data'

export async function GET() {
  try {
    const studentsDir = path.join(DATA_DIR, 'students')
    let students: any[] = []
    
    if (fs.existsSync(studentsDir)) {
      const files = fs.readdirSync(studentsDir).filter(f => f.endsWith('.json'))
      students = files.map(f => {
        const content = fs.readFileSync(path.join(studentsDir, f), 'utf8')
        return JSON.parse(content)
      })
    }
    
    // 简化数据，只返回必要字段
    const simplified = students.map(s => ({
      userId: s.userId,
      level: s.level || '未测评',
      version: s.version || 'free',
      expireDate: s.expireDate,
      stats: {
        total: s.stats?.total || 0,
        accuracy: s.stats?.total > 0 
          ? Math.round((s.stats.correct / s.stats.total) * 100) 
          : 0
      },
      streakDays: s.streakDays || 0,
      lastActive: s.lastActive || s.stats?.lastPracticeDate,
      achievements: s.achievements?.length || 0
    }))
    
    // 按最后活跃时间排序
    simplified.sort((a, b) => {
      const dateA = new Date(a.lastActive || 0)
      const dateB = new Date(b.lastActive || 0)
      return dateB.getTime() - dateA.getTime()
    })
    
    return NextResponse.json(simplified)
  } catch (error) {
    console.error('Students list error:', error)
    return NextResponse.json({ error: '获取学员列表失败' }, { status: 500 })
  }
}
