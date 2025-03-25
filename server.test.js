const {default:app} = require('./dist/app')

const request =  require('supertest')

describe('first route' , ()=>{
    test('accessing get' , async()=>{
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200)
    })
   
})