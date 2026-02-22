import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login'); 
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white/20 text-xs uppercase tracking-widest animate-pulse">
        Cargando Hook.Watch...
      </p>
    </div>
  );
}
