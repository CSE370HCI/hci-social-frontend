import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

import { User } from './user.entity';

@Entity()
export class Message extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @ManyToOne(() => User)
  recipientUser: User;

  @ManyToOne(() => Group)
  recipientGroup: Group;

  @Column()
  content: string;

}
