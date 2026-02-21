import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Lock, UserPlus, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    // Registro en Supabase
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMsg({ type: 'error', text: 'ERROR AL CREAR LA CUENTA' });
      setLoading(false);
    } else {
      setMsg({ type: 'success', text: 'CUENTA CREADA... ACCEDIENDO' });
      
      // Animación de entrada directa al Dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#16181d] border border-white/5 rounded-[3rem] p-10 shadow-2xl relative">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            HOOK.<span className="text-emerald-500">WATCH</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-2">Crea tu cuenta profesional</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="email" 
              placeholder="Email corporativo" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Contraseña (mín. 6 caracteres)" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors p-1"
>
  {showPassword ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
</button>
          </div>

          {msg.text && (
            <div className={`py-3 rounded-xl text-center border flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-300 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              {msg.type === 'success' ? (
                <Loader2 size={16} className="text-emerald-500 animate-spin" />
              ) : (
                <CheckCircle2 size={14} className="text-red-500" />
              )}
              <p className={`text-[9px] font-black tracking-widest uppercase ${msg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                {msg.text}
              </p>
            </div>
          )}

          <button 
            disabled={loading || msg.type === 'success'}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading && msg.type !== 'success' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                REGISTRARSE
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <Link href="/login">
            <p className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">
              ¿Ya tienes cuenta? <span className="text-emerald-500">Inicia sesión</span>
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}


