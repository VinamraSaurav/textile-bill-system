export interface Phone {
    office: string[];
    mobile: string[];
  }
  
  export interface Address {
    street: string;
    city: string;
    state: string;
    pincode: string;
  }
  
  export interface PartyOrSupplier {
    name: string;
    gstin: string;
    address: Address;
    phone: Phone;
  }
  
  export interface BillItem {
    name: string;
    hsn: string;
    quantity: number;
    rate: number;
    amount: number;
  }
  
  export interface BillData {
    bill_number: string;
    bill_date: string; // Format: "YYYY-MM-DD"
    location: string;
    total_billed_amount: number;
    supplier: PartyOrSupplier;
    party: PartyOrSupplier;
    items: BillItem[];
  }
  