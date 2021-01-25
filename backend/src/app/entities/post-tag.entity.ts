import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

import { User } from './user.entity';

@Entity()
export class PostTag extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @ManyToOne(() => Post, { nullable: false })
  post: Post;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

}
