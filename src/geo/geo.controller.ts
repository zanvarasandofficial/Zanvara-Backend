import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('checkout-hint')
  checkoutHint(@Req() req: Request) {
    return this.geoService.resolveCheckoutGeo(req);
  }
}
