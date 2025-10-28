import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/post-dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { FindPostsQueryDto } from './dto/find-posts-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { Posts } from './post.interfaces';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getAllPost(
    @Query() query: FindPostsQueryDto,
  ): Promise<PaginatedResponse<Posts>> {
    return this.postService.findAll(query);
  }

  @Get(':id')
  getOnePost(@Param('id') id: number) {
    return this.postService.findOnePost(id);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  createOnePost(@Body() postData: PostDto, @CurrentUser() user: any) {
    if (!postData.title || !postData.content) {
      throw new NotFoundException();
    }
    return this.postService.createPost(postData, user);
  }

  @UseGuards(AuthGuard)
  @Put('update/:id')
  async updatePost(@Param('id') id: number, @Body() postData: PostDto) {
    if (!id) {
      throw new Error('Id should be valid');
    }
    if (!postData.title || !postData.content) {
      throw new Error('Content should be valid');
    }
    return await this.postService.updatePost(id, postData);
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  async deletePost(@Query('id') id: number) {
    if (!id) {
      throw new Error('Id must be included');
    }
    return await this.postService.deletePost(id);
  }
}
