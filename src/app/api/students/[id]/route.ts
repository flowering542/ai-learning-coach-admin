import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = process.env.DATA_DIR || '../ai-learning-coach/data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
    // 读取学员数据
    const studentPath = path.join(DATA_DIR, 'students', `${userId}.json`)
    
    if (!fs.existsSync(studentPath)) {
      return NextResponse.json({ error: '学员不存在' }, { status: 404 })
    }
    
    const student = JSON.parse(fs.readFileSync(studentPath, 'utf8'))
    
    // 标准化数据结构
    const normalizedStudent = {
      userId: student.userId || student.id || userId,
      level: student.level,
      version: student.version || 'free',
      activated: student.activated || !!student.activationCode,
      activationCode: student.activationCode,
      stats: {
        total: student.stats?.total || student.totalQuestions || 0,
        correct: student.stats?.correct || student.correctAnswers || 0,
        wrong: student.stats?.wrong || (student.wrongAnswers?.length || 0)
      },
      streakDays: student.streakDays || 0,
      achievements: student.achievements || [],
      lastActive: student.lastActive || student.lastActiveAt,
      assessment: student.assessment,
      // 错题详情
      wrongQuestionsDetails: (student.wrongAnswers || []).map((wq: any) => ({
        id: wq.questionId,
        question: wq.question,
        dimension: '未知',
        correctCount: 0,
        lastWrongAt: wq.timestamp,
        yourAnswer: wq.yourAnswer,
        correctAnswer: wq.correctAnswer,
        reason: wq.reason
      })),
      // 维度统计
      dimensionStats: {
        '基础知识': { total: 0, correct: 0 },
        '相关专业知识': { total: 0, correct: 0 },
        '专业知识': { total: 0, correct: 0 },
        '专业实践能力': { total: 0, correct: 0 }
      }
    }
    
    // 计算正确率
    normalizedStudent.accuracy = normalizedStudent.stats.total > 0 
      ? Math.round((normalizedStudent.stats.correct / normalizedStudent.stats.total) * 100) 
      : 0
    
    return NextResponse.json(normalizedStudent)
  } catch (error) {
    console.error('Student detail error:', error)
    return NextResponse.json({ error: '获取学员详情失败' }, { status: 500 })
  }
}
