import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Post extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'post_id' })
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'post_author_id' })
  author: User;

  @CreateDateColumn({ name: 'post_created'})
  createdAt: Date;

  @CreateDateColumn({ name: 'post_updated' })
  updatedAt: Date;

  @Column({ name: 'post_type' })
  type: string;

  @Column({ name: 'post_content' })
  content: string;

  @Column({ name: 'post_thumbnail'})
  thumbnailURL: string;

  @ManyToOne(() => Post, post => post.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_parent_id' })
  parent: Post;

  @OneToMany(() => Post, post => post.parent)
  children: Post[];

  commentCount: number;

}
