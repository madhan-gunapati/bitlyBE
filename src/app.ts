import  { Request , Response , NextFunction} from 'express';
import { nanoid } from 'nanoid';
import { prismaClient } from './db';

import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// const express = require('express');
const cors = require('cors');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken')
const app = express();

app.use(express.json())
app.use(cors())



interface payload {
    email:string
}

interface Incoming_Request extends Request{
    email?:payload
}


// const prisma = new PrismaClient();



const authorization_middleware = (req :Incoming_Request, res:Response, next:NextFunction)=>{
    try{
    const token = req.headers.authorization?.split(" ")[1]
    
    if(token !== undefined){
    const email = jwt.verify(token, 'my-secret-token') as payload

    req.email = email
    
    next()
    }
    }
    catch(e){
       next(e)
    }
}

app.get('/', (req:Request, res:Response)=>{
    
    res.send('App is working Fine')
    
})

app.put('/user-registration',async (req:Incoming_Request, res:Response, next:NextFunction)=>{
    
    const {name , email , password} = req.body
    
    const hashed_password  = await bcrypt.hash(password , 10)
    
    try{
    const db_response =await prismaClient.user.create({
        data:{name, email, password:hashed_password}
    })
    
    const {id} = db_response
    
    res.json({id})
   // res.send(db_response)
    }
    catch(e:any){
       
        if(e.code=='P2002'){
            
            res.status(400).send('Unique Constraint Violation')
        }
        else{
            
           next(e)
        }
    }
    
})

app.post('/login', async(req:Incoming_Request, res:Response, next:NextFunction)=>{
    
    
    try{
    const {email, password}:{email:string , password:any} = req.body
    const email_found = await prismaClient.user.findUnique({
        where:{email:email}
    })
   
    
    if(email_found===null){
        
        res.status(404).send('User Not Found')
    }
    else{
        const hashed_password = email_found.password
        
        
        const result  = await bcrypt.compare(password, hashed_password)

        
        
        if(result){
            const payload = {email}
           
            const token = jwt.sign(payload, 'my-secret-token')
            res.send(token)
        }
        else{
            res.status(404).send('Incorrect Password')
        }
        
    }
}
catch(e){
    next(e)
}
    
   
})

app.put('/short-url',authorization_middleware,async(req:Incoming_Request, res:Response, next:NextFunction)=>{
    try{
    const {input_url } = req.body
    if(!req.email){
        res.status(400).send('Bad Request');
        return;
    }
   
    const {email} = req.email
    
    const user = await prismaClient.user.findUnique({where:{
        email
    }})
    if(!user){
     res.status(400).send('Bad Request');
     return ;
    }

    const {id} = user
    
    const short_url = 'tiny/'+String(nanoid(4))
    
    const userId = id

  

    const storage_result = await prismaClient.links.create({
        data:{
            LongUrl:input_url , shortUrl:short_url,
            user :{connect:{id:userId}}
        }
    })
    
    res.json({short_url})
}
catch(e){
    next(e)
}

})
app.put('/redirection-url',async(req:Incoming_Request, res:Response, next:NextFunction)=>{
    
    const {short_url} = req.body
    
    try{
    
    const result= await prismaClient.links.findMany({where:{
        shortUrl:short_url
    }})
    if(result === null){
        res.send('www.notfound.com')
    }
    else{
    res.send(result[0].LongUrl)
    }
}
catch(e){
    next(e)
}
})

app.use((error:unknown, req:Request, res:Response, next:NextFunction)=>{
    if(error instanceof Error){
    res.send(500).json({ message: error.message });
    }
    else{
        res.send(500).json({message:'unknown Error'})
    }
    
})

export default app;