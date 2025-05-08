"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Chart,
  ChartAxisOptions,
  ChartBar,
  ChartContainer,
  ChartGrid,
  ChartPie,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Spinner } from "@/components/ui/spinner"

// Mock data for charts
const paymentStatusData = [
  { name: "Paid", value: 65000 },
  { name: "Unpaid", value: 35000 },
]

const monthlyData = [
  { month: "Jan", paid: 12000, unpaid: 8000 },
  { month: "Feb", paid: 15000, unpaid: 10000 },
  { month: "Mar", paid: 18000, unpaid: 7000 },
  { month: "Apr", paid: 20000, unpaid: 5000 },
  { month: "May", paid: 22000, unpaid: 9000 },
  { month: "Jun", paid: 19000, unpaid: 11000 },
]

const supplierData = [
  { name: "ABC Suppliers", value: 45000 },
  { name: "XYZ Distributors", value: 30000 },
  { name: "PQR Enterprises", value: 25000 },
]

const partyData = [
  { name: "123 Enterprises", value: 40000 },
  { name: "456 Corporation", value: 35000 },
  { name: "789 Industries", value: 25000 },
]

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Spinner size="lg" className="text-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your bill management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹100,000</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹65,000</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹35,000</div>
            <p className="text-xs text-muted-foreground">-5.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+12 since last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Distribution of paid vs unpaid amounts</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer className="h-full">
                  <Chart data={paymentStatusData}>
                    <ChartPie
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </Chart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Paid vs unpaid amounts over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer className="h-full">
                  <Chart data={monthlyData}>
                    <ChartAxisOptions xAxisId="month" dataKey="month" xAxisProps={{ fontSize: 12 }} />
                    <ChartGrid vertical={false} />
                    <ChartBar dataKey="paid" name="Paid" fill="var(--chart-1)" radius={4} barSize={20} />
                    <ChartBar dataKey="unpaid" name="Unpaid" fill="var(--chart-2)" radius={4} barSize={20} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </Chart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amount by Supplier</CardTitle>
              <CardDescription>Total amount billed by each supplier</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer className="h-full">
                <Chart data={supplierData}>
                  <ChartAxisOptions xAxisId="name" dataKey="name" xAxisProps={{ fontSize: 12 }} />
                  <ChartGrid vertical={false} />
                  <ChartBar dataKey="value" name="Amount" fill="var(--chart-3)" radius={4} barSize={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </Chart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amount by Party</CardTitle>
              <CardDescription>Total amount billed to each party</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer className="h-full">
                <Chart data={partyData}>
                  <ChartAxisOptions xAxisId="name" dataKey="name" xAxisProps={{ fontSize: 12 }} />
                  <ChartGrid vertical={false} />
                  <ChartBar dataKey="value" name="Amount" fill="var(--chart-4)" radius={4} barSize={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </Chart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
