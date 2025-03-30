import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../app";
import request from 'supertest'
import { prismaClient } from "../__mocks__/db";

import jwt from 'jsonwebtoken'



vi.mock('../db')
// vi.mock('jsonwebtoken' , ()=>({
//     verify:vi.fn(),
//     sign:vi.fn()
// }))

vi.mock('jsonwebtoken', () => ({default:{
    sign: vi.fn(()=>'sample token'),
    verify: vi.fn(() => ({ id: 'mockedUserId' })),
  }}));


  vi.mock('bcrypt', ()=>({default:{
    compare:vi.fn(()=>true),
    hash:vi.fn()
  }}))

describe('test suite 1' , ()=>{
    it('test 1' , ()=>{
        expect(2+3).toBe(5)
    })

})





describe('route / GET' , ()=>{
    it('normal response' , async()=>{
        const res = await request(app).get('/')
        expect(res.statusCode).toBe(200)
    })
})

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
        prismaClient.user.findUnique.mockResolvedValue({id:1, name:'sample' , email:'sample@gmail.com' , createAt:mockDate , password:'hashedPassword'})
        
       
        const res = await request(app).post('/login').send({email:'sample@email.com', password:'sample'})
      
        console.log(res.text)
        expect(res.statusCode).toBe(200)
    })
})