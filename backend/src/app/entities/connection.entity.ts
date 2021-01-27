import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Connection extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'conn_id' })
  id: number;

  @ManyToOne(() => User, {nullable: false })
  @JoinColumn({ name: 'conn_user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'connected_user_id' })
  connectedUser: User;

  @Column({ name: 'conn_type' })
  type: string;

  @Column({ name: 'conn_status' })
  status: string;
}
