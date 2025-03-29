import { describe, expect, it, vi } from "vitest";
import app from "../app";
import request from 'supertest'
import { prismaClient } from "../__mocks__/db";
import { Jwt } from "jsonwebtoken";
import { verify } from "crypto";

vi.mock('../db')
describe('test suite 1' , ()=>{
    it('test 1' , ()=>{
        expect(2+3).toBe(5)
    })

})


vi.mock('jsonwebtoken' , ()=>({
    verify:vi.fn()
}))


describe('route / GET' , ()=>{
    it('normal response' , async()=>{
        const res = await request(app).get('/')
        expect(res.statusCode).toBe(200)
    })
})

describe('route PUT /user-registration' , ()=>{
    it('new user reg' , async()=>{
        prismaClient.user.create.mockResolvedValue({id:1, name:'sample' , email:'sample@gmail.com' ,createAt:220456 ,password:'sample password' })
        
        const res = await request(app).put('/user-registration').send({name:'sample' , email:'sample@gmail.com' , password:'sample_password'})
        
        expect(res.body.id).toBe(1)
    })  

    it('return unique constraint violation' , async()=>{
        prismaClient.user.create.mockRejectedValue({code:'P2002'})
        const res = await request(app).put('/user-registration').send({name:'sample' , email:'sample@gmail.com' , password:'sample_password'})
        console.log(res.text)
        expect(res.text).toBe('Unique Constraint Violation');
    })
})