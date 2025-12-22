import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from 'src/types/status.enum';

@Entity('docs')
export class Doc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  original_file_name: string;

  @Column()
  modified_file_name: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
