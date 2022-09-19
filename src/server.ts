import express from 'express'
import cron from 'node-cron'
import SendEmails from './EmailService/EmailService'
import SendEmail from './EmailService/EmailServices'
import Sendadmin from './EmailService/Emaildispatch'

const app= express()




const run =()=>{
cron.schedule('*/30 * * * * *', async() => {
  await SendEmails()
  await SendEmail()
  await Sendadmin()
})
}
run()


app.listen(7000, ()=>{
    console.log('App is Running');
    
})