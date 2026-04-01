import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_2CnmsTWH_7PWPQxLyYZhNEj4Zq6gLmL3R');

export async function sendInviteEmail({ to, name, role, brand, invitedBy }) {
  return resend.emails.send({
    from: 'CVS Simbisa <noreply@simbisa.co.zw>',
    to,
    subject: `You've been invited to CVS — ${role} for ${brand}`,
    html: `
      <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 22px; color: #161616; margin: 0 0 4px;">CVS — Cash Verification System</h1>
          <p style="font-size: 13px; color: #6f6f6f; margin: 0;">Simbisa Brands Ltd</p>
        </div>
        <div style="background: #e8f0fe; border-left: 4px solid #0f62fe; padding: 16px; margin-bottom: 20px;">
          <p style="font-size: 14px; color: #161616; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 13px; color: #525252; margin: 0;">You've been invited by <strong>${invitedBy}</strong> to join CVS as a <strong>${role}</strong> for <strong>${brand}</strong>.</p>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.APP_URL || 'http://localhost:5173'}" style="display: inline-block; background: #0f62fe; color: #fff; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Accept Invitation</a>
        </div>
        <p style="font-size: 12px; color: #8d8d8d; text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
          This link will expire in 48 hours. If you didn't expect this invitation, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendNotificationEmail({ to, title, message, type = 'info' }) {
  const colors = { info: '#0f62fe', success: '#24a148', warning: '#f1c21b', error: '#da1e28' };
  return resend.emails.send({
    from: 'CVS Simbisa <noreply@simbisa.co.zw>',
    to,
    subject: `CVS: ${title}`,
    html: `
      <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h1 style="font-size: 18px; color: #161616; margin: 0 0 16px;">CVS Notification</h1>
        <div style="background: #f4f4f4; border-left: 4px solid ${colors[type]}; padding: 16px; margin-bottom: 20px;">
          <p style="font-size: 15px; font-weight: 600; color: #161616; margin: 0 0 8px;">${title}</p>
          <p style="font-size: 13px; color: #525252; margin: 0;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #8d8d8d; text-align: center; margin-top: 24px;">
          Simbisa Brands Ltd · Cash Verification System
        </p>
      </div>
    `,
  });
}
