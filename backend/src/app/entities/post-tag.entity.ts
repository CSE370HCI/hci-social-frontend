import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

import { User } from './user.entity';

@Entity()
export class PostTag extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, { nullable: false })
  post: Post;

  @ManyToOne(() => User)
  user: User;

  @Column()
  name: string;

  @Column()
  type: string;

}
