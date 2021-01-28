import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Group extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'group_id' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'group_owner_id' })
  owner: User;

  @Column({ name: 'group_name' })
  name: string;

  @Column({ name: 'group_type', nullable: true })
  type: string;
}
