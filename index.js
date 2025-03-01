import express from 'express';
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const app = express();
app.use(express.json())
app.use(cors())
import { nanoid } from 'nanoid';

import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();



//const putDatainDB = async()=>{
    
//   const res1=  await prisma.user.create({
//         data:{
//             name:'Ravi', email:'alice@example.com'
//         }
//     })
//     console.log('Data Added')
//     const res2 = await prisma.user.findUnique({
//         where:{
//             email:'alice@example.com'
//         }
//     })
//     console.log(res2)
    
//}

//putDatainDB();

// console.log(nanoid(5))

const authorization_middleware = (req, res, next)=>{
    try{
    const token = req.headers.authorization.split(" ")[1]
    
    
    const email = jwt.verify(token, 'my-secret-token')
    req.email = email
    
    next()
    }
    catch(e){
       next(e)
    }
}

app.get('/', (req, res)=>{
    
    res.send('App is working Fine')
    
})

app.put('/user-registration',async (req, res, next)=>{
    
    const {name , email , password} = req.body
    
    const hashed_password  = await bcrypt.hash(password , 10)
    
    try{
    const db_response =await prisma.user.create({
        data:{name, email, password:hashed_password}
    })
    
    const {id} = db_response
    res.send(JSON.stringify({id}))
    }
    catch(e){
       
        if(e.code=='P2002'){
            
            res.status(400).send('Unique Constraint Violation')
        }
        else{
            
           next(e)
        }
    }
    
})

app.post('/login', async(req, res, next)=>{
    
    
    try{
    const {email, password} = req.body
    const email_found = await prisma.user.findUnique({
        where:{email:email}
    })
    if(email_found.length === 0){
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

app.put('/short-url',authorization_middleware,async(req, res, next)=>{
    
    const {input_url } = req.body
    const {email} = req.email
    const user = await prisma.user.findUnique({where:{
        email
    }})
    const {id} = user
    
    const short_url = 'tiny/'+String(nanoid(4))
    const userId = id

    try{

    const storage_result = await prisma.links.create({
        data:{
            LongUrl:input_url , shortUrl:short_url,
            user :{connect:{id:userId}}
        }
    })
    
    res.send(short_url)
}
catch(e){
    next(e)
}

})
app.put('/redirection-url',async(req, res, next)=>{
    
    const {short_url} = req.body
    
    try{
    
    const result= await prisma.links.findMany({where:{
        shortUrl:short_url
    }})
    if(result.length === 0){
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

app.use((error, req, res, next)=>{
    console.log(error.stack)
    res.send(500).json({ message: error.message });
})

app.listen(3000, "0.0.0.0",()=>{
    console.log('App started Working')
})