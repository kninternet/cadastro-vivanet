import { Suspense } from "react"
import Image from "next/image"
import { PreCadastroForm } from "@/components/pre-cadastro/pre-cadastro-form"

function Header() {
  return (
    <header className="w-full max-w-[680px] flex flex-col items-center justify-center py-6 pb-10 text-center gap-3">
      <Image
        src="/logo-vivanet.png"
        alt="Viva Net Telecom"
        width={220}
        height={71}
        className="object-contain"
        priority
      />
      <p className="text-[15px] text-foreground/50 font-medium">
        Internet por fibra óptica em São Gonçalo
      </p>
    </header>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  
  return (
    <footer className="mt-8 text-center text-[13px] text-muted-foreground">
      © {year} Viva Net Telecom · MJP TELECOM LTDA · CNPJ 34.676.479/0001-00 ·{" "}
      <a
        href="https://wa.me/5521999490642"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary font-medium hover:underline"
      >
        Fale conosco
      </a>
    </footer>
  )
}

function BackgroundDecoration() {
  return (
    <>
      {/* Background gradients */}
      <div className="page-bg">
        <div className="dot-grid" />
      </div>

      {/* Fiber SVG decoration */}
      <svg
        className="fiber-deco"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4043B1" stopOpacity="0" />
            <stop offset="50%" stopColor="#4043B1" stopOpacity="1" />
            <stop offset="100%" stopColor="#4043B1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,400 Q300,250 600,400 T1200,400"
          fill="none"
          stroke="url(#fg)"
          strokeWidth="2"
        />
        <path
          d="M0,500 Q300,350 600,500 T1200,500"
          fill="none"
          stroke="url(#fg)"
          strokeWidth="1.5"
        />
        <path
          d="M0,300 Q300,450 600,300 T1200,300"
          fill="none"
          stroke="url(#fg)"
          strokeWidth="1"
        />
      </svg>
    </>
  )
}

export default function Page() {
  return (
    <>
      <BackgroundDecoration />

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8 pb-16">
        <Header />

        <Suspense
          fallback={
            <div className="w-full max-w-[680px] bg-card rounded-2xl shadow-xl border border-border overflow-hidden p-8 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          }
        >
          <PreCadastroForm />
        </Suspense>

        <Footer />
      </div>
    </>
  )
}
