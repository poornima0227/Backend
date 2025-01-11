require('dotenv').config();
const nodemailer = require ('nodemailer');
const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

const sendMail = async(email, mailSubject, content)=>{

    try{

        const transport = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.SMTP_MAIL, // Your Gmail address
                pass:process.env.SMTP_PASSWORD, // Your App Password
            }
        });

        const mailOptions = {
            from:process.env.SMTP_MAIL,
            to:email,
            subject:mailSubject,
            html:content

        }

        transport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            else{
                console.log('Mail sent successfully:-',info.response);
            }

        });

    }
    catch(error){
        console.log(error.message);
    }

}


module.exports = sendMail;