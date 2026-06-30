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

  get isConfigured() {
    return Boolean(this.transporter);
  }

  private formatMoney(amount: number) {
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  }

  async sendNewOrderNotification(order: {
    id: string;
    items: Array<{ name: string; quantity: number; price?: number }>;
    subtotal: number;
    deliveryTotal: number;
    total: number;
    paymentMethod: string;
    customer: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      notes?: string;
    };
    createdAt: string;
  }) {
    const to =
      this.configService.get<string>('ORDER_NOTIFICATION_EMAIL')?.trim() ||
      'zanvarasand@gmail.com';

    const itemLines = order.items
      .map((item) => {
        const lineTotal =
          typeof item.price === 'number'
            ? this.formatMoney(item.price * item.quantity)
            : '—';
        return `${item.name} × ${item.quantity} — ${lineTotal}`;
      })
      .join('\n');

    const subject = `New Zanvara order ${order.id}`;
    const text = [
      `New order received: ${order.id}`,
      '',
      'Customer',
      `Name: ${order.customer.fullName}`,
      `Email: ${order.customer.email}`,
      `Phone: ${order.customer.phone}`,
      `Address: ${order.customer.address}, ${order.customer.city}`,
      order.customer.notes ? `Notes: ${order.customer.notes}` : null,
      '',
      'Items',
      itemLines,
      '',
      `Subtotal: ${this.formatMoney(order.subtotal)}`,
      `Delivery: ${this.formatMoney(order.deliveryTotal)}`,
      `Total: ${this.formatMoney(order.total)}`,
      `Payment: ${order.paymentMethod}`,
      `Placed at: ${order.createdAt}`,
    ]
      .filter(Boolean)
      .join('\n');

    const itemsHtml = order.items
      .map((item) => {
        const lineTotal =
          typeof item.price === 'number'
            ? this.formatMoney(item.price * item.quantity)
            : '—';
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${lineTotal}</td>
        </tr>`;
      })
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px">
        <h2 style="margin:0 0 12px">New order — ${order.id}</h2>
        <p style="margin:0 0 16px;color:#666">A customer just placed an order on Zanvara.</p>
        <h3 style="margin:24px 0 8px;font-size:16px">Customer</h3>
        <p style="margin:0"><strong>Name:</strong> ${order.customer.fullName}</p>
        <p style="margin:0"><strong>Email:</strong> ${order.customer.email}</p>
        <p style="margin:0"><strong>Phone:</strong> ${order.customer.phone}</p>
        <p style="margin:0"><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
        ${
          order.customer.notes
            ? `<p style="margin:0"><strong>Notes:</strong> ${order.customer.notes}</p>`
            : ''
        }
        <h3 style="margin:24px 0 8px;font-size:16px">Items</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #eee">Product</th>
              <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #eee">Qty</th>
              <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #eee">Line total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin:16px 0 0"><strong>Subtotal:</strong> ${this.formatMoney(order.subtotal)}</p>
        <p style="margin:0"><strong>Delivery:</strong> ${this.formatMoney(order.deliveryTotal)}</p>
        <p style="margin:0"><strong>Total:</strong> ${this.formatMoney(order.total)}</p>
        <p style="margin:0"><strong>Payment:</strong> ${order.paymentMethod}</p>
        <p style="margin:16px 0 0;color:#666">Placed at: ${order.createdAt}</p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.warn(
        `[DEV NEW ORDER] ${order.id} — notification would go to ${to}`,
      );
      this.logger.log(text);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`New order notification sent to ${to} for ${order.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send new order notification for ${order.id}`,
        error,
      );
    }
  }
}
