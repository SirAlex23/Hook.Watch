import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg('DATOS NO REGISTRADOS O CONTRASEÑA INCORRECTA');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#16181d] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">
            HOOK.<span className="text-emerald-500">WATCH</span>
          </h1>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] mt-2">Bienvenido de nuevo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Email corporativo" 
              className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-emerald-500/50 focus:bg-white/[0.15] transition-all text-white placeholder:text-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input con Ojo de Visibilidad */}
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Contraseña" 
              className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-sm font-bold outline-none focus:border-emerald-500/50 focus:bg-white/[0.15] transition-all text-white placeholder:text-white/30"
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

          {/* Mensaje de Error con más contraste */}
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/40 py-3 rounded-xl text-center animate-pulse">
              <p className="text-[10px] font-black text-red-400 tracking-widest uppercase">{errorMsg}</p>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            {loading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <Link href="/register">
            <p className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">
              ¿No tienes cuenta aún? <span className="text-emerald-500 ml-1">Regístrate gratis</span>
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
