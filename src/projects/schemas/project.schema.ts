import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/Schema/user.schema';
import { CodeBase } from './code-base.schema';

@Schema({ timestamps: true, versionKey: false })
export class Project extends Document {
  @Prop({
    ref: User.name,
    type: Types.ObjectId,
    required: true,
  })
  userId!: User;

  @Prop()
  name!: string;

  @Prop({
    type: Types.ObjectId,
    ref: CodeBase.name,
    default: null,
  })
  codebase?: Types.ObjectId | CodeBase | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
