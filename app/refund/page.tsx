import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"

export default function RefundPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/my/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回我的门票
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>申请退款</CardTitle>
          <CardDescription>
            在活动开始前 3 天可以申请退款。退款后 NFT 门票将被销毁。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 选择活动 */}
          <div className="space-y-2">
            <Label>选择活动</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择要退款的活动" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Web3 开发者大会 (ID: 1)</SelectItem>
                <SelectItem value="2">NFT 艺术展览 (ID: 2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 选择门票类型 */}
          <div className="space-y-2">
            <Label>选择门票类型</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择要退款的门票类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">普通票 (GENERAL) - 持有 2 张</SelectItem>
                <SelectItem value="1">VIP票 (VIP) - 持有 1 张</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 退款数量 */}
          <div className="space-y-2">
            <Label htmlFor="refundCount">退款数量</Label>
            <Input
              id="refundCount"
              type="number"
              placeholder="0 表示全部退款"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              输入 0 将退款所有持有的门票
            </p>
          </div>

          {/* 退款信息 */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">持有数量</span>
              <span className="font-semibold">2 张</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">单价</span>
              <span className="font-semibold">0.1 ETH</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">退款金额</span>
              <span className="text-lg font-bold">0.2 ETH</span>
            </div>
          </div>

          {/* 退款截止时间 */}
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium">退款截止时间</div>
                <div className="text-sm text-muted-foreground">
                  活动开始前 3 天：2024-12-22 10:00
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  超过此时间将无法申请退款
                </div>
              </div>
            </div>
          </div>

          {/* 警告信息 */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <div className="text-sm font-medium text-destructive mb-1">
              重要提示
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>退款后 NFT 门票将被永久销毁</li>
              <li>已检票的门票无法退款</li>
              <li>退款将在交易确认后立即到账</li>
            </ul>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4">
            <Button className="flex-1" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              确认退款
            </Button>
            <Link href="/my/tickets">
              <Button variant="outline" size="lg">
                取消
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

