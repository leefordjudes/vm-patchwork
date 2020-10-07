import { Document } from 'mongoose';

export interface Preference extends Document {
  code: string;
  branch: string;
  config: string;
}
