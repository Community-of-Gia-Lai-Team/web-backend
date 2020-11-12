import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import querystring from 'querystring'
import { v4 as uuid } from 'uuid'
import sqlite3 from 'sqlite3'

const API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const API_KEY = '305510256a262c0c312bf44cf226eecf'

const app = express()
const db = new sqlite3.Database('weather.db')

app.use(cors())

async function sendApiRequest(params) {
  const apiRes = await fetch(`${API_URL}?${querystring.encode(params)}`)
  return apiRes.json()
}

app.get('/weather/city', async (req, res) => {
  try {
    res.json(await sendApiRequest({
      lang: 'ru',
      units: 'metric',
      q: req.query['q'],
      appid: API_KEY
    }))
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.get('/weather/coords', async (req, res) => {
  try {
    res.json(await sendApiRequest({
      lang: 'ru',
      units: 'metric',
      lat: req.query['lat'],
      lon: req.query['lon'],
      appid: API_KEY
    }))
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.get('/weather/id', async (req, res) => {
  try {
    res.json(await sendApiRequest({
      lang: 'ru',
      units: 'metric',
      id: req.query['id'],
      appid: API_KEY
    }))
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.get('/register', async (req, res) => {
  try {
    res.json({
      id: uuid()
    })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.get('/favorites/get', async (req, res) => {
  const id = req.query['user']
  if (typeof id !== 'string') {
    res.status(500).end()
    return
  }

  const stmt = db.prepare(`SELECT city_id FROM favorites WHERE user_id = ?`)

  stmt.all(id, (err, rows) => {
    if (!err) {
      res.json(rows.map(r => r['city_id']))
    } else {
      res.status(500).end()
    }
  })

  stmt.finalize()
})

app.get('/favorites/add', async (req, res) => {
  const id = req.query['user']
  const city = Number(req.query['city'])
  if (typeof id !== 'string' || !Number.isInteger(city)) {
    res.status(500).end()
    return
  }

  const stmt = db.prepare(`INSERT INTO favorites VALUES (?, ?)`)

  stmt.run([id, city], (err, rows) => {
    if (!err) {
      res.json({ success: true })
    } else {
      res.status(500).end()
    }
  })

  stmt.finalize()
})

app.get('/favorites/remove', async (req, res) => {
  const id = req.query['user']
  const city = Number(req.query['city'])
  if (typeof id !== 'string' || !Number.isInteger(city)) {
    res.status(500).end()
    return
  }

  const stmt = db.prepare(`DELETE FROM favorites WHERE user_id = ? AND city_id = ?`)

  stmt.run([id, city], (err, rows) => {
    if (!err) {
      res.json({ success: true })
    } else {
      res.status(500).end()
    }
  })

  stmt.finalize()
})

const port = process.env.PORT ?? 8081

db.run(`
  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT,
    city_id INTEGER
  )
`, () => {
  app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
  })
})
