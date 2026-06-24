import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress = 'noreply@zanvara.com';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') ?? user ?? this.fromAddress;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        requireTLS: port === 587,
      });
      this.logger.log(`SMTP ready (${host}:${port})`);
      return;
    }

    this.logger.warn(
      'SMTP is not configured. OTP codes will be logged to the server console.',
    );
  }

  get isConfigured() {
    return Boolean(this.transporter);
  }

  async sendOtpEmail(email: string, code: string) {
    const subject = 'Your Zanvara verification code';
    const text = `Your Zanvara verification code is ${code}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 12px">Verify your email</h2>
        <p>Use this code on Zanvara:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
        <p style="color:#666">This code expires in 10 minutes.</p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.log(`[DEV OTP] ${email}: ${code}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject,
        text,
        html,
      });
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error);
      throw new InternalServerErrorException(
        'Could not send verification email. Please try again in a moment.',
      );
    }
  }
}
