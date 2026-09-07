export type CustomerStatus = "Active" | "Inactive";

export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: CustomerStatus;
  createdAt: string;
};

export type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: CustomerStatus;
};