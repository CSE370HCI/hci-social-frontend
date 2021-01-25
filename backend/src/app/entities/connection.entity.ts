import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Connection extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @ManyToOne(() => User, { nullable: false })
  connectedUser: User;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  status: string;
}
