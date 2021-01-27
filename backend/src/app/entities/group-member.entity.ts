import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

import { User } from './user.entity';

@Entity()
export class GroupMember extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'gm_id' })
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'gm_user_id' })
  user: User;

  @ManyToOne(() => Group, { nullable: false })
  @JoinColumn({ name: 'gm_group_id' })
  group: Group;

  @Column({ name: 'gm_type' })
  type: string;

}
