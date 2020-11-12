import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

app.get('/weather', (req, res) => {
  res.end('Hello world!')
})

const port = process.env.PORT ?? 8081
app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
