const mysql = require('mysql2/promise')

// 数据库配置（和 Navicat、freedb 后台完全一致）
const dbConfig = {
  host: 'sql.freedb.tech',
  port: 3306,
  user: 'u_Nm7PtN',
  password: 'hACYh3kbIzcx', // 删掉中文，只留纯密码，前后不要有空格
  database: 'freedb_pNLI7g2Z',
}

// 创建连接池（正确写法）
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
