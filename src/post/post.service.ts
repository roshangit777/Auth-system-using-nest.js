import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from './post.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from './entity/post.entity';
import { Repository } from 'typeorm';

interface AuthorData {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Posts) private usePostsRepository: Repository<Posts>,
  ) {}

  async findAll() {
    const posts = await this.usePostsRepository.find({
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
    if (!posts) {
      throw new NotFoundException();
    }
    return posts;
  }

  async findOnePost(id: number) {
    const post = await this.usePostsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async createPost(postData: Omit<Post, 'id' | 'createdAt'>, name: AuthorData) {
    const post = this.usePostsRepository.create({
      title: postData.title,
      content: postData.content,
      createdAt: new Date().toLocaleDateString(),
      author: { id: name.sub },
    });
    return await this.usePostsRepository.save(post);
  }

  async updatePost(id: number, postData: Omit<Post, 'id' | 'createdAt'>) {
    if (postData.title && !postData.content) {
      const post = await this.usePostsRepository.findOne({ where: { id: id } });
      if (!post) {
        throw new NotFoundException("Post doesn't exist");
      }
      await this.usePostsRepository.update({ id }, { title: postData.title });
      return { message: 'Post has been updated' };
    } else if (!postData.title && postData.content) {
      const post = await this.usePostsRepository.findOne({ where: { id: id } });
      if (!post) {
        throw new NotFoundException("Post doesn't exist");
      }
      await this.usePostsRepository.update(
        { id },
        { content: postData.content },
      );
      return { message: 'Post has been updated' };
    } else if (postData.title && postData.content) {
      const post = await this.usePostsRepository.findOne({ where: { id: id } });
      if (!post) {
        throw new NotFoundException("Post doesn't exist");
      }
      await this.usePostsRepository.update(
        { id },
        { title: postData.title, content: postData.content },
      );
      return { message: 'Post has been updated' };
    }
  }

  async deletePost(id: number) {
    const post = await this.usePostsRepository.findOne({ where: { id: id } });
    if (!post) {
      throw new NotFoundException("Post doesn't exist");
    }
    await this.usePostsRepository.delete({ id });
    return { message: 'Post deleted successfully', post };
  }
}
