import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';

import { User } from './user.entity';

@Entity()
export class Message extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'msg_id' })
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'msg_author_id' })
  author: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'msg_recip_user_id' })
  recipientUser: User;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'msg_recip_group_id' })
  recipientGroup: Group;

  @Column({ name: 'msg_content' })
  content: string;

}
