"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export default function LoginTeknisiPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.")
      return
    }
    setLoading(true)
    setError("")

    const { data, error: dbError } = await supabase
      .from("teknisi")
      .select("id, nama, username, password")
      .eq("username", username.trim())
      .single()

    if (dbError || !data) {
      setError("Username tidak ditemukan.")
      setLoading(false)
      return
    }

    if (data.password !== password.trim()) {
      setError("Password salah.")
      setLoading(false)
      return
    }

    // Simpan session ke localStorage
    localStorage.setItem("teknisi_id", data.id)
    localStorage.setItem("teknisi_nama", data.nama)

    router.push("/teknisi")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-sm p-8 space-y-6">
        {/* Logo / Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-foreground">Portal Teknisi</h1>
          <p className="text-sm text-muted-foreground">PT. Kalpa Komputer Bali</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? "Masuk..." : "Masuk"}
          </Button>
        </div>
      </div>
    </div>
  )
}