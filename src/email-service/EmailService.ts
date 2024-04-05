import {createTransport, Transporter} from "nodemailer";
import {envVariables} from "../core/env-variables";
import handlebars from 'handlebars';
import path from "path";
import * as fs from "fs";
export class EmailService {
    transporter: Transporter;
    constructor() {
        this.transporter = createTransport({
            port: envVariables.email.port,
            secure: true,
            host: envVariables.email.host,
            auth: {
                user: envVariables.email.user,
                pass: envVariables.email.password
            },
            // tls: {
            //     ciphers:'SSLv3'
            // },
            debug: true
        });
    }

    async otp(to: string, code: string){
        const data =  await this.transporter.sendMail({
            to: to,
            from: envVariables.email.from,
            subject: "Verification",
            text: `Otp code: ${code}!`,
            html:this.template('otp', {code, logo: envVariables.baseUrl+ "uploads/logo/black-logo.png"})
        });
    }

    template(name: string, data: any){
        const template = fs.readFileSync( path.join(__dirname, 'templates/' + name + '.hbs'));
        return  handlebars.compile(template.toString() )( data);
    }
}