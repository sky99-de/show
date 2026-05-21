/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const cors = require('cors')
const pool = require('./config/db')

const app = express()
const port = 3000

// 跨域全量配置
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)
app.use(express.json())

// ========== 1. 健康检查 ==========
app.get('/api/health', (req, res) => {
  res.send({ code: 200, msg: '后端服务运行正常' })
})

// ========== 2. 学生列表 ==========
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM students')
    res.send({ code: 200, data: rows })
  } catch (err) {
    console.error('查询失败：', err)
    res.send({ code: 500, msg: '查询失败：' + err.message })
  }
})

// ========== 3. 注册接口 ==========
app.post('/api/user/register', async (req, res) => {
  const { name, student_id, phone = '', password, building_name, room_number } = req.body
  console.log('【注册请求】收到参数：', req.body)

  if (!name || !student_id || !password || !building_name || !room_number) {
    return res.send({
      code: 400,
      msg: '请填写完整的注册信息（姓名、学号、密码、楼栋号、房间号为必填）',
    })
  }

  try {
    const [existRows] = await pool.execute('SELECT id FROM students WHERE student_id = ?', [
      student_id,
    ])
    if (existRows.length > 0) {
      return res.send({ code: 400, msg: '该学号已被注册，请更换' })
    }

    const [result] = await pool.execute(
      `INSERT INTO students (name, student_id, phone, password, building_name, room_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, student_id, phone, password, building_name, room_number],
    )

    console.log('【注册成功】插入数据ID：', result.insertId)
    res.send({ code: 200, msg: '注册成功！请前往登录' })
  } catch (err) {
    console.error('【注册失败】错误详情：', err)
    res.send({ code: 500, msg: '注册失败：' + err.message })
  }
})

// ========== 4. 登录接口 ==========
// 登录接口（双角色适配）
app.post('/api/user/login', async (req, res) => {
  const { username, password, role } = req.body
  console.log('【登录请求】收到参数：', req.body)

  // 1. 先校验参数
  if (!username || !password || !role) {
    console.log('❌ 参数不完整')
    return res.json({ code: 400, msg: '请填写账号、密码和身份' })
  }

  try {
    let userInfo = null

    // 2. 学生登录：查students表
    if (role === 'student') {
      const [userRows] = await pool.execute('SELECT * FROM students WHERE student_id = ?', [
        username,
      ])
      if (userRows.length === 0) {
        console.log('❌ 学生学号不存在')
        return res.json({ code: 400, msg: '学号不存在，请先注册' })
      }
      userInfo = userRows[0]
    }

    // 3. 管理员登录：查admin表
    if (role === 'admin') {
      const [adminRows] = await pool.execute('SELECT * FROM admin WHERE username = ?', [username])
      if (adminRows.length === 0) {
        console.log('❌ 管理员账号不存在')
        return res.json({ code: 400, msg: '管理员账号不存在' })
      }
      userInfo = adminRows[0]
    }

    // 4. 校验密码
    if (userInfo.password !== password) {
      console.log('❌ 密码错误')
      return res.json({ code: 400, msg: '密码错误，请重试' })
    }

    // 5. 登录成功，返回数据（格式必须和前端匹配）
    const { password: _, ...safeUserInfo } = userInfo
    const responseData = {
      code: 200,
      msg: '登录成功',
      data: {
        token: 'dorm_token_' + Date.now(),
        userInfo: safeUserInfo,
      },
    }

    console.log('✅ 登录成功，返回数据：', responseData)
    return res.json(responseData)
  } catch (err) {
    console.error('❌ 登录接口错误：', err)
    return res.json({ code: 500, msg: '登录失败：' + err.message })
  }
})

// ========== 5. 楼宇管理接口）==========
// 5.1 获取所有楼宇
app.get('/api/buildings', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, floors, manager, phone, status FROM buildings',
    )
    res.send({ code: 200, data: rows })
  } catch (err) {
    console.error('查询楼宇失败：', err)
    res.send({ code: 500, msg: '查询楼宇失败：' + err.message })
  }
})

// 5.2 新增楼宇
app.post('/api/buildings', async (req, res) => {
  const { name, floors, manager, phone, status } = req.body
  console.log('【新增楼宇】收到参数：', req.body)

  if (!name || !manager || !phone) {
    return res.send({ code: 400, msg: '楼宇名称、管理员和联系电话为必填项' })
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO buildings (name, floors, manager, phone, status) VALUES (?, ?, ?, ?, ?)',
      [name, floors || 6, manager, phone, status || '正常'],
    )

    console.log('【新增楼宇成功】插入数据ID：', result.insertId)
    res.send({ code: 200, data: { id: result.insertId }, msg: '新增楼宇成功' })
  } catch (err) {
    console.error('【新增楼宇失败】错误详情：', err)
    res.send({ code: 500, msg: '新增楼宇失败：' + err.message })
  }
})

// 5.3 更新楼宇
app.put('/api/buildings/:id', async (req, res) => {
  const { id } = req.params
  const { name, floors, manager, phone, status } = req.body
  console.log('【更新楼宇】ID:', id, '参数：', req.body)

  if (!name || !manager || !phone) {
    return res.send({ code: 400, msg: '楼宇名称、管理员和联系电话为必填项' })
  }

  try {
    await pool.execute(
      'UPDATE buildings SET name=?, floors=?, manager=?, phone=?, status=? WHERE id=?',
      [name, floors, manager, phone, status, id],
    )

    console.log('【更新楼宇成功】ID:', id)
    res.send({ code: 200, msg: '楼宇信息更新成功' })
  } catch (err) {
    console.error('【更新楼宇失败】错误详情：', err)
    res.send({ code: 500, msg: '更新楼宇失败：' + err.message })
  }
})

// 5.4 删除楼宇
app.delete('/api/buildings/:id', async (req, res) => {
  const { id } = req.params
  console.log('【删除楼宇】ID:', id)

  try {
    await pool.execute('DELETE FROM buildings WHERE id=?', [id])
    console.log('【删除楼宇成功】ID:', id)
    res.send({ code: 200, msg: '删除楼宇成功' })
  } catch (err) {
    console.error('【删除楼宇失败】错误详情：', err)
    res.send({ code: 500, msg: '删除楼宇失败：' + err.message })
  }
})

// 启动服务
app.listen(port, () => {
  console.log(`✅ 后端服务已启动，地址：http://localhost:${port}`)
  console.log(`📊 健康检查：http://localhost:${port}/api/health`)
  console.log(`📊 学生列表：http://localhost:${port}/api/students`)
  console.log(`📌 注册接口：POST http://localhost:${port}/api/user/register`)
  console.log(`📌 登录接口：POST http://localhost:${port}/api/user/login`)
  console.log(`🏢 楼宇列表：GET http://localhost:${port}/api/buildings`)
  console.log(`🏢 新增楼宇：POST http://localhost:${port}/api/buildings`)
  console.log(`🏢 更新楼宇：PUT http://localhost:${port}/api/buildings/:id`)
  console.log(`🏢 删除楼宇：DELETE http://localhost:${port}/api/buildings/:id`)
})
// ========== 6. 宿舍管理接口 ==========
// 6.1 获取所有宿舍（字段自动映射到前端）
app.get('/api/dorms', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM dorms')

    // 后端也做类型转换，确保返回正确的类型
    const formattedRows = rows.map((item) => ({
      id: Number(item.id),
      buildingName: String(item.building_name),
      roomNo: String(item.room_number),
      electricity: Number(item.balance),
      capacity: Number(item.student_count),
      powerStatus: String(item.power_status),
    }))

    res.send({ code: 200, data: formattedRows })
  } catch (err) {
    console.error('查询宿舍失败：', err)
    res.send({ code: 500, msg: '查询宿舍失败：' + err.message })
  }
})

// 6.2 新增宿舍
app.post('/api/dorms', async (req, res) => {
  const { buildingId, roomNo, capacity, electricity } = req.body
  console.log('【新增宿舍】收到参数：', req.body)

  if (!buildingId || !roomNo) {
    return res.send({ code: 400, msg: '所属楼宇和房间号为必填项' })
  }

  try {
    // 根据楼宇ID获取楼宇名称
    const [buildingRows] = await pool.execute('SELECT name FROM buildings WHERE id = ?', [
      buildingId,
    ])
    if (buildingRows.length === 0) {
      return res.send({ code: 400, msg: '所选楼宇不存在' })
    }
    const buildingName = buildingRows[0].name

    const [result] = await pool.execute(
      'INSERT INTO dorms (building_name, room_number, balance, student_count, power_status) VALUES (?, ?, ?, ?, ?)',
      [buildingName, roomNo, electricity || 0, capacity || 4, 'on'],
    )

    console.log('【新增宿舍成功】插入数据ID：', result.insertId)
    res.send({ code: 200, data: { id: result.insertId }, msg: '新增宿舍成功' })
  } catch (err) {
    console.error('【新增宿舍失败】错误详情：', err)
    res.send({ code: 500, msg: '新增宿舍失败：' + err.message })
  }
})

// 6.3 更新宿舍信息
app.put('/api/dorms/:id', async (req, res) => {
  const { id } = req.params
  const { buildingId, roomNo, capacity, electricity } = req.body
  console.log('【更新宿舍】ID:', id, '参数：', req.body)

  if (!buildingId || !roomNo) {
    return res.send({ code: 400, msg: '所属楼宇和房间号为必填项' })
  }

  try {
    // 根据楼宇ID获取楼宇名称
    const [buildingRows] = await pool.execute('SELECT name FROM buildings WHERE id = ?', [
      buildingId,
    ])
    if (buildingRows.length === 0) {
      return res.send({ code: 400, msg: '所选楼宇不存在' })
    }
    const buildingName = buildingRows[0].name

    await pool.execute(
      'UPDATE dorms SET building_name=?, room_number=?, balance=?, student_count=? WHERE id=?',
      [buildingName, roomNo, electricity, capacity, id],
    )

    console.log('【更新宿舍成功】ID:', id)
    res.send({ code: 200, msg: '宿舍信息更新成功' })
  } catch (err) {
    console.error('【更新宿舍失败】错误详情：', err)
    res.send({ code: 500, msg: '更新宿舍失败：' + err.message })
  }
})

// 6.4 删除宿舍
app.delete('/api/dorms/:id', async (req, res) => {
  const { id } = req.params
  console.log('【删除宿舍】ID:', id)

  try {
    await pool.execute('DELETE FROM dorms WHERE id=?', [id])
    console.log('【删除宿舍成功】ID:', id)
    res.send({ code: 200, msg: '删除宿舍成功' })
  } catch (err) {
    console.error('【删除宿舍失败】错误详情：', err)
    res.send({ code: 500, msg: '删除宿舍失败：' + err.message })
  }
})

// 6.5 切换宿舍通电状态（核心功能）
app.put('/api/dorms/:id/power', async (req, res) => {
  const { id } = req.params
  const { powerStatus } = req.body
  console.log('【切换通电状态】宿舍ID:', id, '目标状态:', powerStatus)

  if (!powerStatus || (powerStatus !== 'on' && powerStatus !== 'off')) {
    return res.send({ code: 400, msg: '状态参数错误' })
  }

  try {
    await pool.execute('UPDATE dorms SET power_status=? WHERE id=?', [powerStatus, id])
    const statusText = powerStatus === 'on' ? '通电' : '断电'
    console.log(`【${statusText}成功】宿舍ID:`, id)
    res.send({ code: 200, msg: `宿舍${statusText}成功` })
  } catch (err) {
    console.error('【切换通电状态失败】错误详情：', err)
    res.send({ code: 500, msg: '操作失败：' + err.message })
  }
})
// ========== 7. 学生管理接口 ==========
// 7.1 获取所有学生
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM students')

    // 字段映射：数据库下划线 -> 前端驼峰
    const formattedRows = rows.map((item) => ({
      id: Number(item.id),
      studentId: String(item.student_id),
      name: String(item.name),
      gender: String(item.sex),
      phone: String(item.phone || ''),
      buildingName: String(item.building_name || ''),
      roomNo: String(item.room_number || ''),
    }))

    res.send({ code: 200, data: formattedRows })
  } catch (err) {
    console.error('查询学生失败：', err)
    res.send({ code: 500, msg: '查询学生失败：' + err.message })
  }
})

// 7.2 新增学生
app.post('/api/students', async (req, res) => {
  const { studentId, name, gender, phone, buildingName, roomNo, password = '123456' } = req.body
  console.log('【新增学生】收到参数：', req.body)

  if (!studentId || !name) {
    return res.send({ code: 400, msg: '学号和姓名为必填项' })
  }

  try {
    // 检查学号是否已存在
    const [existRows] = await pool.execute('SELECT id FROM students WHERE student_id = ?', [
      studentId,
    ])
    if (existRows.length > 0) {
      return res.send({ code: 400, msg: '该学号已存在' })
    }

    const [result] = await pool.execute(
      'INSERT INTO students (student_id, name, sex, phone, password, building_name, room_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, name, gender, phone || '', password, buildingName || '', roomNo || ''],
    )

    console.log('【新增学生成功】插入数据ID：', result.insertId)
    res.send({ code: 200, data: { id: result.insertId }, msg: '学生信息录入成功' })
  } catch (err) {
    console.error('【新增学生失败】错误详情：', err)
    res.send({ code: 500, msg: '新增学生失败：' + err.message })
  }
})

// 7.3 更新学生信息
app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params
  const { name, gender, phone, buildingName, roomNo } = req.body
  console.log('【更新学生】ID:', id, '参数：', req.body)

  if (!name) {
    return res.send({ code: 400, msg: '姓名为必填项' })
  }

  try {
    await pool.execute(
      'UPDATE students SET name=?, sex=?, phone=?, building_name=?, room_number=? WHERE id=?',
      [name, gender, phone || '', buildingName || '', roomNo || '', id],
    )

    console.log('【更新学生成功】ID:', id)
    res.send({ code: 200, msg: '学生信息更新成功' })
  } catch (err) {
    console.error('【更新学生失败】错误详情：', err)
    res.send({ code: 500, msg: '更新学生失败：' + err.message })
  }
})

// 7.4 学生退宿（软删除，清空宿舍信息）
app.put('/api/students/:id/checkout', async (req, res) => {
  const { id } = req.params
  console.log('【学生退宿】ID:', id)

  try {
    await pool.execute('UPDATE students SET building_name=?, room_number=? WHERE id=?', [
      '',
      '',
      id,
    ])

    console.log('【学生退宿成功】ID:', id)
    res.send({ code: 200, msg: '退宿办理成功' })
  } catch (err) {
    console.error('【学生退宿失败】错误详情：', err)
    res.send({ code: 500, msg: '退宿办理失败：' + err.message })
  }
})

// 7.5 获取所有可用楼宇和房间（从dorms表获取）
app.get('/api/buildings-rooms', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT DISTINCT building_name, room_number FROM dorms ORDER BY building_name, room_number',
    )

    // 整理成楼宇-房间的树形结构
    const buildingRooms = {}
    rows.forEach((item) => {
      const building = item.building_name
      const room = item.room_number
      if (!buildingRooms[building]) {
        buildingRooms[building] = []
      }
      buildingRooms[building].push(room)
    })

    // 转换为前端需要的格式
    const buildings = Object.keys(buildingRooms).map((name, index) => ({
      id: index + 1,
      name: name,
    }))

    res.send({ code: 200, data: { buildings, buildingRooms } })
  } catch (err) {
    console.error('查询楼宇房间失败：', err)
    res.send({ code: 500, msg: '查询楼宇房间失败：' + err.message })
  }
})
// ========== 8. 充值和缴费流水接口 ==========
// 8.1 执行充值（核心事务接口）
app.post('/api/recharge', async (req, res) => {
  const { buildingName, roomNo, amount, paymentMethod, remark, studentId } = req.body
  console.log('【充值请求】收到参数：', req.body)

  if (!buildingName || !roomNo || !amount || amount <= 0) {
    return res.send({ code: 400, msg: '参数错误，充值金额必须大于0' })
  }

  let connection = null
  try {
    // 获取数据库连接，开启事务
    connection = await pool.getConnection()
    await connection.beginTransaction()

    // 1. 查询宿舍当前余额
    const [dormRows] = await connection.execute(
      'SELECT id, balance FROM dorms WHERE building_name = ? AND room_number = ?',
      [buildingName, roomNo],
    )

    if (dormRows.length === 0) {
      await connection.rollback()
      return res.send({ code: 400, msg: '宿舍不存在' })
    }

    const dorm = dormRows[0]
    const beforeBalance = Number(dorm.balance)
    const afterBalance = beforeBalance + Number(amount)

    // 2. 更新宿舍余额
    await connection.execute('UPDATE dorms SET balance = ? WHERE id = ?', [afterBalance, dorm.id])

    // 3. 创建充值记录
    const [result] = await connection.execute(
      `INSERT INTO payment_records
       (building_name, room_number, amount, before_balance, after_balance, payment_method, remark, student_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        buildingName,
        roomNo,
        amount,
        beforeBalance,
        afterBalance,
        paymentMethod || '微信支付',
        remark || '宿舍电费充值',
        studentId || '',
      ],
    )

    // 提交事务
    await connection.commit()
    console.log('【充值成功】记录ID：', result.insertId)
    res.send({
      code: 200,
      data: {
        recordId: result.insertId,
        newBalance: afterBalance,
      },
      msg: '充值成功',
    })
  } catch (err) {
    // 发生错误回滚事务
    if (connection) await connection.rollback()
    console.error('【充值失败】错误详情：', err)
    res.send({ code: 500, msg: '充值失败：' + err.message })
  } finally {
    // 释放连接
    if (connection) connection.release()
  }
})

// 8.2 获取所有充值记录（管理员）
app.get('/api/payment-records', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM payment_records ORDER BY created_at DESC')
    res.send({ code: 200, data: rows })
  } catch (err) {
    console.error('查询充值记录失败：', err)
    res.send({ code: 500, msg: '查询充值记录失败：' + err.message })
  }
})

// 8.3 获取指定学生的充值记录（学生端）
app.get('/api/payment-records/student/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_records WHERE student_id = ? ORDER BY created_at DESC',
      [studentId],
    )
    res.send({ code: 200, data: rows })
  } catch (err) {
    console.error('查询学生充值记录失败：', err)
    res.send({ code: 500, msg: '查询充值记录失败：' + err.message })
  }
})
