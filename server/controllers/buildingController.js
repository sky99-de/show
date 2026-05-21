const { pool } = require('../config/db')

// 获取所有楼宇
const getAllBuildings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, floors, manager, phone, status FROM buildings',
    )
    res.json({
      code: 200,
      data: rows,
      message: '获取成功',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
}

// 新增楼宇
const createBuilding = async (req, res) => {
  try {
    const { name, floors, manager, phone, status } = req.body

    if (!name || !manager || !phone) {
      return res.status(400).json({ code: 400, message: '参数不完整' })
    }

    const [result] = await pool.query(
      'INSERT INTO buildings (name, floors, manager, phone, status) VALUES (?, ?, ?, ?, ?)',
      [name, floors, manager, phone, status],
    )

    res.json({
      code: 200,
      data: { id: result.insertId },
      message: '新增成功',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
}

// 更新楼宇
const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params
    const { name, floors, manager, phone, status } = req.body

    if (!name || !manager || !phone) {
      return res.status(400).json({ code: 400, message: '参数不完整' })
    }

    await pool.query(
      'UPDATE buildings SET name=?, floors=?, manager=?, phone=?, status=? WHERE id=?',
      [name, floors, manager, phone, status, id],
    )

    res.json({
      code: 200,
      message: '更新成功',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
}

// 删除楼宇
const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params

    await pool.query('DELETE FROM buildings WHERE id=?', [id])

    res.json({
      code: 200,
      message: '删除成功',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
}

module.exports = {
  getAllBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
}
