const nodemailer = require('nodemailer');

class MailService{

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link){
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта на ' + process.env.API_URL,
            text: ' ',
            html: 
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href = "${link}">${link}</a>
                    </div>
                `
        })
    }

    async sendEnrollmentNotificationMail(to, studentName, courseTitle) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Новый студент записался на ваш курс: ${courseTitle}`,
            text: ' ',
            html:
                `
                    <div>
                        <h1>Уведомление о новом студенте</h1>
                        <p>Студент ${studentName} записался на ваш курс "${courseTitle}".</p>
                        <p>Поздравляем!</p>
                    </div>
                `
        })
    }
}

module.exports = new MailService();