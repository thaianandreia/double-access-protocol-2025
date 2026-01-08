import { AlertTriangle, Lock, Shield } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'

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
  const [typed, setTyped] = useState('')
  const [sessionTag] = useState(() => {
    const time = (Date.now() % 1_000_000_000).toString().padStart(9, '0')
    const noise = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, '0')
    return `${time}${noise}`
  })

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
    const correctLeft = '2846'
    const correctRight = '1973'

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
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em]">
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
        <div className="rounded-2xl border border-pink-400/30 bg-pink-400/10 px-4 py-3 text-pink-200 shadow-[0_0_0_1px_rgba(244,114,182,0.10)]">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <Lock className="h-4 w-4" />
            Agente Amanda autenticado. Aguardando parceiro.
          </div>
        </div>
      )
    }

    if (status === 'gabriel') {
      return (
        <div className="rounded-2xl border border-blue-300/30 bg-blue-300/10 px-4 py-3 text-blue-100 shadow-[0_0_0_1px_rgba(125,211,252,0.10)]">
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
          className="animate-shake rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.10)]"
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-mono text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(14,165,233,0.20),transparent_60%),radial-gradient(40%_40%_at_12%_22%,rgba(236,72,153,0.18),transparent_60%),radial-gradient(50%_50%_at_88%_64%,rgba(56,189,248,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(148,163,184,0.10),rgba(148,163,184,0.10)_1px,transparent_1px,transparent_4px)] animate-scanlines" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-55 mix-blend-soft-light">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.0),rgba(15,23,42,0.6)),repeating-linear-gradient(to_right,rgba(56,189,248,0.10),rgba(56,189,248,0.10)_1px,transparent_1px,transparent_80px),repeating-linear-gradient(to_bottom,rgba(236,72,153,0.10),rgba(236,72,153,0.10)_1px,transparent_1px,transparent_80px)] animate-gridPan" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_60%_30%,rgba(255,255,255,0.05),transparent_35%)] blur-[1px] animate-grainDrift" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-12">
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-[linear-gradient(120deg,rgba(236,72,153,0.18),transparent_35%,rgba(56,189,248,0.18))] opacity-80 blur-[10px]" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10" />
          <div className="pointer-events-none absolute left-3 top-3 h-6 w-6 rounded-tl-2xl border-l border-t border-white/25" />
          <div className="pointer-events-none absolute right-3 top-3 h-6 w-6 rounded-tr-2xl border-r border-t border-white/25" />
          <div className="pointer-events-none absolute left-3 bottom-3 h-6 w-6 rounded-bl-2xl border-b border-l border-white/25" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 rounded-br-2xl border-b border-r border-white/25" />

          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-200">
                  <Shield className="h-4 w-4 text-blue-200/80" />
                  AGÊNCIA SECRETA
                </div>
                <div className="text-xs font-semibold tracking-[0.22em] text-slate-400">ID 2025-004</div>
              </div>

              <h1 className="text-balance text-2xl font-semibold tracking-[0.22em] text-slate-100 sm:text-3xl">
                OPERAÇÃO NOITE FELIZ
              </h1>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300/90">Autenticação dupla necessária. Duas chaves, um único destino.</p>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 font-mono text-[11px] tracking-[0.22em] text-slate-300/90 animate-hudFlicker">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300/80 shadow-[0_0_18px_rgba(56,189,248,0.7)] animate-glowPulse" />
                  LINK ATIVO
                </div>
              </div>
            </header>

            <div className="grid gap-4">
              <div className="grid gap-3">
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
                          className="h-14 w-12 rounded-xl border border-pink-400/25 bg-slate-950/35 text-center font-mono text-2xl text-pink-100 shadow-[inset_0_0_0_1px_rgba(244,114,182,0.14),inset_0_-12px_22px_rgba(244,114,182,0.08)] outline-none backdrop-blur-md transition focus:border-pink-300/70 focus:ring-2 focus:ring-pink-400/30"
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
                          className="h-14 w-12 rounded-xl border border-blue-300/25 bg-slate-950/35 text-center font-mono text-2xl text-blue-50 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.14),inset_0_-12px_22px_rgba(56,189,248,0.08)] outline-none backdrop-blur-md transition focus:border-blue-200/80 focus:ring-2 focus:ring-blue-300/30"
                          aria-label={`Dígito ${index + 1}`}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={validate}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500/15 via-slate-950/15 to-blue-400/15 px-5 py-4 text-left  shadow-slate-900 shadow-md hover:shadow-lg hover:shadow-slate-900 backdrop-blur-xl transition  hover:bg-slate-200/10 active:translate-y-[1px] focus:outline-none "
              >
                <span className="pointer-events-none absolute inset-0 opacity-70">
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                </span>
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="absolute -inset-y-6 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm animate-shine" />
                </span>
                <span className="relative flex items-center justify-between gap-4">
                  <span className="grid gap-1">
                    <span className="text-[11px] font-semibold tracking-[0.28em] text-slate-200/80">PROTOCOLO</span>
                    <span className="text-lg font-semibold tracking-[0.18em] text-slate-50">EXECUTAR PROTOCOLO</span>
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-blue-200/25 bg-blue-300/10 text-blue-50 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.10)]">
                    <Lock className="h-5 w-5" />
                  </span>
                </span>
              </button>

              {statusBlock}
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
              <span className="font-mono tracking-[0.18em]">CANAL: CRIPTOGRAFADO</span>
              <span className="font-mono tracking-[0.18em]">SESSÃO: {sessionTag}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

