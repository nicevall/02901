// backend/routes/test.js o donde manejes las rutas
const express = require('express')
const router = express.Router()

router.get('/test', (req, res) => {
  res.json({ message: 'API is reachable' })
})

module.exports = router
