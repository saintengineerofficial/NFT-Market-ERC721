import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X } from "lucide-react"

export default function CreateEventPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>创建活动</CardTitle>
          <CardDescription>
            填写活动信息并配置门票类型
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 活动基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">活动基本信息</h3>
            
            <div className="space-y-2">
              <Label htmlFor="metadataURI">活动元数据 URI</Label>
              <Input
                id="metadataURI"
                placeholder="ipfs://Qm..."
                type="text"
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endsAt">结束时间</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                />
              </div>
            </div>
          </div>

          {/* 门票类型配置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">门票类型配置</h3>
              <Button type="button" variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                添加门票类型
              </Button>
            </div>

            {/* 门票类型卡片示例 */}
            <div className="space-y-4">
              {/* 门票类型 1 */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">门票类型 1</CardTitle>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>门票类型</Label>
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

                  <div className="space-y-2">
                    <Label>门票名称</Label>
                    <Input placeholder="例如：标准票" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>价格 (ETH)</Label>
                      <Input type="number" placeholder="0.1" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label>容量</Label>
                      <Input type="number" placeholder="100" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>门票元数据 URI</Label>
                    <Input placeholder="ipfs://Qm..." />
                  </div>
                </CardContent>
              </Card>

              {/* 门票类型 2 - 示例 */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">门票类型 2</CardTitle>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>门票类型</Label>
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

                  <div className="space-y-2">
                    <Label>门票名称</Label>
                    <Input placeholder="例如：VIP票" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>价格 (ETH)</Label>
                      <Input type="number" placeholder="0.5" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label>容量</Label>
                      <Input type="number" placeholder="50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>门票元数据 URI</Label>
                    <Input placeholder="ipfs://Qm..." />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              创建活动
            </Button>
            <Link href="/">
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

