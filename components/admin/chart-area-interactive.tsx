"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { supabase } from "@/lib/supabase"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/admin/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/admin/ui/toggle-group"

const chartConfig = {
  workshop: {
    label: "Workshop",
    color: "var(--primary)",
  },
  onsite: {
    label: "On-Site",
    color: "var(--color-chart-2, #34d399)",
  },
} satisfies ChartConfig

type ChartRow = { date: string; workshop: number; onsite: number }

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState<ChartRow[]>([])

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  React.useEffect(() => {
    const fetchData = async () => {
      // Hitung tanggal mulai
      const daysToSubtract = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysToSubtract)
      const startStr = startDate.toISOString().split("T")[0]

      // Fetch workshop (pakai created_at)
      const { data: workshopData } = await supabase
        .from("servis_workshop")
        .select("created_at")
        .gte("created_at", `${startStr}T00:00:00`)

      // Fetch onsite (pakai tanggal_kunjungan)
      const { data: onsiteData } = await supabase
        .from("servis_onsite")
        .select("created_at")
        .gte("created_at", `${startStr}T00:00:00`)

      // Buat map per tanggal
      const map: Record<string, ChartRow> = {}

      // Isi semua tanggal dalam range dengan nilai 0
      for (let i = 0; i <= daysToSubtract; i++) {
        const d = new Date()
        d.setDate(d.getDate() - (daysToSubtract - i))
        const key = d.toISOString().split("T")[0]
        map[key] = { date: key, workshop: 0, onsite: 0 }
      }

      workshopData?.forEach((row) => {
        const key = row.created_at.split("T")[0]
        if (map[key]) map[key].workshop += 1
      })

      onsiteData?.forEach((row) => {
        const key = row.created_at.split("T")[0]
        if (map[key]) map[key].onsite += 1
      })

      setChartData(Object.values(map).sort((a, b) => a.date.localeCompare(b.date)))
    }

    fetchData()
  }, [timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Ajuan Servis</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Workshop vs On-Site
          </span>
          <span className="@[540px]/card:hidden">Workshop vs On-Site</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => setTimeRange(value[0] ?? "90d")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 Bulan</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Hari</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 Hari</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => { if (value) setTimeRange(value) }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="3 Bulan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">3 Bulan</SelectItem>
              <SelectItem value="30d" className="rounded-lg">30 Hari</SelectItem>
              <SelectItem value="7d" className="rounded-lg">7 Hari</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillWorkshop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-workshop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-workshop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillOnsite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-onsite)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-onsite)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="workshop"
              type="natural"
              fill="url(#fillWorkshop)"
              stroke="var(--color-workshop)"
            />
            <Area
              dataKey="onsite"
              type="natural"
              fill="url(#fillOnsite)"
              stroke="var(--color-onsite)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}