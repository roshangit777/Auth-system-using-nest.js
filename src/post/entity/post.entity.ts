import { Users } from 'src/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;

  //remember and lear
  @ManyToOne(() => Users, (user) => user.posts)
  author: Users;

  @Column()
  content: string;
  @Column()
  createdAt: string;
}
