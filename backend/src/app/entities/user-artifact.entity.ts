import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class UserArtifact extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  category: string;

}
