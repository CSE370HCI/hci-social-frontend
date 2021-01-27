import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Post extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column()
  type: string;

  @Column()
  content: string;

  @Column()
  thumbnailURL: string;

  @ManyToOne(() => Post, post => post.children)
  parent: Post;

  @OneToMany(() => Post, post => post.parent)
  children: Post[];

  @Column()
  commentCount: number;

}
