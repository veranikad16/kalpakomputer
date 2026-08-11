"use client"

import { useState } from "react"

import { ChartAreaInteractive } from "@/components/admin/chart-area-interactive"
import { DataTable } from "@/components/admin/data-table"
import { SectionCards } from "@/components/admin/section-cards"
import { DashboardTimeFilter, type TimeRange } from "@/components/admin/dashboard-time-filter"

import data from "./data.json"

export default function Page() {
  const [timeRange, setTimeRange] = useState<TimeRange>("90d")

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <DashboardTimeFilter value={timeRange} onChange={setTimeRange} />
      <SectionCards timeRange={timeRange} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive timeRange={timeRange} />
      </div>
    </div>
  )
}