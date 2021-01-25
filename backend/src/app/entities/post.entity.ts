import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

import { User } from './user.entity';

@Entity()
@Tree("materialized-path")
export class Post extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  type: string;

  @Column()
  content: string;

  @Column()
  thumbnailURL: string;

  @TreeChildren()
  children: Post[];

  @TreeParent()
  parent: Post;

  @Column()
  commentCount: number;

}
