import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, X } from "lucide-react"

export default function ManageCheckersPage({ params }: { params: { id: string } }) {
  const checkers = [
    {
      address: "0x1234...5678",
      addedAt: "2024-12-01 10:00",
    },
    {
      address: "0xabcd...efgh",
      addedAt: "2024-12-02 14:30",
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
        {/* 添加检票员 */}
        <Card>
          <CardHeader>
            <CardTitle>添加检票员</CardTitle>
            <CardDescription>
              添加新的检票员地址，检票员可以对该活动进行检票操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="checkerAddress">检票员地址</Label>
                <Input
                  id="checkerAddress"
                  placeholder="0x..."
                  type="text"
                />
              </div>
              <div className="flex items-end">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 检票员列表 */}
        <Card>
          <CardHeader>
            <CardTitle>检票员列表</CardTitle>
            <CardDescription>
              管理当前活动的所有检票员
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>地址</TableHead>
                    <TableHead>添加时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkers.map((checker, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {checker.address}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {checker.addedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                暂无检票员
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

