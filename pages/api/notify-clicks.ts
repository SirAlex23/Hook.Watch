// pages/api/notify-click.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend('TU_API_KEY_AQUI');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Supabase manda los datos en el body
  const { record } = req.body; 

  if (record && record.has_clicked === true) {
    try {
      await resend.emails.send({
        from: 'HOOK.WATCH <onboarding@resend.dev>',
        to: 'tu-email-de-admin@gmail.com', // Donde quieres recibir los soplos
        subject: `🚨 ¡VÍCTIMA CAÍDA!: ${record.target_name}`,
        html: `
          <div style="font-family:sans-serif; background:#0f1115; color:#fff; padding:40px; border-radius:20px;">
            <h1 style="color:#10b981;">¡ANZUELO MORDIDO!</h1>
            <p>La víctima <strong>${record.target_name}</strong> (${record.target_email}) acaba de pinchar en el enlace.</p>
            <p>Revisa el Dashboard para más detalles.</p>
            <hr style="border:none; border-top:1px solid #333; margin:20px 0;">
            <small style="color:#666;">HOOK.WATCH SECURITY SYSTEM</small>
          </div>
        `
      });
      return res.status(200).json({ sent: true });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
  return res.status(200).json({ message: 'No action needed' });
}