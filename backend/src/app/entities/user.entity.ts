import { hashPassword } from '@foal/core';
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  status: string;

  @Column()
  role: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await hashPassword(this.password);
  }

}

export { DatabaseSession } from '@foal/typeorm';
