import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';

const CONTACT = 'CONTACT';
const NEWSLETTER = 'NEWSLETTER';

@Injectable()
export class InboundService {
  constructor(private readonly prisma: PrismaService) {}

  private mapSubmission(submission: {
    id: string;
    type: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    message: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: submission.id,
      type: submission.type,
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      phone: submission.phone,
      message: submission.message,
      status: submission.status,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }

  async createContact(dto: CreateContactDto) {
    const submission = await this.prisma.inboundSubmission.create({
      data: {
        type: CONTACT,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        message: dto.message.trim(),
      },
    });

    return {
      message: 'Message sent successfully.',
      submission: this.mapSubmission(submission),
    };
  }

  async subscribeNewsletter(dto: CreateNewsletterDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.inboundSubmission.findFirst({
      where: {
        type: NEWSLETTER,
        email,
      },
    });

    if (existing) {
      return {
        message: 'You are already subscribed.',
        alreadySubscribed: true,
        submission: this.mapSubmission(existing),
      };
    }

    const submission = await this.prisma.inboundSubmission.create({
      data: {
        type: NEWSLETTER,
        email,
      },
    });

    return {
      message: 'Subscribed successfully.',
      alreadySubscribed: false,
      submission: this.mapSubmission(submission),
    };
  }

  async findAllAdmin(type?: string) {
    const submissions = await this.prisma.inboundSubmission.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((submission) => this.mapSubmission(submission));
  }

  async updateStatus(id: string, status: 'NEW' | 'READ') {
    const submission = await this.prisma.inboundSubmission.update({
      where: { id },
      data: { status },
    });

    return this.mapSubmission(submission);
  }
}
