import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FindPostsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(100, { message: 'Title search can not exceed 100 charecters' })
  title?: string;
}
