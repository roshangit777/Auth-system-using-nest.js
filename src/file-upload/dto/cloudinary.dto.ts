import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FileUploadDto {
  /*   @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    originalName: string;
    @Column()
    mimeType: string;
    @Column()
    size: string;
    @Column()
    url: string;
    @Column()
    publicId: string;
    @Column({ nullable: true })
    description: string;
    @ManyToOne(() => Users, { eager: true })
    uploader: Users;
    @CreateDateColumn()
    createdAt: Date; */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
