import { IsDate } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Submission } from './submission.entity';

/* The Prize class represents a prize in a TypeScript application, with various properties such as
description, start dates, addresses, and arrays of admins, proficiencies, and priorities. */
@Entity()
export class Prize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  description: string;

  @Column('boolean')
  isAutomatic: boolean;

  @IsDate()
  @Column({ nullable: true })
  startVotingDate: Date;

  @IsDate()
  @Column({ nullable: true })
  startSubmissionDate: Date;

  @Column()
  proposer_address: string;

  @Column()
  contract_address: string;

  @Column('simple-array')
  admins: string[];

  @Column('simple-array')
  proficiencies: string[];

  @Column('simple-array')
  priorities: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Submission, (submission) => submission.prize)
  submissions: Submission[];

  /* On Chain Data */
  // total_funds: number;
  // total_rewards: number;
  // platform_reward: number;
  // distributed: boolean;
}
