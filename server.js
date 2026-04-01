import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Resend } from 'resend';

const app = new Hono();
const resend = new Resend(process.env.RESEND_API_KEY || 're_2CnmsTWH_7PWPQxLyYZhNEj4Zq6gLmL3R');

app.use('/*', cors({ origin: '*' }));

app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

app.post('/api/invite', async (c) => {
  const { to, name, role, brand, shop, budget, invitedBy, note } = await c.req.json();
  if (!to || !name || !role) return c.json({ error: 'to, name, and role are required' }, 400);

  const subject = `You've been invited to CVS — ${role} for ${brand}`;
  const html = `
    <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 22px; color: #161616; margin: 0 0 4px;">CVS — Cash Verification System</h1>
        <p style="font-size: 13px; color: #6f6f6f; margin: 0;">Simbisa Brands Ltd</p>
      </div>
      <div style="background: #e8f0fe; border-left: 4px solid #0f62fe; padding: 16px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #161616; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 13px; color: #525252; margin: 0 0 8px;">You've been invited by <strong>${invitedBy || 'an administrator'}</strong> to join CVS as a <strong>${role}</strong>${brand ? ` for <strong>${brand}</strong>` : ''}.</p>
        ${shop && shop !== 'N/A' ? `<p style="font-size: 13px; color: #525252; margin: 0;">Assigned shop: <strong>${shop}</strong></p>` : ''}
        ${budget ? `<p style="font-size: 13px; color: #525252; margin: 0;">Monthly budget: <strong>$${budget}</strong></p>` : ''}
      </div>
      ${note ? `<p style="font-size: 13px; color: #525252; margin: 0 0 20px; font-style: italic;">"${note}"</p>` : ''}
      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}" style="display: inline-block; background: #0f62fe; color: #fff; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Accept Invitation</a>
      </div>
      <p style="font-size: 12px; color: #8d8d8d; text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
        This link will expire in 48 hours. If you didn't expect this invitation, you can ignore this email.
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: 'CVS Simbisa <noreply@simbisa.co.zw>',
      to,
      subject,
      html,
    });
    return c.json({ ok: true, id: result.data?.id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/notify', async (c) => {
  const { to, title, message, type } = await c.req.json();
  if (!to || !title || !message) return c.json({ error: 'to, title, and message are required' }, 400);

  const colors = { info: '#0f62fe', success: '#24a148', warning: '#f1c21b', error: '#da1e28' };
  const html = `
    <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 16px;">
        <h1 style="font-size: 18px; color: #161616; margin: 0;">CVS Notification</h1>
      </div>
      <div style="background: #f4f4f4; border-left: 4px solid ${colors[type || 'info']}; padding: 16px; margin-bottom: 20px;">
        <p style="font-size: 15px; font-weight: 600; color: #161616; margin: 0 0 8px;">${title}</p>
        <p style="font-size: 13px; color: #525252; margin: 0;">${message}</p>
      </div>
      <p style="font-size: 12px; color: #8d8d8d; text-align: center; margin-top: 24px;">
        Simbisa Brands Ltd · Cash Verification System
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: 'CVS Simbisa <noreply@simbisa.co.zw>',
      to,
      subject: `CVS: ${title}`,
      html,
    });
    return c.json({ ok: true, id: result.data?.id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

const PORT = process.env.API_PORT || 3001;
serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`CVS API server running on http://localhost:${info.port}`);
});
