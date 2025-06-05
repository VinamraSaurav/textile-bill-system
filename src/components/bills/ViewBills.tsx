"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Filter, Plus, Search, SlidersHorizontal, Edit, Trash2, MoreHorizontal, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// Define types
interface Supplier {
  id: string;
  name: string;
}

interface Party {
  id: string;
  name: string;
}

interface Bill {
  id: string;
  bill_number?: string;
  bill_date?: string;
  supplier?: Supplier;
  party?: Party;
  total_billed_amount?: number;
  payment_status: "paid" | "unpaid";
  // Add any other bill properties here
}

export default function ViewBills() {
  const router = useRouter()
  const [bills, setBills] = useState<Bill[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string[]>([])
  const [supplierFilter, setSupplierFilter] = useState("all") // Changed from empty string to "all"
  const [partyFilter, setPartyFilter] = useState("all") // Changed from empty string to "all"
  const [amountFilter, setAmountFilter] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [billToDelete, setBillToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/bill')
      if (!response.ok) {
        throw new Error('Failed to fetch bills')
      }
      const data = await response.json() 
      console.log(data)
      setBills(data.data)
      
      // Extract unique suppliers and parties from bills
      const uniqueSuppliers = [...new Set(data.data.map((bill: Bill) => bill.supplier?.name).filter(Boolean))]
      const uniqueParties = [...new Set(data.data.map((bill: Bill) => bill.party?.name).filter(Boolean))]
      
      setSuppliers(uniqueSuppliers.map((name, id) => ({ id: id.toString(), name: name as string })))
      setParties(uniqueParties.map((name, id) => ({ id: id.toString(), name : name as string })))
    } catch (error) {
      console.error('Error fetching bills:', error)
      toast({
        title: "Error",
        description: "Failed to load bills. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBill = async () => {
    if (!billToDelete) return
    
    try {
      const response = await fetch(`/api/bill/${billToDelete}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete bill')
      }
      
      // Remove the deleted bill from state
      setBills(bills.filter(bill => bill.id !== billToDelete))
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting bill:', error)
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setBillToDelete(null)
    }
  }

  const handleUpdateBill = (bill: Bill) => {
    // Save bill data to local storage
    localStorage.setItem('updateBillData', JSON.stringify(bill))
    // Redirect to update page
    router.push('/update-bill')
  }

  const resetDateFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  // Filter bills based on all criteria
  const filteredBills = bills.filter((bill) => {
    // Search term filter
    if (
      searchTerm &&
      !bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !bill.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !bill.party?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Payment status filter
    if (paymentFilter.length > 0 && !paymentFilter.includes(bill.payment_status)) {
      return false
    }

    // Supplier filter
    if (supplierFilter !== "all" && bill.supplier?.name !== supplierFilter) {
      return false
    }

    // Party filter
    if (partyFilter !== "all" && bill.party?.name !== partyFilter) {
      return false
    }

    // Amount filter
    if (amountFilter) {
      const minAmount = Number.parseInt(amountFilter, 10)
      if (bill.total_billed_amount && bill.total_billed_amount < minAmount) {
        return false
      }
    }

    // Date range filter
    if (startDate || endDate) {
      const billDate = bill.bill_date ? new Date(bill.bill_date) : null
      
      if (!billDate) {
        return false
      }
      
      // Set time to midnight to compare dates only
      billDate.setHours(0, 0, 0, 0)
      
      if (startDate) {
        const startDateMidnight = new Date(startDate)
        startDateMidnight.setHours(0, 0, 0, 0)
        if (billDate < startDateMidnight) {
          return false
        }
      }
      
      if (endDate) {
        const endDateMidnight = new Date(endDate)
        endDateMidnight.setHours(23, 59, 59, 999)
        if (billDate > endDateMidnight) {
          return false
        }
      }
    }

    return true
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  // Responsive view for mobile screens
  const BillCard = ({ bill }: { bill: Bill }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/bills/${bill.id}`} className="text-lg font-medium hover:underline">
              {bill.bill_number || 'No Bill Number'}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDate(bill.bill_date)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUpdateBill(bill)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  setBillToDelete(bill.id)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium">Supplier</p>
            <p className="text-sm">{bill.supplier?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Party</p>
            <p className="text-sm">{bill.party?.name || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <p className="font-medium">₹{bill.total_billed_amount?.toLocaleString() || '0'}</p>
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
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-6 px-4 sm:px-6 w-full max-w-7xl mx-auto">
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
            <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bills..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="w-1/2 sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-1/2 sm:w-auto">
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
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="border-t pb-3 pt-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Supplier</h4>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map((supplier) => (
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
                    {parties.map((party) => (
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Date Range</h4>
                  {(startDate || endDate) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetDateFilters}
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "From Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "To Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner className="text-primary h-8 w-8" />
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bills found.</p>
            </div>
          ) : (
            <>
              {/* Desktop View - Table */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          <Link href={`/bills/${bill.id}`} className="hover:underline">
                            {bill.bill_number || 'N/A'}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(bill.bill_date)}</TableCell>
                        <TableCell>{bill.supplier?.name || 'N/A'}</TableCell>
                        <TableCell>{bill.party?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right">₹{bill.total_billed_amount?.toLocaleString() || '0'}</TableCell>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateBill(bill)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => {
                                setBillToDelete(bill.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-4">
                {filteredBills.map((bill) => (
                  <BillCard key={bill.id} bill={bill} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bill.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBill} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}