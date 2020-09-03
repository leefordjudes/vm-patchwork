import { Document } from 'mongoose';

export interface User extends Document {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  role: string;
  allowRemoteAccess: boolean;
  displayName: string;
  email: string;
  mobile: string;
  address: string;
  active: boolean;
  settings: {
    appearance: {
      theme: string;
    },
  };
  createdAt: Date;
  updatedAt: Date;
}
