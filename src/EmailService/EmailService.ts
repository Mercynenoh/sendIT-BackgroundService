import ejs from 'ejs'
import mssql from 'mssql'
import dotenv from 'dotenv'
import {sqlConfig} from '../Config/config'
dotenv.config()
import sendMail from '../Helpers/Email'
import Connection from "../Helper/dbhelper";
const db = new Connection();
interface User{
    id:number
    Firstname:string
    Lastname:string
    Senderemail:string
    Password:string
    role:string
    issent:number
}


const SendEmails= async()=>{
const pool = await mssql.connect(sqlConfig)
const users:User[]= await(await pool.request().query(`
SELECT * FROM Users WHERE issent='0'`)).recordset
 for(let user of users){

    ejs.renderFile('template/welcome.ejs',{email:user.Firstname} ,async(error,data)=>{

        let messageoption={
            from:process.env.EMAIL,
            to:user.Senderemail,
            subject:"Thank you for choosing us",
            html:data,
            attachments:[
                {
                    filename:'user.txt',
                }
            ]
        }

        try {
            
            await sendMail(messageoption)
            await pool.request().query(`UPDATE Users SET issent='1' WHERE id = '${user.id}'`)
            console.log('Sent');
            
        } catch (error) {
            console.log(error);
            
        }


    })
console.log(user)
 }


}


export default  SendEmails


