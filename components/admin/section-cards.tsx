"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card"
import { Badge } from "@/components/admin/ui/badge"
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { TimeRange } from "@/components/admin/dashboard-time-filter"

// NOTE: sesuaikan string status ini kalau penulisan di kolom `status`
// tabel servis_workshop / servis_onsite berbeda (case-sensitive).
const STATUS_SELESAI = "Selesai"
const STATUS_DIBATALKAN = "Dibatalkan"
const STATUS_AKTIF = ["Dikonfirmasi", "Diproses"]

const RANGE_DAYS: Record<TimeRange, number> = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
}

const RANGE_LABEL: Record<TimeRange, string> = {
  "90d": "3 Bulan",
  "30d": "30 Hari",
  "7d": "7 Hari",
}

type Stat = { workshop: number; onsite: number }
const emptyStat: Stat = { workshop: 0, onsite: 0 }

interface SectionCardsProps {
  timeRange: TimeRange
}

export function SectionCards({ timeRange }: SectionCardsProps) {
  const [total, setTotal] = useState<Stat>(emptyStat)
  const [aktif, setAktif] = useState<Stat>(emptyStat)
  const [selesai, setSelesai] = useState<Stat>(emptyStat)
  const [dibatalkan, setDibatalkan] = useState<Stat>(emptyStat)

  useEffect(() => {
    const fetchStats = async () => {
      const days = RANGE_DAYS[timeRange]
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startBoundary = `${startDate.toISOString().split("T")[0]}T00:00:00`

      // 1. Total ajuan dalam periode terpilih
      const [{ count: totalWorkshop }, { count: totalOnsite }] = await Promise.all([
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startBoundary),
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startBoundary),
      ])
      setTotal({ workshop: totalWorkshop ?? 0, onsite: totalOnsite ?? 0 })

      // 2. Sedang diproses dalam periode terpilih
      const [{ count: aktifWorkshop }, { count: aktifOnsite }] = await Promise.all([
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .in("status", STATUS_AKTIF)
          .gte("created_at", startBoundary),
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .in("status", STATUS_AKTIF)
          .gte("created_at", startBoundary),
      ])
      setAktif({ workshop: aktifWorkshop ?? 0, onsite: aktifOnsite ?? 0 })

      // 3. Selesai dalam periode terpilih
      const [{ count: selesaiWorkshop }, { count: selesaiOnsite }] = await Promise.all([
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .eq("status", STATUS_SELESAI)
          .gte("created_at", startBoundary),
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .eq("status", STATUS_SELESAI)
          .gte("created_at", startBoundary),
      ])
      setSelesai({ workshop: selesaiWorkshop ?? 0, onsite: selesaiOnsite ?? 0 })

      // 4. Dibatalkan dalam periode terpilih
      const [{ count: batalWorkshop }, { count: batalOnsite }] = await Promise.all([
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .eq("status", STATUS_DIBATALKAN)
          .gte("created_at", startBoundary),
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .eq("status", STATUS_DIBATALKAN)
          .gte("created_at", startBoundary),
      ])
      setDibatalkan({ workshop: batalWorkshop ?? 0, onsite: batalOnsite ?? 0 })
    }

    fetchStats()
  }, [timeRange])

  const rangeLabel = RANGE_LABEL[timeRange]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">

      {/* 1. Total Ajuan */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Ajuan Servis</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {total.workshop + total.onsite}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ClipboardList className="h-3 w-3 mr-1" />
              {rangeLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Workshop & On-Site</div>
          <div className="text-muted-foreground">
            {total.workshop} Workshop • {total.onsite} On-Site
          </div>
        </CardFooter>
      </Card>

      {/* 2. Sedang Diproses */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sedang Diproses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {aktif.workshop + aktif.onsite}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <Wrench className="h-3 w-3 mr-1" />
              {rangeLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Dikonfirmasi & diproses</div>
          <div className="text-muted-foreground">
            {aktif.workshop} Workshop • {aktif.onsite} On-Site
          </div>
        </CardFooter>
      </Card>

      {/* 3. Selesai */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Servis Selesai</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {selesai.workshop + selesai.onsite}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {rangeLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Total servis selesai</div>
          <div className="text-muted-foreground">
            {selesai.workshop} Workshop • {selesai.onsite} On-Site
          </div>
        </CardFooter>
      </Card>

      {/* 4. Dibatalkan */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Servis Dibatalkan</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {dibatalkan.workshop + dibatalkan.onsite}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600 border-red-300">
              <XCircle className="h-3 w-3 mr-1" />
              {rangeLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Total servis dibatalkan</div>
          <div className="text-muted-foreground">
            {dibatalkan.workshop} Workshop • {dibatalkan.onsite} On-Site
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}