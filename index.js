import express from 'express';
import cors from 'cors'
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
    console.log(req.body)
    const {name , email } = req.body
    const db_response =await prisma.user.create({
        data:{name, email}
    })
    console.log(db_response)
    res.send('New User is Registered')
    
})

app.put('/link-storing',(req, res)=>{
    res.send('This is the Short url')
})

app.listen(3000, ()=>{
    console.log('App started Working')
})