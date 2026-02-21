import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { 
  Fish, Target, Zap, Plus, ShieldAlert, BarChart3, X, ChevronRight, Settings as SettingsIcon, Mail, Send, HelpCircle, Trash2, ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [stats, setStats] = useState({ targets: 0, events: 0, campaigns: 0 });
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ESTADO PARA LA SELECCIÓN DEL MODAL
  const [selectedAttack, setSelectedAttack] = useState<'email' | 'sms' | 'random'>('email');
  const [activeConfig, setActiveConfig] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hook_config');
    if (saved) setActiveConfig(JSON.parse(saved));
    fetchData();
  }, []);

  const fetchData = async () => {
    const { count: tCount } = await supabase.from('targets').select('*', { count: 'exact', head: true });
    const { count: eCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
    const { count: cCount } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
    setStats({ targets: tCount || 0, events: eCount || 0, campaigns: cCount || 0 });

    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    setCampaignsList(data || []);
  };

  const deleteCampaign = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('campaigns').delete().eq('id', id);
    fetchData();
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se lanzaría el ataque con el tipo 'selectedAttack'
    await supabase.from('campaigns').insert([{ created_at: new Date() }]);
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <Head><title>HOOK.WATCH | Dashboard</title></Head>

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-xl">
                <Fish className="text-black w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">HOOK.WATCH</h1>
            </div>
            <Link href="/settings" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-emerald-400 border border-white/5">
              <SettingsIcon size={20} />
            </Link>
          </div>
          
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
            + NUEVA CAMPAÑA
          </button>
        </header>

        <main>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
            <StatCard icon={<ShieldAlert />} label="RIESGO HUMANO" value="64%" color="text-orange-400" />
            <StatCard icon={<Target />} label="OBJETIVOS" value={stats.targets.toString()} color="text-blue-400" />
            <StatCard icon={<Zap />} label="EVENTOS" value={stats.events.toString()} color="text-emerald-400" />
            <StatCard icon={<BarChart3 />} label="CAMPAÑAS" value={stats.campaigns.toString()} color="text-purple-400" />
          </div>

          <div className="bg-[#0D0D0D] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Registro de Operaciones</h2>
              <span className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase">Live Feed</span>
            </div>

            <div className="divide-y divide-white/5">
              {campaignsList.length === 0 ? (
                <div className="p-20 text-center text-white/20 text-xs font-medium uppercase tracking-widest">Esperando datos...</div>
              ) : (
                campaignsList.map((campaign, idx) => (
                  <div key={campaign.id} className="p-6 flex items-center justify-between hover:bg-white/[0.03] transition-all group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-all text-emerald-500">
                        {idx % 2 === 0 ? <span className="font-black text-lg italic">M</span> : <Send size={20} className="text-blue-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight text-white/90">
                          {idx % 2 === 0 ? 'PHISHING EMAIL' : 'SMISHING SMS'}
                        </p>
                        <p className="text-[10px] text-white/30 font-bold uppercase mt-1 italic">Ejecutado • {new Date(campaign.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={(e) => deleteCampaign(campaign.id, e)} className="p-2 text-white/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight className="text-white/10 group-hover:text-emerald-500 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL INTERACTIVO */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-white/10 rounded-t-[3rem] p-10 z-50 md:max-w-xl md:mx-auto md:bottom-12 md:rounded-[3rem] md:border">
              
              {/* FLECHA VOLVER */}
              <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
              </button>

              <h2 className="text-2xl font-black mb-8 tracking-tighter uppercase italic text-emerald-500">Preparar Envío</h2>
              
              <div className="space-y-3 mb-10">
                <button 
                  onClick={() => setSelectedAttack('email')}
                  className={`w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedAttack === 'email' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/90">Ataque por phishing email</p>
                    <p className="text-[10px] text-white/30 font-bold mt-1 uppercase italic">{activeConfig?.emailTpl || 'Aleatorio'}</p>
                  </div>
                  <Mail size={18} className={selectedAttack === 'email' ? 'text-emerald-500' : 'text-white/20'} />
                </button>

                <button 
                  onClick={() => setSelectedAttack('sms')}
                  className={`w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedAttack === 'sms' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/90">Ataque por smishing SMS</p>
                    <p className="text-[10px] text-white/30 font-bold mt-1 uppercase italic">{activeConfig?.smsTpl || 'Aleatorio'}</p>
                  </div>
                  <Send size={18} className={selectedAttack === 'sms' ? 'text-emerald-500' : 'text-white/20'} />
                </button>

                <button 
                  onClick={() => setSelectedAttack('random')}
                  className={`w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedAttack === 'random' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/90">Modo Aleatorio</p>
                    <p className="text-[10px] text-white/30 font-bold mt-1 uppercase italic">El sistema elegirá por ti</p>
                  </div>
                  <HelpCircle size={18} className={selectedAttack === 'random' ? 'text-emerald-500' : 'text-white/20'} />
                </button>
              </div>

              <button onClick={handleCreateCampaign} className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                Confirmar Lanzamiento
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-[#0D0D0D] border border-white/10 p-6 rounded-[2rem] hover:border-white/30 transition-all group">
      <div className={`mb-4 text-sm font-bold ${color} opacity-80`}>{icon}</div>
      <p className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter italic">{value}</p>
    </div>
  );
}
