"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"

// Mock data for bills
const mockBills = [
  {
    id: "1",
    bill_number: "INV-2023-001",
    bill_date: "2023-05-15",
    supplier: { name: "ABC Suppliers" },
    party: { name: "123 Enterprises" },
    total_billed_amount: 5000,
    payment_status: "paid",
  },
  {
    id: "2",
    bill_number: "INV-2023-002",
    bill_date: "2023-05-20",
    supplier: { name: "XYZ Distributors" },
    party: { name: "456 Corporation" },
    total_billed_amount: 7500,
    payment_status: "unpaid",
  },
  {
    id: "3",
    bill_number: "INV-2023-003",
    bill_date: "2023-06-01",
    supplier: { name: "ABC Suppliers" },
    party: { name: "456 Corporation" },
    total_billed_amount: 3200,
    payment_status: "paid",
  },
  {
    id: "4",
    bill_number: "INV-2023-004",
    bill_date: "2023-06-10",
    supplier: { name: "XYZ Distributors" },
    party: { name: "123 Enterprises" },
    total_billed_amount: 9800,
    payment_status: "unpaid",
  },
  {
    id: "5",
    bill_number: "INV-2023-005",
    bill_date: "2023-06-15",
    supplier: { name: "ABC Suppliers" },
    party: { name: "123 Enterprises" },
    total_billed_amount: 4500,
    payment_status: "paid",
  },
]

// Mock data for suppliers and parties
const mockSuppliers = [
  { id: "1", name: "ABC Suppliers" },
  { id: "2", name: "XYZ Distributors" },
]

const mockParties = [
  { id: "1", name: "123 Enterprises" },
  { id: "2", name: "456 Corporation" },
]

export default function BillsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string[]>([])
  const [supplierFilter, setSupplierFilter] = useState("")
  const [partyFilter, setPartyFilter] = useState("")
  const [amountFilter, setAmountFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Filter bills based on search term and filters
  const filteredBills = mockBills.filter((bill) => {
    // Search term filter
    if (
      searchTerm &&
      !bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !bill.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !bill.party.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Payment status filter
    if (paymentFilter.length > 0 && !paymentFilter.includes(bill.payment_status)) {
      return false
    }

    // Supplier filter
    if (supplierFilter && bill.supplier.name !== supplierFilter) {
      return false
    }

    // Party filter
    if (partyFilter && bill.party.name !== partyFilter) {
      return false
    }

    // Amount filter
    if (amountFilter) {
      const minAmount = Number.parseInt(amountFilter, 10)
      if (bill.total_billed_amount < minAmount) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-6 md:min-w-3xl lg:min-w-5xl xl:min-w-7xl max-w-7xl mx-auto ">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
          <p className="text-muted-foreground">View and manage all your bills</p>
        </div>
        <Button asChild>
          <Link href="/scan-bill">
            <Plus className="mr-2 h-4 w-4" />
            Add New Bill
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bills..."
                  className="pl-8 sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuCheckboxItem
                    checked={paymentFilter.includes("paid")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentFilter([...paymentFilter, "paid"])
                      } else {
                        setPaymentFilter(paymentFilter.filter((s) => s !== "paid"))
                      }
                    }}
                  >
                    Paid
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={paymentFilter.includes("unpaid")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentFilter([...paymentFilter, "unpaid"])
                      } else {
                        setPaymentFilter(paymentFilter.filter((s) => s !== "unpaid"))
                      }
                    }}
                  >
                    Unpaid
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="border-t pb-3 pt-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Supplier</h4>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {mockSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Party</h4>
                <Select value={partyFilter} onValueChange={setPartyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Parties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parties</SelectItem>
                    {mockParties.map((party) => (
                      <SelectItem key={party.id} value={party.name}>
                        {party.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Minimum Amount</h4>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        )}
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Spinner className="text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No bills found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        <Link href={`/bills/${bill.id}`} className="hover:underline">
                          {bill.bill_number}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                      <TableCell>{bill.supplier.name}</TableCell>
                      <TableCell>{bill.party.name}</TableCell>
                      <TableCell className="text-right">₹{bill.total_billed_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={bill.payment_status === "paid" ? "default" : "outline"}
                          className={
                            bill.payment_status === "paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          }
                        >
                          {bill.payment_status === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
