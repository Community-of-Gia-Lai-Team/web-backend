import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { v4 as uuid } from 'uuid'
import { Api } from './Api.js'
import { db } from './db.js'

export const app = express()

const api = new Api()

app.use(cors())
app.use(bodyParser.json())

app.get('/weather/city', async (req, res) => {
  const q = req.query['q']
  if (typeof q !== 'string') {
    res.status(422).end()
    return
  }

  try {
    res.json(await api.getWeather({ q }))
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.get('/weather/coords', async (req, res) => {
  const lat = req.query['lat']
  const lon = req.query['lon']
  if (typeof lat !== 'string' || typeof lon !== 'string') {
    res.status(422).end()
    return
  }

  try {
    res.json(await api.getWeather({ lat, lon }))
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

app.get('/weather/id', async (req, res) => {
  const id = req.query['id']
  if (typeof id !== 'string') {
    res.status(422).end()
    return
  }

  try {
    res.json(await api.getWeather({ id }))
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

app.get('/favorites', async (req, res) => {
  const id = req.query['user']
  if (typeof id !== 'string') {
    res.status(422).end()
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

app.post('/favorites', async (req, res) => {
  const id = req.body['user']
  const city = Number(req.body['city'])

  if (typeof id !== 'string' || !Number.isInteger(city)) {
    res.status(422).end()
    return
  }

  const stmt = db.prepare(`INSERT INTO favorites VALUES (?, ?)`)

  stmt.run([id, city], (err) => {
    if (!err) {
      res.json({ success: true })
    } else {
      res.status(500).end()
    }
  })

  stmt.finalize()
})

app.delete('/favorites', async (req, res) => {
  const id = req.body['user']
  const city = Number(req.body['city'])
  if (typeof id !== 'string' || !Number.isInteger(city)) {
    res.status(422).end()
    return
  }

  const stmt = db.prepare(`DELETE FROM favorites WHERE user_id = ? AND city_id = ?`)

  stmt.run([id, city], (err) => {
    if (!err) {
      res.json({ success: true })
    } else {
      res.status(500).end()
    }
  })

  stmt.finalize()
})
