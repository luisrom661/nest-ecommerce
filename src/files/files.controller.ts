import { Response } from 'express';
import { createReadStream } from 'fs';
import { BadRequestException, Controller, Get, Header, Param, Post, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helper';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  @Header('Content-Type', 'image/png')
  @Header('Content-Type', 'image/jpg')
  findProductImage(@Param('imageName') imageName: string) {
    const file = createReadStream(this.filesService.getStaticProductImage(imageName));
    return new StreamableFile(file);
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: {fileSize: 1000}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    }),
  }) )
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ){
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image.')
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return {
      secureUrl
    };
  }
}

// @UploadedFile(
//   new ParseFilePipeBuilder()
//     .addFileTypeValidator({
//       fileType: /(jpg|jpeg|png)$/,
//     })
//     .build({
//       errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
//     })
// )