"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
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

// Mock data for suppliers and parties
const mockSuppliers = [
  { id: "1", name: "ABC Suppliers", gstin: "29ABCDE1234F1Z5" },
  { id: "2", name: "XYZ Distributors", gstin: "27XYZAB5678C1Z3" },
]

const mockParties = [
  { id: "1", name: "123 Enterprises", gstin: "24PQRST9876U1Z2" },
  { id: "2", name: "456 Corporation", gstin: "19UVWXY4321Z1Z7" },
]

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
  supplierId: z.string().min(1, "Supplier is required"),
  partyId: z.string().min(1, "Party is required"),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
  total_billed_amount: z.coerce.number().positive("Total amount must be positive"),
  payment_status: z.enum(["paid", "unpaid"]),
  newSupplier: newSupplierSchema.optional(),
  newParty: newPartySchema.optional(),
})

export default function BillFormPage() {
  const router = useRouter()
  const [isAddingSupplier, setIsAddingSupplier] = useState(false)
  const [isAddingParty, setIsAddingParty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-filled form data (simulating data extracted from the scanned bill)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bill_number: "INV-2023-001",
      bill_date: new Date(),
      location: "Mumbai",
      supplierId: "",
      partyId: "",
      items: [
        {
          name: "Product A",
          hsn: "1234",
          quantity: 2,
          rate: 500,
          amount: 1000,
        },
      ],
      total_billed_amount: 1000,
      payment_status: "unpaid",
    },
  })

  const { control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const addItem = () => {
    append({
      name: "",
      hsn: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    })
  }

  const calculateItemAmount = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`)
    const rate = form.getValues(`items.${index}.rate`)
    const amount = quantity * rate

    form.setValue(`items.${index}.amount`, amount)

    // Recalculate total
    const items = form.getValues("items")
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    form.setValue("total_billed_amount", total)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      // In a real app, you would send the form data to your backend
      console.log(values)

      // Simulate submission delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Bill saved successfully")
      router.push("/bills")
    } catch (error) {
      console.error("Error saving bill:", error)
      toast.error("Failed to save bill. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bill Details</h1>
        <p className="text-muted-foreground">Verify and edit the extracted bill information</p>
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
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} autoFocus />
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
                              setIsAddingSupplier(true)
                              field.onChange("")
                            } else {
                              setIsAddingSupplier(false)
                              field.onChange(value)
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
                            {mockSuppliers.map((supplier) => (
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
                              <Button variant="ghost" size="sm" onClick={() => setIsAddingSupplier(false)}>
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
                              setIsAddingParty(true)
                              field.onChange("")
                            } else {
                              setIsAddingParty(false)
                              field.onChange(value)
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
                            {mockParties.map((party) => (
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
                              <Button variant="ghost" size="sm" onClick={() => setIsAddingParty(false)}>
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
              {fields.map((field: any, index: number) => (
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
