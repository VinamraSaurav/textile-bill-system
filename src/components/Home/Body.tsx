import Link from "next/link"
import { BarChart3, FileText, Plus, ScanText, Store, Truck, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MdAddBusiness } from "react-icons/md"

export default function Body() {
  const menuSections = [
    {
      heading: "Bills",
      items: [
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
      ]
    },
    {
      heading: "Entities",
      items: [
        {
          title: "Add Supplier",
          description: "Create new supplier profiles",
          icon: MdAddBusiness,
          href: "/suppliers/new",
          color: "bg-gradient-to-br from-purple-50 to-purple-100",
          iconColor: "text-purple-500",
        },
        {
          title: "Manage Suppliers",
          description: "View and edit supplier details",
          icon: Truck,
          href: "/suppliers",
          color: "bg-gradient-to-br from-pink-50 to-pink-100",
          iconColor: "text-pink-500",
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
          title: "Manage Parties",
          description: "View and edit party details",
          icon: User,
          href: "/parties",
          color: "bg-gradient-to-br from-orange-50 to-orange-100",
          iconColor: "text-orange-500",
        },
      ]
    },
    {
      heading: "Admin Options",
      items: [
        {
          title: "Dashboard",
          description: "View analytics and reports",
          icon: BarChart3,
          href: "/dashboard",
          color: "bg-gradient-to-br from-rose-50 to-rose-100",
          iconColor: "text-rose-500",
        },
        {
          title: "Manage Users",
          description: "Add or remove users",
          icon: User,
          href: "/dashboard/users",
          color: "bg-gradient-to-br from-teal-50 to-teal-100",
          iconColor: "text-teal-500",
        },
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to BillTrack</h1>
        <p className="text-muted-foreground">Manage your bills, suppliers, and parties efficiently</p>
      </div>

      {menuSections.map((section) => (
        <div key={section.heading} className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight border-b pb-2">{section.heading}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className={`h-full transition-all hover:shadow-md ${item.color}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {item.icon === MdAddBusiness ? 
                        <MdAddBusiness className={`h-6 w-6 ${item.iconColor}`} /> :
                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                      }
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
      ))}
    </div>
  )
}