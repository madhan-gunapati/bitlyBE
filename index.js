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
    
    const {name , email } = req.body
    const db_response =await prisma.user.create({
        data:{name, email}
    })
    
    res.send('New User is Registered')
    
})

app.put('/short-url',async(req, res)=>{
    console.log(req.body)
    const {input_url , email} = req.body
    const user = await prisma.user.findUnique({where:{
        email
    }})
    const {id} = user
    console.log(user, id)
    const short_url = 'tiny/'+String(nanoid(4))
    const userId = id

    

    const storage_result = await prisma.links.create({
        data:{
            LongUrl:input_url , shortUrl:short_url,
            user :{connect:{id:userId}}
        }
    })
    console.log(storage_result)
    res.send(short_url)

})

app.listen(3000, ()=>{
    console.log('App started Working')
})