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
import { ClipboardList, Clock, Wrench, CheckCircle2 } from "lucide-react"

export function SectionCards() {
  const [totalHariIni, setTotalHariIni] = useState(0)
  const [totalPending, setTotalPending] = useState(0)
  const [totalDiproses, setTotalDiproses] = useState(0)
  const [totalSelesai, setTotalSelesai] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split("T")[0]

      // 1. Total ajuan hari ini (onsite by tanggal_kunjungan + workshop by created_at)
      const [{ count: onsiteHariIni }, { count: workshopHariIni }] = await Promise.all([
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`),
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`),
      ])
      setTotalHariIni((onsiteHariIni ?? 0) + (workshopHariIni ?? 0))

      // 2. Total pending (belum dikonfirmasi)
      const [{ count: onsitePending }, { count: workshopPending }] = await Promise.all([
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pilih Teknisi"),
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .eq("status", "Menunggu Konfirmasi"),
      ])
      setTotalPending((onsitePending ?? 0) + (workshopPending ?? 0))

      // 3. Total sedang diproses
      const [{ count: onsiteDiproses }, { count: workshopDiproses }] = await Promise.all([
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .in("status", ["Dikonfirmasi", "Diproses"]),
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .in("status", ["Dikonfirmasi", "Diproses"]),
      ])
      setTotalDiproses((onsiteDiproses ?? 0) + (workshopDiproses ?? 0))

      // 4. Total selesai
      const [{ count: onsiteSelesai }, { count: workshopSelesai }] = await Promise.all([
        supabase
          .from("servis_onsite")
          .select("*", { count: "exact", head: true })
          .eq("status", "Selesai"),
        supabase
          .from("servis_workshop")
          .select("*", { count: "exact", head: true })
          .eq("status", "Selesai"),
      ])
      setTotalSelesai((onsiteSelesai ?? 0) + (workshopSelesai ?? 0))
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      
      {/* 1. Total Ajuan Hari Ini */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Ajuan Servis</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalHariIni}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ClipboardList className="h-3 w-3 mr-1" />
              Hari Ini
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Workshop & On-Site
          </div>
          <div className="text-muted-foreground">Semua ajuan masuk hari ini</div>
        </CardFooter>
      </Card>

      {/* 2. Pending */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Menunggu Konfirmasi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPending}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Belum dikonfirmasi admin
          </div>
          <div className="text-muted-foreground">Workshop & On-Site</div>
        </CardFooter>
      </Card>

      {/* 3. Sedang Diproses */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sedang Diproses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalDiproses}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <Wrench className="h-3 w-3 mr-1" />
              Aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Dikonfirmasi & diproses
          </div>
          <div className="text-muted-foreground">Workshop & On-Site</div>
        </CardFooter>
      </Card>

      {/* 4. Selesai */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Servis Selesai</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalSelesai}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Selesai
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total servis selesai
          </div>
          <div className="text-muted-foreground">Workshop & On-Site</div>
        </CardFooter>
      </Card>

    </div>
  )
}