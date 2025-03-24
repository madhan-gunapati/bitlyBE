const app = require('./dist/index')
const server = require('./dist/index')
const request =  require('supertest')

describe('first route' , ()=>{
    test('accessing get' , async()=>{
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200)
    })
    afterAll((done)=>{
        server.close(done);
    })
})