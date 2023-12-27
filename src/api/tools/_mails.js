
const nodemailer = require("nodemailer");
const config = require("../../../config");

const mailer = {
    conectar: () => {
        return nodemailer.createTransport({
            host: config[config.NODE_ENV].mail.host,
            port: config[config.NODE_ENV].mail.port,
            secure: config[config.NODE_ENV].mail.secure,
            auth:{
                user: config[config.NODE_ENV].mail.user,
                pass: config[config.NODE_ENV].mail.password
            }
        });
    },
    
    sendMail: async (lenguaje, toMail, titulo, htmlText) => {
        return await mailer.conectar().sendMail({
            from: '"Mundo Total" <'+config[config.NODE_ENV].mail.from+'>',
            to: toMail,
            subject: titulo,
            //text: htmlText,
            html: mailer.maqueta(lenguaje, htmlText)
        });
    },
    
    maqueta: (lenguaje, text) => {
        let finalText = {
            'es': `<h4>Mundo Total</h4><br/>
                    <p>${text}</p><br/>
                    <center>
                        <small>Recuerda cuidar tus datos personales nosotros nunca solicitaremos contraseñas o algún factor de caracter de seguridad.</small>
                        <br/>
                        <h7>Mundo Total @ Todos los derechos reservados.</h7>
                    </center>`,
            /*'en': `<h4>Mundo Total</h4><br/>
                    <p>${text}</p><br/>
                    <center>
                        <small>Remember to take care of your personal data, we will never request passwords or any security factor.</small>
                        <br/>
                        <h7>Mundo Total @ All rights reserved.</h7>
                    </center>`*/
        }
        
        return finalText[lenguaje];
    }
};

module.exports = mailer;