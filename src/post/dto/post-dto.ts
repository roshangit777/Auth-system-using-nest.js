import { IsString, MaxLength, MinLength } from 'class-validator';

export class PostDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(5, { message: 'Title at least 5 char long' })
  @MaxLength(20, { message: 'Title must be max 20 char long' })
  title: string;
  /*   @IsEmpty({ message: 'content is required' }) */
  @IsString({ message: 'content must be a string' })
  @MinLength(5, { message: 'content at least 5 char long' })
  @MaxLength(20, { message: 'content must be max 20 char long' })
  content: string;
}
