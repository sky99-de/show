// server/config/db.js
const mysql = require('mysql2/promise')

// 你的数据库配置（和Navicat完全一致）
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'dorm_management',
  connectionLimit: 10,
  charset: 'utf8mb4',
  timezone: '+08:00',
}

// 创建连接池
const pool = mysql.createPool(dbConfig)

// 测试数据库连接
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 数据库连接成功！已适配 dorm_management 数据库')
    connection.release()
  } catch (err) {
    console.error('❌ 数据库连接失败：', err.message)
  }
}

testDbConnection()

module.exports = pool
