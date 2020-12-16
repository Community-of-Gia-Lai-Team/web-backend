import fetch from 'node-fetch'
import querystring from 'querystring'

export class Api {
  static URL = 'https://api.openweathermap.org/data/2.5/weather'
  static KEY = '305510256a262c0c312bf44cf226eecf'
  
  async getWeather(params) {
    const query = querystring.encode({
      ...params,
      appid: Api.KEY,
      lang: 'ru',
      units: 'metric'
    })

    const res = await fetch(`${Api.URL}?${query}`)
    return res.json()
  }
}
