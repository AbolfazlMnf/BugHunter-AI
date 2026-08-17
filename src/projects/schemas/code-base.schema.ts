import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class CodeBase extends Document {
  @Prop({ default: null, required: false })
  originalFileName?: string;
}

export const CodeBaseSchema = SchemaFactory.createForClass(CodeBase);
