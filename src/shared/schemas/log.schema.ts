import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LogType {
  Error = `error`,
  POST = `POST`,
  PATCH = `PATCH`,
  DELETE = `DELETE`,
  PUT = `PUT`,
}

@Schema({ timestamps: true, versionKey: false })
export class Log extends Document {
  @Prop()
  content!: string;
  @Prop()
  url!: string;
  @Prop({
    type: String,
    enum: LogType,
    required: true,
  })
  type!: LogType;
}

export const LogSchema = SchemaFactory.createForClass(Log);
