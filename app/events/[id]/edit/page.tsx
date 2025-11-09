import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function EditEventPage({ params }: { params: { id: string } }) {
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
          <CardTitle>编辑活动</CardTitle>
          <CardDescription>
            更新活动信息（只能修改元数据 URI、开始时间和结束时间）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 只读信息 */}
          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold">活动信息</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">活动 ID</Label>
                <div className="text-sm font-medium">{params.id}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">主办方地址</Label>
                <div className="text-sm font-mono">0x1234...5678</div>
              </div>
            </div>
          </div>

          {/* 可编辑字段 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metadataURI">活动元数据 URI</Label>
              <Input
                id="metadataURI"
                placeholder="ipfs://Qm..."
                defaultValue="ipfs://QmExample..."
              />
              <p className="text-xs text-muted-foreground">
                包含活动名称、描述、图片等信息的元数据 URI
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startsAt">开始时间</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  defaultValue="2024-12-25T10:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endsAt">结束时间</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  defaultValue="2024-12-25T18:00"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              保存更改
            </Button>
            <Link href={`/events/${params.id}`}>
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

