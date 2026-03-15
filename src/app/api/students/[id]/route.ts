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
    
    // 读取题库，用于解析错题
    const questionsPath = path.join(DATA_DIR, 'questions-v2-final.json')
    let questions: any[] = []
    if (fs.existsSync(questionsPath)) {
      questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'))
    }
    
    // 解析错题详情
    const wrongQuestionsDetails = (student.wrongQuestions || []).map((wq: any) => {
      const question = questions.find((q: any) => q.id === wq.id)
      return {
        ...wq,
        question: question?.question || '题目已删除',
        dimension: question?.dimension || '未知',
        correctCount: wq.correctCount || 0,
        lastWrongAt: wq.lastWrongAt
      }
    })
    
    // 统计各维度答题情况
    const dimensionStats = {
      '基础知识': { total: 0, correct: 0 },
      '相关专业知识': { total: 0, correct: 0 },
      '专业知识': { total: 0, correct: 0 },
      '专业实践能力': { total: 0, correct: 0 }
    }
    
    // 从答题记录统计（如果有）
    if (student.answerHistory) {
      student.answerHistory.forEach((record: any) => {
        const q = questions.find((q: any) => q.id === record.questionId)
        if (q && dimensionStats[q.dimension as keyof typeof dimensionStats]) {
          dimensionStats[q.dimension as keyof typeof dimensionStats].total++
          if (record.correct) {
            dimensionStats[q.dimension as keyof typeof dimensionStats].correct++
          }
        }
      })
    }
    
    return NextResponse.json({
      ...student,
      wrongQuestionsDetails,
      dimensionStats,
      accuracy: student.stats?.total > 0 
        ? Math.round((student.stats.correct / student.stats.total) * 100) 
        : 0
    })
  } catch (error) {
    console.error('Student detail error:', error)
    return NextResponse.json({ error: '获取学员详情失败' }, { status: 500 })
  }
}
