import { app } from './app.js'
import { db } from './db.js'

const port = process.env.PORT ?? 8081

db.run(`
  CREATE TABLE IF NOT EXISTS favorites (
    user_id TEXT,
    city_id INTEGER,
    UNIQUE(user_id, city_id)
  )
`, () => {
  app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
  })
})
