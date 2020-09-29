import { Document } from 'mongoose';

export interface Role extends Document {
  id: string;
  validateName: string;
  name: string;
  isDefault: boolean;
  description: string;
  displayName: string;
  privileges: any;
  dateRestrictions: [
    {
      code: string;
      category: string;
      value: boolean;
    },
  ];
}
