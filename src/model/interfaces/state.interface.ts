import { Document } from 'mongoose';

export interface State extends Document {
  id: string;
  name: string;
  code: number;
  defaultName: string;
  country: string;
}
