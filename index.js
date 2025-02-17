import express from 'express';
import cors from 'cors'
import bcrypt from 'bcrypt'
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
    console.log(req.body)
    const hashed_password  = await bcrypt.hash(password , 10)
    console.log(hashed_password)
    try{
    const db_response =await prisma.user.create({
        data:{name, email, password:hashed_password}
    })
    console.log(db_response)
    const {id} = db_response
    res.send(JSON.stringify({id}))
    }
    catch(e){
        console.log(e.message, 'the Error')
        res.status(400).send( e.message)
    }
    
})

app.put('/short-url',async(req, res)=>{
    console.log(req.body)
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
    console.log(short_url)
    const result= await prisma.links.findMany({where:{
        shortUrl:short_url
    }})
    res.send(result[0].LongUrl)
})

app.listen(3000, ()=>{
    console.log('App started Working')
})