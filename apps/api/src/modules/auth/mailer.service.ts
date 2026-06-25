import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = config.get<number>('SMTP_PORT', 2525);
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASSWORD');

    const isConfigured =
      host && user && pass && !user.startsWith('your-') && !pass.startsWith('your-');

    if (isConfigured) {
      this.transporter = nodemailer.createTransport({ host, port, auth: { user, pass } });
      this.logger.log(`SMTP configured: ${host}:${port}`);
    } else {
      this.logger.warn('SMTP not configured — welcome emails disabled');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    if (!this.transporter) return;

    const from = this.config.get<string>('EMAIL_FROM', 'noma@example.com');
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://noma-ashy.vercel.app');

    try {
      await this.transporter.sendMail({
        from: `"NOMA" <${from}>`,
        to: email,
        subject: `Bem-vindo(a) ao NOMA, ${name}!`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h1 style="color:#ea580c;margin-bottom:8px;">Olá, ${name}!</h1>
            <p style="color:#374151;font-size:16px;line-height:1.6;">
              Seu cadastro no <strong>NOMA</strong> foi realizado com sucesso.
            </p>
            <p style="color:#374151;font-size:16px;line-height:1.6;">
              Agora você pode organizar seus projetos, colaborar com sua equipe
              e aumentar sua produtividade.
            </p>
            <a href="${frontendUrl}/dashboard"
               style="display:inline-block;background-color:#ea580c;color:#fff;
                      padding:12px 28px;border-radius:8px;text-decoration:none;
                      font-weight:600;margin-top:16px;">
              Acessar o NOMA
            </a>
            <p style="margin-top:32px;color:#9ca3af;font-size:13px;">
              Se você não criou esta conta, ignore este e-mail.
            </p>
          </div>`,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send welcome email to ${email}: ${err?.message}`);
    }
  }
}
