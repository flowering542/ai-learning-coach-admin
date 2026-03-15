import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

const DATA_DIR = process.env.DATA_DIR || '../ai-learning-coach/data'

// 生成随机激活码
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const codesPath = path.join(DATA_DIR, 'activation-codes.json')
    
    if (!fs.existsSync(codesPath)) {
      return NextResponse.json({ codes: [] })
    }
    
    const data = JSON.parse(fs.readFileSync(codesPath, 'utf8'))
    
    // 按创建时间倒序，只返回最近50个
    const codes = (data.codes || [])
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)
    
    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Get codes error:', error)
    return NextResponse.json({ error: '获取激活码失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { count = 1, version = 'standard', expireDays = 365 } = await request.json()
    
    if (count < 1 || count > 100) {
      return NextResponse.json({ error: '生成数量必须在1-100之间' }, { status: 400 })
    }
    
    const codesPath = path.join(DATA_DIR, 'activation-codes.json')
    
    // 读取现有激活码
    let data: any = { codes: [] }
    if (fs.existsSync(codesPath)) {
      data = JSON.parse(fs.readFileSync(codesPath, 'utf8'))
    }
    
    // 生成新激活码
    const newCodes = []
    for (let i = 0; i < count; i++) {
      let code = generateCode()
      // 确保不重复
      while (data.codes.some((c: any) => c.code === code)) {
        code = generateCode()
      }
      
      const newCode = {
        code,
        version,
        expireDays,
        used: false,
        usedBy: null,
        usedAt: null,
        createdAt: new Date().toISOString()
      }
      
      data.codes.push(newCode)
      newCodes.push(newCode)
    }
    
    // 保存
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(codesPath, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      generated: newCodes.length,
      codes: newCodes 
    })
  } catch (error) {
    console.error('Generate codes error:', error)
    return NextResponse.json({ error: '生成激活码失败' }, { status: 500 })
  }
}
