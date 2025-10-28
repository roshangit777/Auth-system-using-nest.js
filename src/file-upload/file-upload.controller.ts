import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

interface AuthorData {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadfileDto: string | undefined,
    @CurrentUser() user: AuthorData,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('File needed');
    }
    return this.fileUploadService.uploadFile(file, uploadfileDto, user);
  }

  @Get('get-files')
  async getFile(): Promise<any[]> {
    return await this.fileUploadService.findAll();
  }

  @UseGuards(AuthGuard)
  @Delete('delete-files')
  async deleteFile(
    @Query('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    if (!id) {
      throw new BadRequestException('Id needed to delete the File');
    }
    return await this.fileUploadService.remove(id);
  }
}
