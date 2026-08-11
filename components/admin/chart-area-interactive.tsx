"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { supabase } from "@/lib/supabase"

import {
  Card,
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
import type { TimeRange } from "@/components/admin/dashboard-time-filter"

const chartConfig = {
  workshop: {
    label: "Workshop",
    color: "red",
  },
  onsite: {
    label: "On-Site",
    color: "green",
  },
} satisfies ChartConfig

const RANGE_DAYS: Record<TimeRange, number> = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
}

type ChartRow = { date: string; workshop: number; onsite: number }

interface ChartAreaInteractiveProps {
  timeRange: TimeRange
}

export function ChartAreaInteractive({ timeRange }: ChartAreaInteractiveProps) {
  const [chartData, setChartData] = React.useState<ChartRow[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      const daysToSubtract = RANGE_DAYS[timeRange]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysToSubtract)
      const startStr = startDate.toISOString().split("T")[0]

      // Fetch workshop (pakai created_at)
      const { data: workshopData } = await supabase
        .from("servis_workshop")
        .select("created_at")
        .gte("created_at", `${startStr}T00:00:00`)

      // Fetch onsite (pakai created_at)
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
        <CardDescription>Workshop vs On-Site</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData} margin={{ top: 20, right: 12, left: 12, bottom: 0 }}>
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
              type="monotone"
              fill="url(#fillWorkshop)"
              stroke="var(--color-workshop)"
            />
            <Area
              dataKey="onsite"
              type="monotone"
              fill="url(#fillOnsite)"
              stroke="var(--color-onsite)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}