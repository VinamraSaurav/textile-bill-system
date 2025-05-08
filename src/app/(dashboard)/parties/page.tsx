"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"

// Mock data for parties
const mockParties = [
  {
    id: "1",
    name: "123 Enterprises",
    gstin: "24PQRST9876U1Z2",
    address: {
      city: "Mumbai",
      state: "Maharashtra",
    },
    phone: {
      mobile: ["9876543210"],
    },
  },
  {
    id: "2",
    name: "456 Corporation",
    gstin: "19UVWXY4321Z1Z7",
    address: {
      city: "Delhi",
      state: "Delhi",
    },
    phone: {
      mobile: ["8765432109"],
    },
  },
  {
    id: "3",
    name: "789 Industries",
    gstin: "36ABCDE1234F1Z5",
    address: {
      city: "Bangalore",
      state: "Karnataka",
    },
    phone: {
      mobile: ["7654321098"],
    },
  },
]

export default function PartiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Filter parties based on search term
  const filteredParties = mockParties.filter(
    (party) =>
      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.address.state.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Spinner className="text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredParties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No parties found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParties.map((party) => (
                    <TableRow key={party.id}>
                      <TableCell className="font-medium">
                        <Link href={`/parties/${party.id}`} className="hover:underline">
                          {party.name}
                        </Link>
                      </TableCell>
                      <TableCell>{party.gstin}</TableCell>
                      <TableCell>{`${party.address.city}, ${party.address.state}`}</TableCell>
                      <TableCell>{party.phone.mobile[0]}</TableCell>
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
