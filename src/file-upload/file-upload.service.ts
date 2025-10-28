import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entity/cloudinary.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary/cloudinary-service';

interface AuthorData {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    description: string | undefined,
    user: AuthorData,
  ): Promise<File> {
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);

    const newlyCreatedFile = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      publicId: cloudinaryResponse?.public_id,
      url: cloudinaryResponse.secure_url,
      description,
      uploader: { id: user?.sub },
    });
    return await this.fileRepository.save(newlyCreatedFile);
  }

  async findAll(): Promise<File[]> {
    return await this.fileRepository.find({
      relations: ['uploader'],
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const fileToBeDeleted = await this.fileRepository.findOne({
      where: { id: id },
    });
    if (!fileToBeDeleted) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    //first delete from cloudinary
    await this.cloudinaryService.deleteFile(fileToBeDeleted.publicId);
    //then delete from the db
    await this.fileRepository.remove(fileToBeDeleted);

    return { message: 'File delted successfully' };
  }
}
