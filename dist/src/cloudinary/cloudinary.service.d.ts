import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private readonly configService;
    private readonly heroFolder;
    private readonly productsFolder;
    constructor(configService: ConfigService);
    private uploadFile;
    uploadHeroMedia(file: Express.Multer.File): Promise<UploadApiResponse>;
    uploadProductImage(file: Express.Multer.File): Promise<UploadApiResponse>;
    uploadCategoryImage(file: Express.Multer.File): Promise<UploadApiResponse>;
}
