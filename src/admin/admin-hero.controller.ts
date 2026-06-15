import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '../common/constants/role.constant';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateHeroDto } from '../settings/dto/update-hero.dto';
import { HeroService } from '../settings/hero.service';

@Controller('admin/hero')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminHeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  async getHeroSettings() {
    const hero = await this.heroService.getHeroSettings();
    return this.heroService.toPublicHero(hero);
  }

  @Put()
  updateHeroSettings(@Body() dto: UpdateHeroDto) {
    return this.heroService.updateHeroSettings(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadHeroMedia(@UploadedFile() file: Express.Multer.File) {
    return this.heroService.uploadHeroMedia(file);
  }
}
