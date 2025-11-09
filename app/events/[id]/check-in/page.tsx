import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CheckCircle2, Search } from "lucide-react"

export default function CheckInPage({ params }: { params: { id: string } }) {
  const checkInRecords = [
    {
      attendee: "0x1111...2222",
      ticketType: "GENERAL",
      timestamp: "2024-12-25 10:30",
      checker: "0x1234...5678",
    },
    {
      attendee: "0x3333...4444",
      ticketType: "VIP",
      timestamp: "2024-12-25 10:35",
      checker: "0x1234...5678",
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

      <div className="grid gap-6">
        {/* 检票表单 */}
        <Card>
          <CardHeader>
            <CardTitle>检票</CardTitle>
            <CardDescription>
              输入参与者地址并选择门票类型进行检票
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendeeAddress">参与者地址</Label>
              <div className="flex gap-2">
                <Input
                  id="attendeeAddress"
                  placeholder="0x..."
                  type="text"
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <div className="text-sm font-medium">持有门票</div>
              <div className="text-sm text-muted-foreground">
                GENERAL: 2 张 • VIP: 1 张
              </div>
            </div>

            <div className="space-y-2">
              <Label>选择门票类型</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">普通票 (GENERAL)</SelectItem>
                  <SelectItem value="1">VIP票 (VIP)</SelectItem>
                  <SelectItem value="2">早鸟票 (EARLY_BIRD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">检票状态</span>
                <Badge variant="outline">未检票</Badge>
              </div>
            </div>

            <Button className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              确认检票
            </Button>
          </CardContent>
        </Card>

        {/* 检票记录 */}
        <Card>
          <CardHeader>
            <CardTitle>检票记录</CardTitle>
            <CardDescription>
              查看该活动的所有检票记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkInRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>参与者地址</TableHead>
                    <TableHead>门票类型</TableHead>
                    <TableHead>检票时间</TableHead>
                    <TableHead>检票员</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkInRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {record.attendee}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{record.ticketType}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.timestamp}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {record.checker}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                暂无检票记录
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

