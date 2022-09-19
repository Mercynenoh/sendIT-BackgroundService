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
    const pool = await mssql.connect(sqlConfig)
    const parcels:Parcel[]= await(await pool.request().query(`
    SELECT * FROM Parcels WHERE issent=0`)).recordset
    // const pool = await mssql.connect(sqlConfig)
    //  const parcels:Parcel[]= await (await db.exec("parceldispatched")).recordset
     for(let parcel of parcels){
        ejs.renderFile('template/dispatchreceiver.ejs',{email:parcel.RecepientEmail,parcel:`${parcel.parcelname} and parcel name is ${parcel.parcelname}`} ,async(error,data)=>{
    
            let messageoption={
                from:process.env.EMAIL,
                to:parcel.RecepientEmail,
                subject:"Parcel Dispatched!!",
                html:data,
                attachments:[
                    {
                        filename:'parcel.txt',
                        content:`Your Parcel : '${parcel.parcelname}' has been dispatched  from, '${parcel.Adress}'`
                    }
                ]
            }
    
            try {
                
                await sendMail(messageoption)
                await db.exec("updateSent", { id: parcel.id });
                // await pool.request().query(`UPDATE Parcels SET 
                // issent=1 WHERE id='${parcel.id}'`)
                
            } catch (error) {
                console.log(error);
                
            }
    
    
        })
        ejs.renderFile('template/dispatchreceiver.ejs',{email:parcel.Senderemail,parcel:`${parcel.parcelname} and parcel name is ${parcel.parcelname}`} ,async(error,data)=>{
    
            let messageoption={
                from:process.env.EMAIL,
                to:parcel.Senderemail,
                subject:"Parcel Dispatched!!",
                html:data,
                attachments:[
                    {
                        filename:'parcel.txt',
                        content:`Your Parcel : '${parcel.parcelname}' has been dispatched from, '${parcel.Adress}'`
                    }
                ]
            }
    
            try {
                await sendMail(messageoption)
                await db.exec("updateSent", { id: parcel.id });
                console.log('Sent');
            } catch (error) {
                console.log(error);
                
            }
    
    
        })
     }
    
    
    }
    
    export default  SendEmail