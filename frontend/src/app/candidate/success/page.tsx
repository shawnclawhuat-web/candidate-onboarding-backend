import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Profile Submitted!
          </h2>
          <p className="text-slate-600 mb-6">
            Thank you for completing your profile. The admin will be in touch with you soon.
          </p>
          <p className="text-sm text-slate-500">
            You can close this window now.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
