import mocha from 'mocha'
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon'

import { app } from '../src/app.js'
import { Api } from '../src/Api.js'
import sqlite3 from 'sqlite3'

chai.use(chaiHttp);
chai.should();

const { describe, it } = mocha
const { stub, fake } = sinon
const { request, expect } = chai

describe('/weather', () => {
  const sampleResponse = {"coord":{"lon":37.62,"lat":55.75},"weather":[{"id":600,"main":"Snow","description":"небольшой снег","icon":"13n"}],"base":"stations","main":{"temp":-1.96,"feels_like":-7.01,"temp_min":-2.22,"temp_max":-1.67,"pressure":1019,"humidity":100},"visibility":10000,"wind":{"speed":4,"deg":230},"snow":{"1h":0.23},"clouds":{"all":90},"dt":1608155069,"sys":{"type":1,"id":9029,"country":"RU","sunrise":1608184508,"sunset":1608209786},"timezone":10800,"id":524901,"name":"Москва","cod":200}
  stub(Api.prototype, 'getWeather').returns(sampleResponse)

  describe('GET /weather/city', () => {
    it('Should return 200', (done) => {
      request(app)
        .get('/weather/city?q=Moscow')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.not.be.empty

          done()
        })
    })

    it('Should return 422 (missing q)', (done) => {
      request(app)
        .get('/weather/city')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })
  })

  describe('GET /weather/coords', () => {
    it('Should return 200', (done) => {
      request(app)
        .get('/weather/coords?lat=30&lon=20')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.not.be.empty

          done()
        })
    })

    it('Should return 422 (missing lon)', (done) => {
      request(app)
        .get('/weather/coords?lat=30')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })

    it('Should return 422 (missing lat)', (done) => {
      request(app)
        .get('/weather/coords?lon=20')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })

    it('Should return 422 (missing lat & lon)', (done) => {
      request(app)
        .get('/weather/coords')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })
  })

  describe('GET /weather/id', () => {
    it('Should return 200', (done) => {
      request(app)
        .get('/weather/id?id=0')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.not.be.empty

          done()
        })
    })

    it('Should return 422 (missing id)', (done) => {
      request(app)
        .get('/weather/id')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })
  })
})

describe('/register', () => {
  describe('GET /register', () => {
    it('Should return 200', (done) => {
      request(app)
        .get('/register')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.not.be.empty

          done()
        })
    })
  })
})

describe('/favorites', () => {
  const sampleFavorites = [1, 3, 5]
  const prepare = stub(sqlite3.Database.prototype, 'prepare')

  prepare.onCall(0).returns({
    all: (args, cb) => cb(undefined, sampleFavorites.map(f => ({ city_id: f }))),
    finalize: fake()
  })

  prepare.onCall(1).returns({
    run: (args, cb) => cb(undefined),
    finalize: fake()
  })

  prepare.onCall(2).returns({
    run: (args, cb) => cb(undefined),
    finalize: fake()
  })
  
  describe('GET /favorites', () => {
    it('Should return 200', (done) => {
      request(app)
        .get('/favorites?user=0')
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.not.be.empty

          done()
        })
    })

    it('Should return 422', (done) => {
      request(app)
        .get('/favorites')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })
  })

  describe('POST /favorites', () => {
    it('Should return 200', (done) => {
      request(app)
        .post('/favorites')
        .send({ user: '0', city: 1 })
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('success', true)

          done()
        })
    })

    it('Should return 422 (no body)', (done) => {
      request(app)
        .post('/favorites')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })

    it('Should return 422 (empty object)', (done) => {
      request(app)
        .post('/favorites')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })
  })

  describe('DELETE /favorites', () => {
    it('Should return 200', (done) => {
      request(app)
        .delete('/favorites')
        .send({ user: '0', city: 1 })
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('success', true)

          done()
        })
    })

    it('Should return 422 (no body)', (done) => {
      request(app)
        .delete('/favorites')
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })
  
    it('Should return 422 (empty object)', (done) => {
      request(app)
        .delete('/favorites')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(422)
          done()
        })
    })
  })
})
