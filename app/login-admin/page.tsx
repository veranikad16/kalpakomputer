"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/admin/ui/button"
import { Input } from "@/components/admin/ui/input"
import { Label } from "@/components/admin/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1 — kirim OTP ke email
  async function handleSendOtp() {
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setStep("otp") // pindah ke form OTP
    }

    setLoading(false)
  }

  // Step 2 — verifikasi OTP
  async function handleVerifyOtp() {
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      router.push("/dashboard") // masuk dashboard
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Admin</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Masukkan email admin Anda"
              : `Kode OTP telah dikirim ke ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "email" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                className="w-full"
                onClick={handleSendOtp}
                disabled={loading || !email}
              >
                {loading ? "Mengirim..." : "Kirim Kode OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Kode OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Memverifikasi..." : "Verifikasi OTP"}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => { setStep("email"); setError("") }}
              >
                Ganti email
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}