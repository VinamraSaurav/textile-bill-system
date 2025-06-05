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

interface Party {
  id: string;
  name: string;
  gstin: string;
  address: Address;
  phone: Phone;
}

export default function PartiesPage() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [parties, setParties] = useState<Party[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null)
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
    fetchParties()
  }, [])

  const fetchParties = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/party")
      
      if (!response.ok) {
        throw new Error("Failed to fetch parties")
      }
      
      const data = await response.json()
      setParties(data.data || [])
    } catch (error) {
      console.error("Error fetching parties:", error)
      toast({
        title: "Error",
        description: "Failed to load parties. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (party: Party): void => {
    setPartyToDelete(party)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async (): Promise<void> => {
    if (!partyToDelete) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/party/${partyToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete party")
      }

      // Remove deleted party from the list
      setParties(parties.filter(p => p.id !== partyToDelete.id))
      toast({
        title: "Success",
        description: `${partyToDelete.name} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting party:", error)
      toast({
        title: "Error",
        description: "Failed to delete party. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPartyToDelete(null)
      setIsLoading(false)
    }
  }

  // Filter parties based on search term
  const filteredParties = parties.filter(
    (party: Party) =>
      party?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party?.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party?.address?.state?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parties</h1>
          <p className="text-muted-foreground">View and manage your parties</p>
        </div>
        <Button asChild>
          <Link href="/parties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Party
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
                  placeholder="Search parties..."
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
          ) : filteredParties.length === 0 ? (
            <div className="text-center py-8">
              No parties found.
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
                  {filteredParties.map((party: Party) => (
                    <TableRow key={party.id}>
                      <TableCell className="font-medium">
                        <Link href={`/parties/${party.id}`} className="hover:underline">
                          {party.name}
                        </Link>
                      </TableCell>
                      <TableCell>{party.gstin}</TableCell>
                      <TableCell>{`${party.address?.city || "N/A"}, ${party.address?.state || "N/A"}`}</TableCell>
                      <TableCell>{party.phone?.mobile?.[0] || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/parties/${party.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteClick(party)}
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
              {filteredParties.map((party: Party) => (
                <Card key={party.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col justify-between">
                      <Link href={`/parties/${party.id}`} className="hover:underline">
                        <h3 className="text-lg font-bold">{party.name}</h3>
                      </Link>
                      <Badge variant="outline" className="text-xs w-fit">
                        {party.gstin}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{`${party.address?.city || "N/A"}, ${party.address?.state || "N/A"}`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{party.phone?.mobile?.[0] || "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/20 flex justify-end gap-2 py-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/parties/${party.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50" 
                      onClick={() => handleDeleteClick(party)}
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
              This action will permanently delete the party{" "}
              <span className="font-semibold">{partyToDelete?.name}</span>. This action cannot be undone.
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