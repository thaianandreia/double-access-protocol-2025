import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, AlertTriangle, ShieldCheck, Eye, EyeOff, Minus, Activity } from 'lucide-react';

export default function SecuritySystem() {
  const FIXED_CODE = "28461973";

  // Estado para armazenar os 8 dígitos
  const [inputs, setInputs] = useState(Array(8).fill(''));
  const [status, setStatus] = useState('locked'); // 'locked', 'success', 'error', 'partial_amanda', 'partial_gabriel'
  const [showDebug, setShowDebug] = useState(false);

  const inputRefs = useRef([]);

  // Inicializa o array de refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 8);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newInputs = [...inputs];
    newInputs[index] = value.slice(-1); 
    setInputs(newInputs);
    setStatus('locked');

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !inputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const checkAccess = () => {
    const inputString = inputs.join('');
    
    const amandaInput = inputString.slice(0, 4);
    const gabrielInput = inputString.slice(4, 8);
    
    const amandaSecret = FIXED_CODE.slice(0, 4);
    const gabrielSecret = FIXED_CODE.slice(4, 8);

    const isAmandaCorrect = amandaInput === amandaSecret;
    const isGabrielCorrect = gabrielInput === gabrielSecret;

    if (isAmandaCorrect && isGabrielCorrect) {
      setStatus('success');
    } else if (isAmandaCorrect && !isGabrielCorrect) {
      setStatus('partial_amanda');
    } else if (!isAmandaCorrect && isGabrielCorrect) {
      setStatus('partial_gabriel');
    } else {
      setStatus('error');
    }
  };

  const renderInput = (index, isAmanda) => {
    const isError = status === 'error';
    const isSuccess = status === 'success';

    let borderColor = isAmanda ? "border-pink-900/50" : "border-cyan-900/50";
    let focusColor = isAmanda 
      ? "focus:border-pink-500 focus:shadow-[0_0_20px_rgba(236,72,153,0.5)]" 
      : "focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.5)]";
    let textColor = isAmanda ? "text-pink-400" : "text-cyan-400";

    if (isError) {
      borderColor = "border-red-600";
      textColor = "text-red-500";
    }
    if (isSuccess) {
      borderColor = "border-green-500";
      textColor = "text-green-400";
    }

    return (
      <div key={index} className="flex flex-col items-center group relative">
        <input
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={inputs[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`
            w-10 h-14 sm:w-16 sm:h-20 
            text-center text-2xl sm:text-4xl font-mono font-bold
            bg-black/60 backdrop-blur-sm
            border-b-4 ${borderColor} ${textColor}
            rounded-t-lg
            transition-all duration-200
            outline-none
            ${focusColor}
            hover:bg-white/5
          `}
        />
        <div className={`h-px w-full ${isAmanda ? 'bg-pink-500/30' : 'bg-cyan-500/30'} mt-1 blur-sm`}></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden select-none text-white">
      
      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat"></div>
      
      {/* Background Ambientes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 sm:p-10 relative z-10 flex flex-col items-center ring-1 ring-white/10">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center gap-2 mb-8 w-full">
          <div className="flex items-start justify-between w-full border-b border-slate-700/50 pb-4 mb-6">
             <div className="flex flex-col items-start gap-1">
               <div className="flex items-center gap-2 text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase">
                 <Activity size={12} className="text-slate-600 animate-pulse" />
                 <span>AGÊNCIA SECRETA</span>
               </div>
               <h1 className="text-white font-black tracking-widest uppercase text-lg sm:text-2xl drop-shadow-lg leading-tight">
                 OPERAÇÃO NOITE FELIZ
               </h1>
             </div>
             
             <div className="text-slate-500 text-xs font-mono tracking-widest pt-1 flex flex-col items-end">
               <span className="text-[10px] opacity-50">ACCESS ID</span>
               <span>2025-004</span>
             </div>
          </div>

          <div className="relative mb-2">
            <div className={`absolute inset-0 blur-xl opacity-50 ${status === 'success' ? 'bg-green-500' : 'bg-blue-600'}`}></div>
            <div className={`relative p-4 rounded-full border-2 ${status === 'success' ? 'bg-slate-900 border-green-500 text-green-400' : 'bg-slate-900 border-slate-600 text-slate-200'}`}>
              {status === 'success' ? <Unlock size={32} /> : <Lock size={32} />}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-slate-400 text-xs tracking-[0.3em] font-medium pt-1 uppercase">
              Protocolo de Acesso Duplo
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-12 mb-10 p-4 rounded-xl bg-black/20 border border-white/5">
          <div className="flex gap-2 sm:gap-4 relative pt-4">
            {[0, 1, 2, 3].map(i => renderInput(i, true))}
          </div>

          <div className="hidden md:flex items-center pb-8 text-slate-600">
            <Minus size={32} strokeWidth={4} className="opacity-50" />
          </div>
          {/* Separador Mobile */}
          <div className="flex md:hidden w-full h-px bg-slate-700/50 my-2"></div>

          <div className="flex gap-2 sm:gap-4 relative pt-4">
            {[4, 5, 6, 7].map(i => renderInput(i, false))}
          </div>
        </div>

        {/* Feedback */}
        <div className="min-h-[140px] w-full flex items-center justify-center mb-8 px-4">
          {status === 'locked' && (
            <p className="text-slate-500 text-sm font-mono animate-pulse flex items-center gap-2 text-center">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-ping"></span>
              AGUARDANDO INPUT DOS AGENTES...
            </p>
          )}

          {status === 'error' && (
            <div className="bg-red-950/40 border border-red-500/30 p-4 rounded bg-grid-pattern relative overflow-hidden flex items-center gap-4 max-w-lg animate-shake">
              <div className="h-full w-1 absolute left-0 top-0 bg-red-600"></div>
              <AlertTriangle className="text-red-500 shrink-0 h-8 w-8" />
              <div>
                <h4 className="text-red-400 font-bold text-sm tracking-wider mb-1">ERRO DE SINCRONIZAÇÃO</h4>
                <p className="text-red-200 text-xs opacity-80">As chaves de acesso não conferem.</p>
              </div>
            </div>
          )}

          {(status === 'partial_amanda' || status === 'partial_gabriel') && (
            <div className={`
              ${status === 'partial_amanda' ? 'bg-pink-950/30 border-pink-500/30' : 'bg-cyan-950/30 border-cyan-500/30'}
              border p-4 rounded relative overflow-hidden flex items-start gap-4 max-w-lg
            `}>
              <div className="bg-slate-900 p-2 rounded-full border border-white/10">
                <ShieldCheck className={status === 'partial_amanda' ? 'text-pink-400' : 'text-cyan-400'} size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wider mb-1">
                  AUTENTICAÇÃO PARCIAL
                </h4>
                <p className="text-slate-300 text-sm">
                  Agente <strong className={status === 'partial_amanda' ? 'text-pink-400' : 'text-cyan-400'}>
                    {status === 'partial_amanda' ? 'Amanda' : 'Gabriel'}
                  </strong> autenticado. Aguardando parceiro.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-500/10 border border-green-500/40 p-6 rounded-lg w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan"></div>
              <h3 className="text-green-400 font-black text-2xl mb-4 tracking-widest flex items-center justify-center gap-2">
                ACESSO CONCEDIDO
              </h3>
              <div className="bg-black/40 p-4 rounded border border-green-900/50 inline-block">
                <p className="text-white text-lg sm:text-xl font-mono typing-effect leading-relaxed">
                  "casa da sanja, cozinha, gaveta, em baixo dos panos de prato"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botão */}
        <button
          onClick={checkAccess}
          disabled={status === 'success'}
          className={`
            w-full max-w-sm py-4 rounded font-bold text-sm tracking-[0.2em] transition-all duration-300 uppercase
            relative overflow-hidden group
            ${status === 'success' 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-slate-100 text-slate-900 hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'}
          `}
        >
          {status !== 'success' && (
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-shine skew-x-[-20deg]"></div>
          )}
          {status === 'success' ? 'SISTEMA ABERTO' : 'EXECUTAR PROTOCOLO'}
        </button>
      
      </div>

      {/* Debug Tool */}
      <div className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="text-slate-600 hover:text-slate-400 p-2"
          title="Modo Desenvolvedor"
        >
          <Eye size={14}/>
        </button>
      </div>

      {showDebug && (
        <div className="fixed bottom-12 right-4 bg-slate-900/90 text-[10px] text-green-400 p-3 rounded border border-slate-700 font-mono shadow-xl backdrop-blur">
          <p className="text-slate-400 font-bold mb-1">DEV_MODE</p>
          <p>CODE: <span className="text-white tracking-widest">{FIXED_CODE}</span></p>
        </div>
      )}
    </div>
  );
}
