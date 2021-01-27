import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class UserArtifact extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'ua_id'})
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ua_owner_id' })
  owner: User;

  @Column({ name: 'ua_type' })
  type: string;

  @Column({ name: 'ua_url' })
  url: string;

  @Column({ name: 'ua_category' })
  category: string;

}
