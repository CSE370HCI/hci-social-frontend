import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class UserPreference extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'up_id'})
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'up_user_id' })
  user: User;

  @Column({ name: 'up_name' })
  name: string;

  @Column({ name: 'up_value' })
  value: string;

}
