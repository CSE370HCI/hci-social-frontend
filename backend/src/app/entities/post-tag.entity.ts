import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

import { User } from './user.entity';

@Entity()
export class PostTag extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'pt_id' })
  id: number;

  @ManyToOne(() => Post, { nullable: false })
  @JoinColumn({ name: 'pt_post_id' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pt_user_id' })
  user: User;

  @Column({ name: 'pt_name' })
  name: string;

  @Column({ name: 'pt_type' })
  type: string;

}
