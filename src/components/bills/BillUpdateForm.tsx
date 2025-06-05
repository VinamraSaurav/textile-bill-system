"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, ChevronUp, Plus, Save, Trash } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

// Import your own resolver for zod
const zodResolver = (schema: z.ZodType<any, any>) => async (values: any) => {
  try {
    const validatedData = schema.parse(values);
    return { values: validatedData, errors: {} };
  } catch (error: any) {
    return {
      values: {},
      errors: error.errors?.reduce((acc: any, curr: any) => {
        const path = curr.path.join('.');
        acc[path] = {
          type: 'validation',
          message: curr.message,
        };
        return acc;
      }, {}),
    };
  }
};

// Define proper interfaces
interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  district?: string;
  st_code?: string;
}

interface Phone {
  office: string[];
  mobile: string[];
}

interface PartyOrSupplier {
  id: string;
  name: string;
  gstin: string;
  address: Address;
  phone: Phone;
}

interface Item {
  name: string;
  hsn?: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ParsedBillData {
  bill_number?: string;
  bill_date?: string;
  location?: string;
  payment_status?: string;
  total_billed_amount?: number;
  supplier?: {
    name?: string;
    gstin?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    phone?: {
      office?: string[];
      mobile?: string[];
    };
  };
  party?: {
    name?: string;
    gstin?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    phone?: {
      office?: string[];
      mobile?: string[];
    };
  };
  items?: Item[];
}

// Form schema
const billItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  hsn: z.string().min(1, "HSN code is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  rate: z.coerce.number().positive("Rate must be positive"),
  amount: z.coerce.number().positive("Amount must be positive"),
})

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits").max(6),
  st_code: z.string().optional(),
})

const phoneSchema = z.object({
  office: z.array(z.string()),
  mobile: z.array(z.string().min(10, "Mobile number must be 10 digits").max(10)),
})

const newSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  gstin: z.string().min(15, "GSTIN must be 15 characters").max(15),
  address: addressSchema,
  phone: phoneSchema,
})

const newPartySchema = z.object({
  name: z.string().min(1, "Party name is required"),
  gstin: z.string().min(15, "GSTIN must be 15 characters").max(15),
  address: addressSchema,
  phone: phoneSchema,
})

const formSchema = z.object({
  bill_number: z.string().min(1, "Bill number is required"),
  bill_date: z.date({
    required_error: "Bill date is required",
  }),
  location: z.string().min(1, "Location is required"),
  supplierId: z.string().min(1, "Supplier is required").optional(),
  partyId: z.string().min(1, "Party is required").optional(),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
  total_billed_amount: z.coerce.number().positive("Total amount must be positive"),
  payment_status: z.enum(["paid", "unpaid"]),
  newSupplier: newSupplierSchema.optional(),
  newParty: newPartySchema.optional(),
})

// Define type for form values based on the schema
type FormValues = z.infer<typeof formSchema>;

export default function BillFormPage() {
  const router = useRouter()
  const [isAddingSupplier, setIsAddingSupplier] = useState(false)
  const [isAddingParty, setIsAddingParty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<PartyOrSupplier[]>([])
  const [parties, setParties] = useState<PartyOrSupplier[]>([])
  const [dataIsValid, setDataIsValid] = useState(true)

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // Cast to any to avoid TS errors with the custom resolver
    defaultValues: {
      bill_number: "",
      bill_date: new Date(),
      location: "",
      supplierId: "",
      partyId: "",
      items: [
        {
          name: "",
          hsn: "",
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
      total_billed_amount: 0,
      payment_status: "unpaid" as const,
      newSupplier: {
        name: "",
        gstin: "",
        address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
        },
        phone: {
          office: [""],
          mobile: [""],
        },
      },
      newParty: {
        name: "",
        gstin: "",
        address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
        },
        phone: {
          office: [""],
          mobile: [""],
        },
      },
    },
  })

  const { control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  // Fetch suppliers and parties data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch suppliers
        const suppliersResponse = await fetch('/api/supplier');
        if (!suppliersResponse.ok) {
          throw new Error('Failed to fetch suppliers');
        }
        const suppliersData = await suppliersResponse.json() as { data: PartyOrSupplier[] };
        setSuppliers(suppliersData.data);
        
        // Fetch parties
        const partiesResponse = await fetch('/api/party');
        if (!partiesResponse.ok) {
          throw new Error('Failed to fetch parties');
        }
        const partiesData = await partiesResponse.json() as { data: PartyOrSupplier[] };
        setParties(partiesData.data);

        // Process bill data from localStorage
        processBillData();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load suppliers or parties data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processBillData = () => {
    const rawData = localStorage.getItem("updateBillData");
    if (!rawData) return;
  
    try {
      const parsedData = JSON.parse(rawData) as ParsedBillData;
  
      // Validate parsed data structure
      if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Invalid bill data format");
      }
  
      // Parse bill date
      let billDate = new Date();
      if (parsedData.bill_date) {
        try {
          billDate = new Date(parsedData.bill_date);
          if (isNaN(billDate.getTime())) {
            billDate = new Date();
          }
        } catch (e) {
          console.error("Error parsing date:", e);
          billDate = new Date();
        }
      }
  
      // Prepare base form data
      const formData: Partial<FormValues> = {
        ...form.getValues(),
        bill_number: parsedData.bill_number || "",
        bill_date: billDate,
        location: parsedData.location || "",
        payment_status: (parsedData.payment_status === "paid" ? "paid" : "unpaid") as "paid" | "unpaid",
        total_billed_amount: parsedData.total_billed_amount || 0,
      };
  
      // Handle supplier
      if (parsedData.supplier?.gstin) {
        const existingSupplier = suppliers.find(
          (s) => s.gstin === parsedData.supplier?.gstin
        );
  
        if (existingSupplier) {
          formData.supplierId = existingSupplier.id;
          setIsAddingSupplier(false);
        } else {
          setIsAddingSupplier(true);
          formData.supplierId = "new";
          formData.newSupplier = {
            name: parsedData.supplier.name || "",
            gstin: parsedData.supplier.gstin || "",
            address: {
              street: parsedData.supplier.address?.street || "",
              city: parsedData.supplier.address?.city || "",
              state: parsedData.supplier.address?.state || "",
              pincode: parsedData.supplier.address?.pincode || "",
            },
            phone: {
              office: parsedData.supplier.phone?.office || [""],
              mobile: parsedData.supplier.phone?.mobile || [""],
            },
          };
        }
      }
  
      // Handle party
      if (parsedData.party?.gstin) {
        const existingParty = parties.find(
          (p) => p.gstin === parsedData.party?.gstin
        );
  
        if (existingParty) {
          formData.partyId = existingParty.id;
          setIsAddingParty(false);
        } else {
          setIsAddingParty(true);
          formData.partyId = "new";
          formData.newParty = {
            name: parsedData.party.name || "",
            gstin: parsedData.party.gstin || "",
            address: {
              street: parsedData.party.address?.street || "",
              city: parsedData.party.address?.city || "",
              state: parsedData.party.address?.state || "",
              pincode: parsedData.party.address?.pincode || "",
            },
            phone: {
              office: parsedData.party.phone?.office || [""],
              mobile: parsedData.party.phone?.mobile || [""],
            },
          };
        }
      }
  
      // Handle items
      if (Array.isArray(parsedData.items) && parsedData.items.length > 0) {
        const validItems = parsedData.items
          .filter((item) =>
            item &&
            typeof item === "object" &&
            item.name &&
            typeof item.quantity !== "undefined" &&
            typeof item.rate !== "undefined"
          )
          .map((item) => ({
            name: item.name || "",
            hsn: item.hsn || "",
            quantity: Number(item.quantity) || 0,
            rate: Number(item.rate) || 0,
            amount:
              Number(item.amount) ||
              Number(item.quantity) * Number(item.rate) ||
              0,
          }));
  
        if (validItems.length > 0) {
          formData.items = validItems;
          formData.total_billed_amount = validItems.reduce(
            (sum, item) => sum + item.amount,
            0
          );
        }
      }
  
      // Final form reset
      form.reset(formData as FormValues);
    } catch (error) {
      console.error("Failed to process bill data:", error);
      setDataIsValid(false);
      toast.error("Bill data cannot be processed, please fill in the form manually");
    }
  };
  
  const addItem = () => {
    append({
      name: "",
      hsn: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    });
  };

  const calculateItemAmount = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`);
    const rate = form.getValues(`items.${index}.rate`);
    const amount = quantity * rate;

    form.setValue(`items.${index}.amount`, amount);

    // Recalculate total
    const items = form.getValues("items");
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    form.setValue("total_billed_amount", total);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Prepare data to submit
      const dataToSubmit = { ...values };
      
      // Process supplier data
      if (values.supplierId === "new" && values.newSupplier) {
        (dataToSubmit as any).newSupplier = values.newSupplier;
        delete dataToSubmit.supplierId;
        // delete dataToSubmit.newSupplier;
      } else {
        dataToSubmit.supplierId = values.supplierId;
        delete dataToSubmit.newSupplier;
      }
      
      // Process party data
      if (values.partyId === "new" && values.newParty) {
        (dataToSubmit as any).newParty = values.newParty;
        delete dataToSubmit.partyId;
        // delete dataToSubmit.newParty;
      } else {
        dataToSubmit.partyId = values.partyId;
        delete dataToSubmit.newParty;
      }

      console.log("Data to submit:", dataToSubmit);
      // Send data to API
      const response = await fetch('/api/bill/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Clear localStorage after successful submission
      localStorage.removeItem("billData");
      
      toast.success("Bill saved successfully");
      router.push("/bills");
    } catch (error) {
      console.error("Error saving bill:", error);
      toast.error("Failed to save bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
        <span className="ml-2">Loading bill data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bill Details</h1>
        <p className="text-muted-foreground">Verify and edit the bill information</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of the bill</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="bill_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bill_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Bill Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full pl-3 text-left font-normal">
                              {field.value instanceof Date && !isNaN(field.value.getTime()) 
                                ? format(field.value, "PPP") 
                                : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar 
                            mode="single" 
                            selected={field.value instanceof Date && !isNaN(field.value.getTime()) 
                              ? field.value 
                              : new Date()} 
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                              }
                            }}
                            captionLayout="dropdown-years"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <div className="space-y-2">
                        <Select
                          onValueChange={(value) => {
                            if (value === "new") {
                              setIsAddingSupplier(true);
                              field.onChange("new");
                            } else {
                              setIsAddingSupplier(false);
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name} ({supplier.gstin})
                              </SelectItem>
                            ))}
                            <SelectItem value="new">+ Add New Supplier</SelectItem>
                          </SelectContent>
                        </Select>

                        <Collapsible open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
                          <CollapsibleContent className="space-y-4 rounded-md border p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">New Supplier</h4>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsAddingSupplier(false)}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name="newSupplier.name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="newSupplier.gstin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GSTIN</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Address</h5>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name="newSupplier.address.street"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Street</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="newSupplier.address.city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="newSupplier.address.state"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>State</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="newSupplier.address.pincode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Pincode</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Contact</h5>
                              <FormField
                                control={form.control}
                                name="newSupplier.phone.mobile.0"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Mobile</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party</FormLabel>
                      <div className="space-y-2">
                        <Select
                          onValueChange={(value) => {
                            if (value === "new") {
                              setIsAddingParty(true);
                              field.onChange("new");
                            } else {
                              setIsAddingParty(false);
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a party" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parties.map((party) => (
                              <SelectItem key={party.id} value={party.id}>
                                {party.name} ({party.gstin})
                              </SelectItem>
                            ))}
                            <SelectItem value="new">+ Add New Party</SelectItem>
                          </SelectContent>
                        </Select>

                        <Collapsible open={isAddingParty} onOpenChange={setIsAddingParty}>
                          <CollapsibleContent className="space-y-4 rounded-md border p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">New Party</h4>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsAddingParty(false)}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name="newParty.name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="newParty.gstin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GSTIN</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Address</h5>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name="newParty.address.street"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Street</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="newParty.address.city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="newParty.address.state"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>State</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="newParty.address.pincode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Pincode</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h5 className="text-sm font-medium">Contact</h5>
                              <FormField
                                control={form.control}
                                name="newParty.phone.mobile.0"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Mobile</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

        
          <Card>
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
              <CardDescription>Add the items included in this bill</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Item {index + 1}</h4>
                    {index > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.hsn`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HSN Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value) || 0);
                                calculateItemAmount(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.rate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                calculateItemAmount(index)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter the payment information for this bill</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="total_billed_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Bill
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}