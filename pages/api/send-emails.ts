import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { to, targetName, companyName, template, link, adminEmail } = JSON.parse(req.body);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:  process.env.GMAIL_USER,
      pass:  process.env.GMAIL_APP_PASSWORD,
    }
  });

  try {
    let subject = "";
    let contentTitle = "";
    let contentBody = "";
    let buttonText = "";
    let bannerColor = "#2563eb"; 

    switch (template) {
      case 'SEGURIDAD':
        subject = `[Acción Requerida] Actividad de inicio de sesión inusual en ${companyName}`;
        bannerColor = "#dc2626";
        contentTitle = "Alerta de Seguridad";
        contentBody = `Se ha detectado un inicio de sesión desde una ubicación no reconocida. Si no ha sido usted, debe asegurar su cuenta de inmediato para evitar el bloqueo de acceso.`;
        buttonText = "Revisar Actividad Reciente";
        break;
      case 'FINANZAS':
        subject = `Factura Electrónica Pendiente - ${companyName}`;
        bannerColor = "#16a34a";
        contentTitle = "Nueva Factura Disponible";
        contentBody = `Tiene una nueva factura emitida por los servicios del mes actual. La fecha de vencimiento es en 24 horas para evitar recargos administrativos.`;
        buttonText = "Descargar Factura (PDF)";
        break;
      case 'RRHH':
        subject = `IMPORTANTE: Actualización de Políticas en ${companyName}`;
        bannerColor = "#7c3aed";
        contentTitle = "Comunicado Interno";
        contentBody = `Se han actualizado las políticas de teletrabajo y vacaciones para el año 2026. Es obligatorio que todos los empleados confirmen la recepción de este documento.`;
        buttonText = "Firmar Documento";
        break;
      default:
        subject = `Notificación del Sistema - ${companyName}`;
        contentTitle = "Aviso Pendiente";
        contentBody = `Tiene un mensaje importante en su bandeja de entrada corporativa que requiere su atención inmediata.`;
        buttonText = "Acceder al Portal";
        case 'IT_SUPPORT':
  subject = `[SOPORTE IT] Cambio de contraseña obligatorio para ${companyName}`;
  bannerColor = "#475569"; // Gris azulado (serio)
  contentTitle = "Acción Requerida: Seguridad IT";
  contentBody = `Nuestra política de seguridad requiere que actualice su contraseña cada 90 días. Su sesión actual caducará en 2 horas si no se realiza la validación de credenciales.`;
  buttonText = "Validar Mi Cuenta Ahora";
  break;
case 'BENEFICIOS':
  subject = `¡Enhorabuena! Has recibido un Bono de Recompensa - ${companyName}`;
  bannerColor = "#f59e0b"; // Ámbar/Oro (atractivo)
  contentTitle = "Reconocimiento al Empleado";
  contentBody = `Gracias a tu excelente desempeño este trimestre, se te ha asignado una tarjeta regalo electrónica. Haz clic abajo para canjear tu código y ver los detalles del beneficio.`;
  buttonText = "Canjear Mi Bono";
  break;
    }

    const htmlLayout = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color: ${bannerColor}; padding: 30px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">${companyName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin-top: 0; font-size: 20px;">${contentTitle}</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hola <strong>${targetName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">${contentBody}</p>
              <div style="text-align: center; margin-top: 40px;">
                <a href="${link}" style="background-color: ${bannerColor}; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">${buttonText}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 25px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
              Este es un mensaje automático generado por los sistemas de ${companyName}.<br>
              Por favor, no responda a este remitente. &copy; 2026 ${companyName} Corp.
            </td>
          </tr>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: `"${companyName} Support" <alejandrocrespocorrea@gmail.com>`,
      to: to,
      subject: subject,
      html: htmlLayout,
    });

    if (adminEmail) {
      await transporter.sendMail({
        from: '"HOOK.WATCH System" <alejandrocrespocorrea@gmail.com>',
        to: adminEmail,
        subject: `🚀 Ataque enviado: ${targetName}`,
        html: `<p>El sistema ha procesado el envío para <strong>${to}</strong> con la plantilla de <strong>${template}</strong>.</p>`
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el servidor de correo' });
  }
}



