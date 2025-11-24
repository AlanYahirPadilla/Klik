import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verifica tu email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Te hemos enviado un email de confirmación. Por favor, verifica tu bandeja de entrada y haz clic en el
              enlace para activar tu cuenta.
            </p>
            <p className="text-sm text-muted-foreground">
              Una vez verificado, podrás iniciar sesión y comenzar a usar Klik.
            </p>
            <div className="pt-4">
              <Link href="/auth/login" className="text-sm font-medium text-primary hover:underline">
                Volver a iniciar sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
