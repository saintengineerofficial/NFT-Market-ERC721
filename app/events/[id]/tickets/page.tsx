import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save } from "lucide-react"

export default function ManageTicketsPage({ params }: { params: { id: string } }) {
  const ticketTypes = [
    {
      type: "GENERAL",
      name: "普通票",
      price: "0.1",
      capacity: 100,
      sold: 45,
      metadataURI: "ipfs://Qm...",
      active: true,
    },
    {
      type: "VIP",
      name: "VIP票",
      price: "0.5",
      capacity: 50,
      sold: 20,
      metadataURI: "ipfs://Qm...",
      active: true,
    },
    {
      type: "EARLY_BIRD",
      name: "早鸟票",
      price: "0.05",
      capacity: 50,
      sold: 30,
      metadataURI: "ipfs://Qm...",
      active: false,
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/events/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回活动详情
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>管理门票类型</CardTitle>
          <CardDescription>
            更新门票类型的信息。注意：新容量不能小于已售数量
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ticketTypes.map((ticket, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{ticket.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {ticket.type} • 已售 {ticket.sold} 张
                    </CardDescription>
                  </div>
                  <Badge variant={ticket.active ? "default" : "outline"}>
                    {ticket.active ? "激活" : "停售"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>门票名称</Label>
                  <Input defaultValue={ticket.name} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>价格 (ETH)</Label>
                    <Input type="number" defaultValue={ticket.price} step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <Label>容量（最小: {ticket.sold}）</Label>
                    <Input type="number" defaultValue={ticket.capacity} min={ticket.sold} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>门票元数据 URI</Label>
                  <Input defaultValue={ticket.metadataURI} />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={ticket.active}
                      className="rounded"
                    />
                    <span>激活状态</span>
                  </Label>
                </div>

                <Button variant="outline" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  保存更改
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}

