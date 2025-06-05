"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
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
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// Define TypeScript interfaces
interface Address {
  city: string;
  state: string;
}

interface Phone {
  mobile: string[];
}

interface Supplier {
  id: string;
  name: string;
  gstin: string;
  address: Address;
  phone: Phone;
}

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [isMobileView, setIsMobileView] = useState<boolean>(false)

  // Check if the screen is mobile size
  const checkIfMobile = useCallback(() => {
    setIsMobileView(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    // Set initial value
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [checkIfMobile])

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/supplier")
      
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers")
      }
      
      const data = await response.json()
      setSuppliers(data.data || [])
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast({
        title: "Error",
        description: "Failed to load suppliers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (supplier: Supplier): void => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async (): Promise<void> => {
    if (!supplierToDelete) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/supplier/${supplierToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete supplier")
      }

      // Remove deleted supplier from the list
      setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id))
      toast({
        title: "Success",
        description: `${supplierToDelete.name} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
      setIsLoading(false)
    }
  }

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier: Supplier) =>
      supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.address?.state?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">View and manage your suppliers</p>
        </div>
        <Button asChild>
          <Link href="/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
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
                  placeholder="Search suppliers..."
                  className="pl-8 sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="text-primary" />
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              No suppliers found.
            </div>
          ) : !isMobileView ? (
            // Desktop view: Table
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier: Supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        <Link href={`/suppliers/${supplier.id}`} className="hover:underline">
                          {supplier.name}
                        </Link>
                      </TableCell>
                      <TableCell>{supplier.gstin}</TableCell>
                      <TableCell>{`${supplier.address?.city || "N/A"}, ${supplier.address?.state || "N/A"}`}</TableCell>
                      <TableCell>{supplier.phone?.mobile?.[0] || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/suppliers/${supplier.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteClick(supplier)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Mobile view: Cards
            <div className="space-y-4">
              {filteredSuppliers.map((supplier: Supplier) => (
                <Card key={supplier.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col justify-between">
                      <Link href={`/suppliers/${supplier.id}`} className="hover:underline">
                        <h3 className="text-lg font-bold">{supplier.name}</h3>
                      </Link>
                      <Badge variant="outline" className="text-xs w-fit">
                        {supplier.gstin}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{`${supplier.address?.city || "N/A"}, ${supplier.address?.state || "N/A"}`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.phone?.mobile?.[0] || "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/20 flex justify-end gap-2 py-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/suppliers/${supplier.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50" 
                      onClick={() => handleDeleteClick(supplier)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the supplier{" "}
              <span className="font-semibold">{supplierToDelete?.name}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}