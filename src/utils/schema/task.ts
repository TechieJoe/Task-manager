import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  priority: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Automatically delete tasks after 24 hours
TaskSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
);