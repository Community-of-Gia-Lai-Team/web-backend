import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import querystring from 'querystring'

const API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const API_KEY = '305510256a262c0c312bf44cf226eecf'

const app = express()

app.use(cors())

app.get('/weather', async (req, res) => {
  try {
    const params = { ...req.query, appid: API_KEY }
    const apiRes = await fetch(`${API_URL}?${querystring.encode(params)}`)
    res.json(await apiRes.json())
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
})

const port = process.env.PORT ?? 8081
app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
