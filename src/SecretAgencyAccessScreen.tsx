import { AlertTriangle, Eye, EyeOff, Lock, Shield } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'

const CORRECT_CODE = '28461973'
const SECRET_MESSAGE = 'casa da sanja, cozinha, gaveta, em baixo dos panos de prato'

type Status = 'idle' | 'error' | 'amanda' | 'gabriel' | 'success'

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

export default function SecretAgencyAccessScreen() {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [digits, setDigits] = useState<string[]>(Array.from({ length: 8 }, () => ''))
  const [status, setStatus] = useState<Status>('idle')
  const [shakeKey, setShakeKey] = useState(0)
  const [revealKey, setRevealKey] = useState(0)
  const [debug, setDebug] = useState(false)
  const [typed, setTyped] = useState('')

  const code = useMemo(() => digits.join(''), [digits])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (status !== 'success') return

    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTyped(SECRET_MESSAGE.slice(0, i))
      if (i >= SECRET_MESSAGE.length) {
        window.clearInterval(id)
      }
    }, 26)

    return () => window.clearInterval(id)
  }, [status, revealKey])

  function focusIndex(index: number) {
    inputRefs.current[index]?.focus()
    inputRefs.current[index]?.select()
  }

  function setDigitAt(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function handleChange(index: number, raw: string) {
    const nextDigit = onlyDigits(raw).slice(-1)
    setDigitAt(index, nextDigit)
    if (nextDigit && index < 7) focusIndex(index + 1)
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigitAt(index, '')
        return
      }
      if (index > 0) {
        setDigitAt(index - 1, '')
        focusIndex(index - 1)
      }
      return
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusIndex(index - 1)
      return
    }

    if (e.key === 'ArrowRight' && index < 7) {
      e.preventDefault()
      focusIndex(index + 1)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      validate()
    }
  }

  function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
    const pasted = onlyDigits(e.clipboardData.getData('text'))
    if (!pasted) return
    e.preventDefault()

    setDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < pasted.length; i += 1) {
        const target = index + i
        if (target > 7) break
        next[target] = pasted[i] ?? ''
      }
      return next
    })

    const last = Math.min(7, index + pasted.length - 1)
    focusIndex(last)
  }

  function validate() {
    const left = code.slice(0, 4)
    const right = code.slice(4, 8)
    const correctLeft = CORRECT_CODE.slice(0, 4)
    const correctRight = CORRECT_CODE.slice(4, 8)

    const amandaOk = left.length === 4 && left === correctLeft
    const gabrielOk = right.length === 4 && right === correctRight

    if (amandaOk && gabrielOk) {
      setTyped('')
      setRevealKey((k) => k + 1)
      setStatus('success')
      return
    }

    if (amandaOk) {
      setStatus('amanda')
      return
    }

    if (gabrielOk) {
      setStatus('gabriel')
      return
    }

    setStatus('error')
    setShakeKey((k) => k + 1)
  }

  const statusBlock = (() => {
    if (status === 'success') {
      return (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-200">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <Shield className="h-4 w-4" />
            ACESSO CONCEDIDO
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 font-mono text-sm text-slate-100">
            <span>{typed}</span>
            <span className="ml-0.5 inline-block h-4 w-2 translate-y-[2px] bg-slate-100/80 align-baseline animate-caret" />
          </div>
        </div>
      )
    }

    if (status === 'amanda') {
      return (
        <div className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-3 text-fuchsia-200">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <Lock className="h-4 w-4" />
            Agente Amanda autenticado. Aguardando parceiro.
          </div>
        </div>
      )
    }

    if (status === 'gabriel') {
      return (
        <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-cyan-100">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <Lock className="h-4 w-4" />
            Agente Gabriel autenticado. Aguardando parceiro.
          </div>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div
          key={shakeKey}
          className="animate-shake rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200"
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <AlertTriangle className="h-4 w-4" />
            CÓDIGO INVÁLIDO. TENTATIVA REGISTRADA.
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <Shield className="h-4 w-4 text-slate-200/80" />
          INSIRA AS DUAS CHAVES PARA INICIAR O PROTOCOLO
        </div>
      </div>
    )
  })()

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(56,189,248,0.16),transparent_60%),radial-gradient(40%_40%_at_12%_22%,rgba(232,121,249,0.16),transparent_60%),radial-gradient(50%_50%_at_88%_64%,rgba(34,197,94,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 mix-blend-soft-light">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.07),rgba(255,255,255,0.07)_1px,transparent_1px,transparent_4px)] animate-scanlines" />
      </div>

      <button
        type="button"
        onClick={() => setDebug((d) => !d)}
        className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200 backdrop-blur-md transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
        aria-label="Modo debug"
      >
        {debug ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-200">
                  <Shield className="h-4 w-4 text-emerald-300/80" />
                  AGÊNCIA SECRETA
                </div>
                <div className="text-xs font-semibold tracking-[0.22em] text-slate-400">ID 2025-004</div>
              </div>

              <h1 className="text-balance text-2xl font-semibold tracking-[0.18em] text-slate-100 sm:text-3xl">
                OPERAÇÃO NOITE FELIZ
              </h1>
              <p className="text-sm text-slate-300/90">
                Autenticação dupla necessária. Duas chaves, um único destino.
              </p>
            </header>

            <div className="grid gap-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-[0.28em] text-slate-300">
                 
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {Array.from({ length: 4 }).map((_, i) => {
                      const index = i
                      return (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          value={digits[index] ?? ''}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={(e) => handlePaste(index, e)}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          className="h-14 w-12 rounded-xl border border-fuchsia-400/25 bg-slate-950/35 text-center font-mono text-2xl text-fuchsia-100 shadow-[inset_0_0_0_1px_rgba(232,121,249,0.12)] outline-none backdrop-blur-md transition focus:border-fuchsia-300/60 focus:ring-2 focus:ring-fuchsia-400/30"
                          aria-label={`Dígito ${index + 1}`}
                        />
                      )
                    })}
                  </div>

                  <div className="mx-1 hidden h-12 w-px bg-white/10 sm:block" />

                  <div className="flex items-center gap-2 sm:gap-3">
                    {Array.from({ length: 4 }).map((_, i) => {
                      const index = i + 4
                      return (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          value={digits[index] ?? ''}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={(e) => handlePaste(index, e)}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          className="h-14 w-12 rounded-xl border border-cyan-300/25 bg-slate-950/35 text-center font-mono text-2xl text-cyan-50 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.12)] outline-none backdrop-blur-md transition focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-300/30"
                          aria-label={`Dígito ${index + 1}`}
                        />
                      )
                    })}
                  </div>
                </div>

                {debug ? (
                  <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 font-mono text-xs text-slate-200">
                    Senha correta: <span className="text-emerald-200">{CORRECT_CODE}</span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={validate}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="absolute -inset-y-6 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm animate-shine" />
                </span>
                <span className="relative flex items-center justify-between gap-4">
                  <span className="grid gap-1">
                    <span className="text-xs font-semibold tracking-[0.24em] text-slate-300">PROTOCOLO</span>
                    <span className="text-lg font-semibold tracking-[0.14em] text-slate-50">EXECUTAR PROTOCOLO</span>
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                    <Lock className="h-5 w-5" />
                  </span>
                </span>
              </button>

              {statusBlock}
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
              <span className="font-mono tracking-[0.18em]">CANAL: CRIPTOGRAFADO</span>
              <span className="font-mono tracking-[0.18em]">SESSÃO: {code.padEnd(8, '•')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

