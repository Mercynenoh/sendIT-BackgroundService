import ejs from 'ejs'
import mssql from 'mssql'
import dotenv from 'dotenv'
import {sqlConfig} from '../Config/config'
dotenv.config()
import sendMail from '../Helpers/Email'
import Connection from "../Helper/dbhelper";
const db = new Connection();


interface Parcel{
    Adress:string
    TrackingNo:number
    parcelname:string
    TruckNo:string
    weight:number
    status:string
    Date:string
    Senderemail:string
    RecepientEmail:string,
    id:number
    lat:any
    lng:any
    Price:number
}
const SendEmail= async()=>{
    // const pool = await mssql.connect(sqlConfig)
    // const parcels:Parcel[]= await(await pool.request().query(`
    // SELECT * FROM Parcels WHERE status='Delivered'`)).recordset
    const pool = await mssql.connect(sqlConfig)
     const parcels:Parcel[]= await (await db.exec("Delivered")).recordset
     for(let parcel of parcels){
        ejs.renderFile('template/parcel.ejs',{email:parcel.RecepientEmail,parcel:`${parcel.parcelname} and parcel name is ${parcel.parcelname}`} ,async(error,data)=>{
    
            let messageoption={
                from:process.env.EMAIL,
                to:parcel.RecepientEmail,
                subject:"Parcel Delivery",
                html:data,
                attachments:[
                    {
                        filename:'parcel.txt',
                        content:`Your Parcel : '${parcel.parcelname}' has arrived from, '${parcel.Adress}'`
                    }
                ]
            }
    
            try {
                
                await sendMail(messageoption)
                await db.exec("updatedelivered", { id: parcel.id });
            } catch (error) {
                console.log(error);
                
            }
    
    
        })
        ejs.renderFile('template/sender.ejs',{email:parcel.Senderemail,parcel:`${parcel.parcelname} and parcel name is ${parcel.parcelname}`} ,async(error,data)=>{
    
            let messageoption={
                from:process.env.EMAIL,
                to:parcel.Senderemail,
                subject:"Parcel Delivery",
                html:data,
                attachments:[
                    {
                        filename:'parcel.txt',
                        content:`Your Parcel : '${parcel.parcelname}' has arrived from, '${parcel.Adress}'`
                    }
                ]
            }
    
            try {
                
                await sendMail(messageoption)
                // await pool.request().query(`UPDATE Parcels SET 
                // status='Arrived' WHERE id='${parcel.id}'`)
                await sendMail(messageoption)
                await db.exec("arrived", { id:parcel.id });
                console.log('Sent');
            } catch (error) {
                console.log(error);
                
            }
    
    
        })
    console.log(parcel)
     }
    
    
    }
    
    export default  SendEmail