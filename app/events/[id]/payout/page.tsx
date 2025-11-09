import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, CheckCircle2 } from "lucide-react"

export default function PayoutPage({ params }: { params: { id: string } }) {
  const payoutInfo = {
    totalRevenue: "15.5",
    serviceFee: "1.55",
    serviceFeePercent: "10",
    actualAmount: "13.95",
    paidOut: false,
  }

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
          <CardTitle>活动提现</CardTitle>
          <CardDescription>
            活动结束后，您可以提现收益。平台将收取 {payoutInfo.serviceFeePercent}% 的服务费。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {payoutInfo.paidOut ? (
            <div className="rounded-lg border p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="text-lg font-semibold mb-2">已提现</div>
              <div className="text-sm text-muted-foreground">
                该活动的收益已经提现完成
              </div>
            </div>
          ) : (
            <>
              {/* 收益信息 */}
              <div className="space-y-4">
                <div className="rounded-lg border p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">活动总收益</span>
                    <span className="text-2xl font-bold">{payoutInfo.totalRevenue} ETH</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">平台服务费 ({payoutInfo.serviceFeePercent}%)</span>
                    <span className="text-lg font-semibold">-{payoutInfo.serviceFee} ETH</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-semibold">实际可提现金额</span>
                    <span className="text-3xl font-bold">{payoutInfo.actualAmount} ETH</span>
                  </div>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <div className="text-sm font-medium text-destructive mb-1">
                    注意事项
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>提现操作只能执行一次</li>
                    <li>收益将自动分配给主办方和平台</li>
                    <li>请确保您的钱包有足够的 Gas 费用</li>
                  </ul>
                </div>
              </div>

              {/* 提现按钮 */}
              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  <DollarSign className="mr-2 h-5 w-5" />
                  确认提现
                </Button>
                <Link href={`/events/${params.id}`}>
                  <Button variant="outline" size="lg">
                    取消
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

