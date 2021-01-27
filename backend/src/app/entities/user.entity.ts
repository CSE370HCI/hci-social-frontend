import { hashPassword } from '@foal/core';
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'user_email', unique: true })
  email: string;

  @Column({ name: 'user_password', select: false })
  password: string;

  @Column({ name: 'user_username' })
  username: string;

  @Column({ name: 'user_first_name'} )
  firstName: string;

  @Column({ name: 'user_last_name' })
  lastName: string;

  @Column({ name: 'user_status' })
  status: string;

  @Column({ name: 'user_role' })
  role: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password !== undefined) this.password = await hashPassword(this.password);
  }

}

export { DatabaseSession } from '@foal/typeorm';
