import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {

  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'userId',
});
UserSchema.set('toJSON', { virtuals: true });
