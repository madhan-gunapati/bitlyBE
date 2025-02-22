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



const putDatainDB = async()=>{
    
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
    
}

putDatainDB();

// console.log(nanoid(5))

app.get('/', (req, res)=>{
    res.send('App is working Fine')
})

app.put('/user-registration',async (req, res)=>{
    
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
            
            res.send('Bad Request')
        }
    }
    
})

app.post('/login', async(req, res)=>{
    //check if username is present, if yes, compare the hashed password. 
    //if ok create a jwt token and send it back
    //else 
    
    const {username, password} = req.body
    const username_found = await prisma.user.findMany({
        where:{name:username}
    })
    if(username_found.length === 0){
        res.send('User Not Found')
    }
    else{
        const hashed_password = username_found[0].password
        
        
        const result  = await bcrypt.compare(password, hashed_password)
        
        if(result){
            const payload = {username}
            const token = jwt.sign(payload, 'my-secret-token')
            res.send(token)
        }
        else{
            res.send('Incorrect Password')
        }
        
    }
    
   
})

app.put('/short-url',async(req, res)=>{
    
    const {input_url , email} = req.body
    const user = await prisma.user.findUnique({where:{
        email
    }})
    const {id} = user
    
    const short_url = 'tiny/'+String(nanoid(4))
    const userId = id

    

    const storage_result = await prisma.links.create({
        data:{
            LongUrl:input_url , shortUrl:short_url,
            user :{connect:{id:userId}}
        }
    })
    
    res.send(short_url)

})
app.put('/redirection-url',async(req, res)=>{
    
    const {short_url} = req.body
    
    const result= await prisma.links.findMany({where:{
        shortUrl:short_url
    }})
    res.send(result[0].LongUrl)
})

app.listen(3000, ()=>{
    console.log('App started Working')
})