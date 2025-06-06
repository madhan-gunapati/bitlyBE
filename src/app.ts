import  { Request , Response , NextFunction} from 'express';
import { nanoid } from 'nanoid';
import { prismaClient } from './db';

import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { error } from 'console';

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
    const {email} = jwt.verify(token, 'my-secret-token') as payload
        
    req.email = {email}
    
    next()
    }
    else{
        res.status(404).send('invalid token')
        return ;
    }
    }
    catch(e){
       next(e)
    }
}

// app.get('/', (req:Request, res:Response)=>{
    
//     res.send('App is working Fine')
    
// })

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
    // if(e instanceof Error){
    //     res.send(404)
    // console.log(e.message)
    // }
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
    
    const short_url = 'emjey.live/'+String(nanoid(4))
    
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


app.get('/:short_url',async(req:Incoming_Request, res:Response, next:NextFunction)=>{
    
    const {short_url} = req.params
    console.log('emjey.live/'+short_url)
    try{
    
    const result= await prismaClient.links.findMany({where:{
        shortUrl:'emjey.live/'+short_url
        //have to change this to unique constraint in the db, to use findUnique
    }})
    
    
    if(result.length===0 ){
        
        res.redirect('https://bitly-fe-ts.vercel.app/')
    }
    else{
        const url = result[0].LongUrl
        if(url.startsWith('http://') || url.startsWith('https://')){
            res.redirect(url)
        }
        else{
            res.redirect('https://'+url)
            }
        }
    }
catch(e){
    next(e)
}
})

app.use((error:unknown, req:Request, res:Response, next:NextFunction)=>{
    
    if(error instanceof Error){
        console.log(error.message)
    res.sendStatus(500)
   // res.sendStatus(404)
    }
    else{
        res.status(500).json({message:'unknown Error'})
    }
    
})

export default app;