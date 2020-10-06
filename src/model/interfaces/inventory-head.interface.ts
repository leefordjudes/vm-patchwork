import { Document } from 'mongoose';

export interface InventoryHead extends Document {
  id: string;
  name: string;
}
