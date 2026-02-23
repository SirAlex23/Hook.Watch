import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // Parseo del cuerpo de la petición
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { to, targetName, companyName, template, link, adminEmail, userId } = body;

  try {
    // 1. BUSCAR CREDENCIALES DINÁMICAS EN SUPABASE
    const { data: settings, error: dbError } = await supabase
      .from('user_settings')
      .select('gmail_user, gmail_app_password')
      .eq('user_id', userId)
      .single();

    if (dbError || !settings) {
      console.log("⚠️ No se hallaron settings en DB para este usuario.");
    }

    // Prioridad: Datos de la DB > Datos enviados del Dashboard > Backup .env
    const senderEmail = settings?.gmail_user || adminEmail;
    const password = settings?.gmail_app_password || process.env.GMAIL_APP_PASSWORD;

    // Log para verificar en terminal que no hay espacios y la cuenta es correcta
    console.log(`--- SMTP DEBUG ---`);
    console.log(`Auth User: ${senderEmail}`);
    console.log(`Pass Length: ${password?.length || 0}`);
    console.log(`------------------`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: password,
      }
    });

    // 2. VARIABLES DE PLANTILLA CON TEXTOS AMPLIADOS (MÁS CREDIBILIDAD)
    let subject = "";
    let contentTitle = "";
    let contentBody = "";
    let buttonText = "";
    let bannerColor = "#2563eb"; 

    switch (template) {
      case 'LOGISTICA':
        subject = `⚠️ ACCIÓN REQUERIDA: Envío retenido en centro logístico - Ref: ${Math.random().toString(36).substring(7).toUpperCase()}`;
        bannerColor = "#f97316";
        contentTitle = "Incidencia en la Entrega";
        contentBody = `Le informamos que su envío no ha podido ser entregado en la fecha prevista debido a una discrepancia en los datos de facturación de las tasas de aduana. Para evitar el retorno del paquete al remitente original, es imperativo que verifique su dirección y abone la tasa de gestión (1.99€) antes de las próximas 24 horas.`;
        buttonText = "Gestionar Entrega del Paquete";
        break;
      case 'SEGURIDAD':
        subject = `🚨 ALERTA: Intento de acceso no autorizado detectado en su cuenta`;
        bannerColor = "#dc2626";
        contentTitle = "Aviso de Seguridad Crítico";
        contentBody = `Nuestros sistemas han detectado un intento de inicio de sesión sospechoso desde una dirección IP no reconocida (Moscú, RU). Por su seguridad, hemos restringido temporalmente el acceso a ciertas funciones de su cuenta. Si no ha sido usted, debe realizar la verificación de identidad de inmediato para asegurar su información personal.`;
        buttonText = "Verificar Mi Identidad Ahora";
        break;
      case 'FINANZAS':
        subject = `Factura Pendiente de Pago: ${Math.floor(Math.random() * 90000 + 10000)} - Vencimiento Inmediato`;
        bannerColor = "#16a34a";
        contentTitle = "Recordatorio de Facturación";
        contentBody = `Le recordamos que el plazo de pago para la última factura emitida por los servicios del trimestre ha expirado. Para evitar la suspensión de los servicios activos y cargos por demora en la siguiente liquidación, acceda al portal de clientes para descargar el comprobante y formalizar el pago de inmediato.`;
        buttonText = "Acceder a Mis Facturas";
        break;
      case 'RRHH':
        subject = `📝 Acción Necesaria: Revisión obligatoria del nuevo convenio laboral`;
        bannerColor = "#7c3aed";
        contentTitle = "Departamento de Recursos Humanos";
        contentBody = `Como parte del proceso de actualización anual, se han modificado las cláusulas relativas al teletrabajo y los beneficios sociales. De acuerdo con la normativa vigente, es obligatorio que todos los empleados firmen digitalmente el acuse de recibo de esta actualización antes de la fecha de cierre de nómina de este mes.`;
        buttonText = "Firmar Documentación";
        break;
      case 'IT_SUPPORT':
        subject = `⚠️ IMPORTANTE: Caducidad de credenciales corporativas en 2 horas`;
        bannerColor = "#475569";
        contentTitle = "Servicios de Tecnología (IT)";
        contentBody = `Su contraseña de red corporativa expirará hoy según la política de seguridad periódica de la empresa. Para mantener el acceso al correo y a las carpetas compartidas, debe actualizar sus credenciales a través del portal de autoservicio. De lo contrario, su cuenta será bloqueada automáticamente por el administrador del sistema.`;
        buttonText = "Actualizar Contraseña Ahora";
        break;
      default:
        subject = `Notificación Prioritaria - ${companyName}`;
        contentTitle = "Aviso Pendiente";
        contentBody = `Tiene una comunicación oficial pendiente de lectura en su bandeja de entrada corporativa. Debido a la naturaleza de la información, se requiere su confirmación de lectura antes del fin de la jornada laboral actual para evitar incidencias administrativas.`;
        buttonText = "Acceder al Mensaje";
        break;
    }

    // 3. DISEÑO HTML ROBUSTO (Anti-rotura para móvil)
    const htmlLayout = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <tr><td style="background-color: ${bannerColor}; padding: 30px; text-align: center; color: #ffffff;"><h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">${companyName}</h1></td></tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin-top: 0; font-size: 18px;">${contentTitle}</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">Estimado/a <strong>${targetName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">${contentBody}</p>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px;">
                <tr>
                  <td align="center">
                    <a href="${link}" style="background-color: ${bannerColor}; color: #ffffff; padding: 18px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; white-space: nowrap;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr><td style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb;">Este es un mensaje generado automáticamente por los sistemas de ${companyName}.<br>Por favor, no responda a este correo. &copy; 2026 ${companyName} Corp.</td></tr>
        </table>
      </div>
    `;

    // 4. ENVÍO A LA VÍCTIMA
    await transporter.sendMail({
      from: `"${companyName} Support" <${senderEmail}>`,
      to: to,
      subject: subject,
      html: htmlLayout,
    });

    // 5. AVISO DE CONFIRMACIÓN AL ATACANTE
    await transporter.sendMail({
      from: `"HOOK.WATCH System" <${senderEmail}>`,
      to: senderEmail,
      subject: `🚀 Ataque enviado con éxito: ${targetName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">¡Operación Confirmada!</h2>
          <p>Se ha enviado correctamente el ataque de <strong>${template}</strong> a la dirección <strong>${to}</strong>.</p>
          <p>Monitorice su <strong>Dashboard</strong> en <strong>Hook.Watch</strong> para realizar un seguimiento de su ataque.</p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("❌ ERROR SMTP:", error.message);
    return res.status(500).json({ error: 'Error en el servidor de correo: ' + error.message });
  }
}
