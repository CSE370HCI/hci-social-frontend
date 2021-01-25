import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Group extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;
}
