import { Document } from 'mongoose';

export interface PrintTemplate extends Document {
  id: string;
  name: string;
  code: string;
  category: string[];
  context: {
    pageSize: string;
  };
  config: string;
}
