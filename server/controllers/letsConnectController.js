const LetsConnect = require('../models/LetsConnect');
const { sendNotificationEmail } = require('../lib/mailer');

exports.create = async (req, res) => {
  try {
    const { name, email, phone, bestTime, timezone } = req.body || {};
    if (!name || !email || !bestTime) return res.status(400).json({ error: 'Missing required fields' });
    const bt = bestTime ? new Date(bestTime) : null;
    const created = await LetsConnect.create({ name, email, phone: phone || '', bestTime: bt, timezone: timezone || 'ET' });

    // Send notification email
    try {
      await sendNotificationEmail({
        subject: 'New LetsConnect Submission',
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nBest Time: ${bestTime}\nTimezone: ${timezone || 'ET'}`,
        html: `<h2>New LetsConnect Submission</h2><p><b>Name:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Phone:</b> ${phone || ''}<br/><b>Best Time:</b> ${bestTime}<br/><b>Timezone:</b> ${timezone || 'ET'}</p>`
      });
    } catch (mailErr) {
      console.error('Failed to send letsconnect email:', mailErr);
    }

    res.status(201).json(created);
  } catch (e) {
    console.error('Create letsconnect error', e);
    res.status(500).json({ error: 'Failed to create letsconnect' });
  }
};

exports.list = async (req, res) => {
  try {
    const list = await LetsConnect.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error('List letsconnect error', e);
    res.status(500).json({ error: 'Failed to list letsconnect' });
  }
};
