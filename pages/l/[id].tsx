import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Info, Lock } from 'lucide-react';

export default function Landing() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Registrar el clic en la base de datos
      supabase.from('operation_results').update({ has_clicked: true }).eq('id', id).then();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-[#16181d] border-2 border-red-500/30 rounded-[3rem] p-12 text-center shadow-2xl shadow-red-500/10">
        <div className="flex justify-center mb-8">
          <div className="bg-red-500/20 p-6 rounded-full animate-pulse">
            <ShieldAlert size={64} className="text-red-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white uppercase italic mb-4">¡HAS CAÍDO!</h1>
        <div className="bg-red-500 text-black text-[10px] font-black uppercase tracking-[0.3em] py-2 px-4 rounded-full inline-block mb-8">
          🚨 SIMULACIÓN DE ATAQUE ACTIVA
        </div>

        <div className="space-y-6 text-left mb-10">
          <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <Lock className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-white/70">Si esto fuera un ataque real, tus <strong>contraseñas</strong> y <strong>datos bancarios</strong> habrían sido comprometidos ahora mismo.</p>
          </div>
          <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-sm text-white/70">Nunca hagas clic en enlaces de correos que te metan prisa o pidan acciones urgentes sin verificar la fuente.</p>
          </div>
        </div>

        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic border-t border-white/5 pt-8">
          Campaña de concienciación por Hook.Watch Security
        </p>
      </div>
    </div>
  );
}

