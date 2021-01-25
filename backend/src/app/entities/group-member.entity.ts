import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

import { User } from './user.entity';

@Entity()
export class GroupMember extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @ManyToOne(() => Group, { nullable: false })
  group: Group;

  @Column({ nullable: true })
  type: string;

}
