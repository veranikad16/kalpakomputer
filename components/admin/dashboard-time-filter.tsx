"use client"

import { useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/admin/ui/toggle-group"

export type TimeRange = "90d" | "30d" | "7d"

interface DashboardTimeFilterProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
}

export function DashboardTimeFilter({ value, onChange }: DashboardTimeFilterProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) onChange("7d")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  return (
    <div className="flex justify-end px-4 lg:px-6">
      <ToggleGroup
        multiple={false}
        value={value ? [value] : []}
        onValueChange={(v) => {
          if (v[0]) onChange(v[0] as TimeRange)
        }}
        variant="outline"
        className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
      >
        <ToggleGroupItem value="90d">3 Bulan</ToggleGroupItem>
        <ToggleGroupItem value="30d">30 Hari</ToggleGroupItem>
        <ToggleGroupItem value="7d">7 Hari</ToggleGroupItem>
      </ToggleGroup>
      <Select
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v as TimeRange)
        }}
      >
        <SelectTrigger
          className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
          size="sm"
          aria-label="Pilih rentang waktu"
        >
          <SelectValue placeholder="3 Bulan" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="90d" className="rounded-lg">3 Bulan</SelectItem>
          <SelectItem value="30d" className="rounded-lg">30 Hari</SelectItem>
          <SelectItem value="7d" className="rounded-lg">7 Hari</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}