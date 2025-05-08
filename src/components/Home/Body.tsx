import Link from "next/link"
import { BarChart3, FileText, Plus, ScanText, Store, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Body() {
  const menuItems = [
    {
      title: "Scan & Add Bill",
      description: "Scan and process new bills",
      icon: ScanText,
      href: "/scan-bill",
      color: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-500",
    },
    {
      title: "View Bills",
      description: "Manage and filter all bills",
      icon: FileText,
      href: "/bills",
      color: "bg-gradient-to-br from-green-50 to-green-100",
      iconColor: "text-green-500",
    },
    {
      title: "Add Supplier",
      description: "Create new supplier profiles",
      icon: Truck,
      href: "/suppliers/new",
      color: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-500",
    },
    {
      title: "Add Party",
      description: "Create new party profiles",
      icon: Store,
      href: "/parties/new",
      color: "bg-gradient-to-br from-amber-50 to-amber-100",
      iconColor: "text-amber-500",
    },
    {
      title: "Dashboard",
      description: "View analytics and reports",
      icon: BarChart3,
      href: "/dashboard",
      color: "bg-gradient-to-br from-rose-50 to-rose-100",
      iconColor: "text-rose-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to BillTrack Pro</h1>
        <p className="text-muted-foreground">Manage your bills, suppliers, and parties efficiently</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link key={item.title} href={item.href}>
            <Card className={`h-full transition-all hover:shadow-md ${item.color}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
