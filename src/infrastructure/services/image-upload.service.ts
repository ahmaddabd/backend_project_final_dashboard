import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class ImageUploadService {
  storage() {
    return diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const fileExtName = extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        callback(null, `${fileName}${fileExtName}`);
      },
    });
  }
}