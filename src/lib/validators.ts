// src/lib/validators.ts
import { z } from "zod";

// Base schemas
export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  post: z.string().optional(),
  district: z.string().optional(),
  state: z.string(),
  pincode: z.string().min(6),
  st_code: z.string().optional(),
});

export const PhoneSchema = z.object({
  office: z.array(z.string()),
  mobile: z.array(z.string()),
});

// Bill item schema
export const BillItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  hsn: z.string(),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
  amount: z.number().positive(),
});

// Bill schema for validation
export const BillSchema = z.object({
  bill_number: z.string().min(1, "Bill number is required"),
  bill_date: z.coerce.date(),
  location: z.string().min(1, "Location is required"),
  total_billed_amount: z.number().positive(),
  payment_status: z.enum(["paid", "unpaid"]),
  
  // For existing supplier
  supplierId: z.string().uuid().optional(),
  
  // For existing party
  partyId: z.string().uuid().optional(),
  
  // For new supplier
  newSupplier: z.object({
    name: z.string().min(1, "Supplier name is required"),
    gstin: z.string().min(15).max(15),
    address: AddressSchema,
    phone: PhoneSchema,
  }).optional(),
  
  // For new party
  newParty: z.object({
    name: z.string().min(1, "Party name is required"),
    gstin: z.string().min(15).max(15),
    address: AddressSchema,
    phone: PhoneSchema,
  }).optional(),
  
  items: z.array(BillItemSchema).min(0, "At least one item is required"),
});

// Custom validation function
export function validateBillData(data: any) {
  const result = BillSchema.safeParse(data);
  
  if (!result.success) {
    return { 
      success: false, 
      errors: result.error.format() 
    };
  }
  
  const billData = result.data;
  
  // Custom validation: either supplierId or newSupplier must be provided
  if (!billData.supplierId && !billData.newSupplier) {
    return {
      success: false,
      errors: {
        supplier: "Either select an existing supplier or add a new one"
      }
    };
  }
  
  // Custom validation: either partyId or newParty must be provided
  if (!billData.partyId && !billData.newParty) {
    return {
      success: false,
      errors: {
        party: "Either select an existing party or add a new one"
      }
    };
  }
  
  return { success: true, data: billData };
}

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
}); 

