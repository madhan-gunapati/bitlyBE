import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../app";
import request from 'supertest'
import { prismaClient } from "../__mocks__/db";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'



vi.mock('../db')


vi.mock('jsonwebtoken', () => ({default:{
    sign: vi.fn(()=>'sample token'),
    verify: vi.fn(() => ({ email: 'mockedUseremail@mail.com' })),
  }}));


  vi.mock('bcrypt', ()=>({default:{
    compare:vi.fn(),
    hash:vi.fn()
  }}))

describe('test suite 1' , ()=>{
    it('test 1' , ()=>{
        expect(2+3).toBe(5)
    })

})





// describe('route / GET' , ()=>{
//     it('normal response' , async()=>{
//         const res = await request(app).get('/')
//         expect(res.statusCode).toBe(200)
//     })
// })

describe('route PUT /user-registration' , ()=>{
    it('new user reg' , async()=>{
        const mockDate = new Date("2025-03-30T12:00:00.000Z");
        prismaClient.user.create.mockResolvedValue({id:1, name:'sample' , email:'sample@gmail.com' ,createAt:mockDate ,password:'sample password' })
        
        const res = await request(app).put('/user-registration').send({name:'sample' , email:'sample@gmail.com' , password:'sample_password'})
        
        expect(res.body.id).toBe(1)
       
    })  

    it('return unique constraint violation' , async()=>{
        prismaClient.user.create.mockRejectedValue({code:'P2002'})
        const res = await request(app).put('/user-registration').send({name:'sample' , email:'sample@gmail.com' , password:'sample_password'})
       // console.log(res.text)
        expect(res.text).toBe('Unique Constraint Violation');
        
    })
})

describe('Route Login POST' , ()=>{
    it('should reutrn jwt token' , async()=>{
        const mockDate = new Date("2025-03-30T12:00:00.000Z");
        bcrypt.compare.mockResolvedValueOnce(true); 
        prismaClient.user.findUnique.mockResolvedValue({id:1, name:'sample' , email:'sample@gmail.com' , createAt:mockDate , password:'hashedPassword'})
        
       
        const res = await request(app).post('/login').send({email:'sample@email.com', password:'sample'})
      
        
        expect(res.statusCode).toBe(200)
    })
    it('should return user not found' , async()=>{
        prismaClient.user.findUnique.mockResolvedValue(null)
        
        const res = await request(app).post('/login').send({email:'dummy@email.com', password:'sample'})
        
        expect(res.statusCode).toBe(404);
        expect(res.text).toBe('User Not Found')
    })
    it('should return wrong password' , async ()=>{
        const mockDate = new Date("2025-03-30T12:00:00.000Z");
        bcrypt.compare.mockResolvedValueOnce(false); 
        prismaClient.user.findUnique.mockResolvedValue({id:1, name:'sample' , email:'sample@gmail.com' , createAt:mockDate , password:'hashedPassword'})
        
       
        const res = await request(app).post('/login').send({email:'sample@email.com', password:'sample'})
      
        
        expect(res.statusCode).toBe(404)
        expect(res.text).toBe('Incorrect Password')
    })
})

describe('short url generation' , ()=>{
    it('normal generation' , async()=>{
        const res =  await request(app).put('/short-url').set('Authorization', 'Bearer your-token').send({"url":"www.sampleurl.com"})
        
        expect(res.statusCode).toBe(200)
        
        expect(res.body.short_url).toBeTypeOf('string')
    })
    it('should give invalid token' , async()=>{
        const res =  await request(app).put('/short-url').set('Authorization', '').send({"url":"www.sampleurl.com"})
        
        expect(res.statusCode).toBe(404)
        expect(res.text).toBe('invalid token')
    })
})

describe('test for Redirection URL' , ()=>{
    it('should give a not found url' , async()=>{
        prismaClient.links.findMany.mockResolvedValue([])
        const res = await request(app).get('/redirection-url')
        
        expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://bitly-fe-ts.vercel.app/');
        
    })
    it('should give a redirection url' , async()=>{
        const mockDate = new Date("2025-03-30T12:00:00.000Z");
        prismaClient.links.findMany.mockResolvedValue([{id: 22,
            userId: 1,
            LongUrl: 'www.google.com',
            shortUrl: 'tiny/sample',
            createdAt: mockDate}])
        const res = await request(app).get('/redirection-url').send({"short_url":"sample"})
        
        expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('https://www.google.com');
        
    })
})