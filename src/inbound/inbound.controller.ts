import { Body, Controller, Post } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { InboundService } from './inbound.service';

@Controller()
export class InboundController {
  constructor(private readonly inboundService: InboundService) {}

  @Post('contact')
  createContact(@Body() dto: CreateContactDto) {
    return this.inboundService.createContact(dto);
  }

  @Post('newsletter/subscribe')
  subscribeNewsletter(@Body() dto: CreateNewsletterDto) {
    return this.inboundService.subscribeNewsletter(dto);
  }
}
