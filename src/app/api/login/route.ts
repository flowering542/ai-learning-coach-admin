import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

const DATA_DIR = process.env.DATA_DIR || '../ai-learning-coach/data'
const JWT_SECRET = process.env.JWT_SECRET || 'coach-admin-secret-key-2025'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    // 读取管理员配置
    const adminPath = path.join(DATA_DIR, 'admin.json')
    if (!fs.existsSync(adminPath)) {
      // 首次登录，创建默认管理员
      const defaultAdmin = {
        admins: [{
          username: 'admin',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'super',
          createdAt: new Date().toISOString()
        }]
      }
      fs.mkdirSync(DATA_DIR, { recursive: true })
      fs.writeFileSync(adminPath, JSON.stringify(defaultAdmin, null, 2))
    }
    
    const adminData = JSON.parse(fs.readFileSync(adminPath, 'utf8'))
    const admin = adminData.admins.find((a: any) => a.username === username)
    
    if (!admin) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' })
    }
    
    const valid = bcrypt.compareSync(password, admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' })
    }
    
    // 生成JWT
    const token = jwt.sign(
      { username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    )
    
    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: '服务器错误' })
  }
}
