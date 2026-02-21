import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { 
  Shield, Target, AlertTriangle, ChevronRight, X, 
  Settings as SettingsIcon, MousePointer2, Trash2,
  Mail, CheckCircle2, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [operations, setOperations] = useState<any[]>([]);
  const [selectedOp, setSelectedOp] = useState<any>(null);
  const [opDetails, setOpDetails] = useState<any[]>([]);
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [attackSelection, setAttackSelection] = useState<'PHISHING' | 'ALEATORIO' | null>(null);
  const [loading, setLoading] = useState(false);
  const [victimCount, setVictimCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOperations();
      fetchVictimCount();
      const sub = supabase.channel('any').on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'operation_results',
        filter: `user_id=eq.${userId}` 
      }, () => {
        if (selectedOp) fetchDetails(selectedOp.id);
        fetchOperations();
      }).subscribe();
      return () => { supabase.removeChannel(sub); };
    }
  }, [userId, selectedOp]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUserId(user.id);
    }
  };

  const fetchOperations = async () => {
    const { data } = await supabase.from('operations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setOperations(data || []);
  };

  const fetchVictimCount = async () => {
    const { count } = await supabase.from('targets').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    setVictimCount(count || 0);
  };

  const fetchDetails = async (opId: string) => {
    const { data } = await supabase.from('operation_results').select('*').eq('operation_id', opId).eq('user_id', userId);
    setOpDetails(data || []);
  };

  const launchAttack = async () => {
    if (!attackSelection || !userId) return;
    setLoading(true);
    
    const config = JSON.parse(localStorage.getItem('hook_config') || '{}');
    
    let strategy = "";
    if (attackSelection === 'ALEATORIO') {
      const templates = ['SEGURIDAD', 'FINANZAS', 'LOGISTICA', 'RRHH', 'IT_SUPPORT', 'BENEFICIOS'];
      strategy = templates[Math.floor(Math.random() * templates.length)];
    } else {
      strategy = config.emailTpl || 'SEGURIDAD';
    }
    
    const { data: op } = await supabase.from('operations').insert([{
      type: 'PHISHING',
      strategy: strategy,
      status: 'ACTIVA',
      user_id: userId
    }]).select().single();

    if (op) {
      const { data: victims } = await supabase.from('targets').select('*').eq('user_id', userId);
      if (victims && victims.length > 0) {
        for (const v of victims) {
          const { data: res } = await supabase.from('operation_results').insert([{
            operation_id: op.id,
            target_name: v.name,
            target_email: v.email,
            user_id: userId
          }]).select().single();

          await fetch('/api/send-emails', {
            method: 'POST',
            body: JSON.stringify({
              to: v.email,
              targetName: v.name,
              companyName: config.companyName || 'Empresa Privada',
              template: strategy,
              link: `${window.location.origin}/l/${res.id}`,
              adminEmail: config.adminEmail
            })
          });
        }
      }
    }

    setAttackSelection(null);
    setIsCampaignMode(false);
    fetchOperations();
    setLoading(false);
  };

  const deleteOp = async (id: string) => {
    await supabase.from('operations').delete().eq('id', id).eq('user_id', userId);
    fetchOperations();
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-2 rounded-lg text-black font-black italic">HW</div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">HOOK.WATCH | Dashboard</h1>
          </div>
          <Link href="/settings">
            <button className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 group">
              <SettingsIcon size={18} className="text-emerald-500 group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ajustes</span>
            </button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Riesgo Humano" value="64%" icon={<AlertTriangle className="text-red-500" />} />
          <StatCard title="Objetivos" value={victimCount} icon={<Target className="text-blue-500" />} />
          <StatCard title="Eventos" value={opDetails.filter(d => d.has_clicked).length} icon={<MousePointer2 className="text-emerald-500" />} />
          <StatCard title="Campañas" value={operations.length} icon={<Shield className="text-purple-500" />} />
        </div>

        <section className="bg-[#16181d] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Registro de Operaciones</h2>
            <button 
              onClick={() => setIsCampaignMode(!isCampaignMode)} 
              className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isCampaignMode ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
            >
              {isCampaignMode ? 'Cancelar' : '+ Nueva Campaña'}
            </button>
          </div>

          <div className="p-4 space-y-3">
            <AnimatePresence>
              {isCampaignMode && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/5 pb-6 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2">
                    
                    <button onClick={() => setAttackSelection('PHISHING')} className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${attackSelection === 'PHISHING' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                      <div className="flex items-center gap-4">
                        <Mail className={attackSelection === 'PHISHING' ? 'text-emerald-500' : 'text-white/20'} size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Email Attack</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${attackSelection === 'PHISHING' ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/10'}`}>
                        {attackSelection === 'PHISHING' && <CheckCircle2 size={14}/>}
                      </div>
                    </button>

                    <button onClick={() => setAttackSelection('ALEATORIO')} className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${attackSelection === 'ALEATORIO' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                      <div className="flex items-center gap-4">
                        <Zap className={attackSelection === 'ALEATORIO' ? 'text-purple-500' : 'text-white/20'} size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Modo Aleatorio</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${attackSelection === 'ALEATORIO' ? 'border-purple-500 bg-purple-500 text-black' : 'border-white/10'}`}>
                        {attackSelection === 'ALEATORIO' && <CheckCircle2 size={14}/>}
                      </div>
                    </button>

                    <button onClick={launchAttack} disabled={!attackSelection || loading} className={`p-6 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all ${attackSelection ? 'bg-emerald-500 text-black shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}>
                      {loading ? 'Ejecutando...' : 'Confirmar Ataque'}
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {operations.map(op => (
                <div key={op.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-6">
                     <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <Mail size={18}/>
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase italic tracking-tighter">{op.type} - {op.strategy}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Lanzado: {new Date(op.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => deleteOp(op.id)} className="p-3 text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <button 
                      onClick={() => { setSelectedOp(op); fetchDetails(op.id); }}
                      className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl hover:bg-emerald-500 hover:text-black transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedOp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#16181d] border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl">
              <button onClick={() => setSelectedOp(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><X size={24}/></button>
              <div className="mb-10 text-center">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">Monitorización</h3>
                <h2 className="text-3xl font-black uppercase italic">{selectedOp.strategy}</h2>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {opDetails.map((res: any) => (
                  <div key={res.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className={res.has_clicked ? 'text-red-500 animate-pulse' : 'text-white/20'}><MousePointer2 size={18}/></div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tighter">{res.target_name}</p>
                        <p className="text-[10px] font-bold text-white/40">{res.target_email}</p>
                      </div>
                    </div>
                    {res.has_clicked ? (
                      <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20">🚨 CAÍDO</span>
                    ) : (
                      <span className="text-[9px] font-black text-white/10 uppercase tracking-widest italic">Activo</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-[#16181d] border border-white/5 p-8 rounded-[2.5rem] group hover:border-white/10 transition-all">
      <div className="mb-4 bg-white/5 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-black italic tracking-tighter">{value}</p>
    </div>
  );
}