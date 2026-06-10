import nodemailer from 'nodemailer'
import {User} from '../entities/User'
import {UserOnboarding} from '../entities/UserOnboading'
import {buildWelcomeEmailHtml} from '../templates/welcome-email.template'

const isEmailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)

if (!isEmailConfigured) {
  console.warn('[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — welcome emails will not be sent')
}

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null

export async function sendWelcomeEmail(user: User, onboarding: UserOnboarding): Promise<void> {
  if (!transporter) return

  const html = buildWelcomeEmailHtml({
    username: user.username,
    level: onboarding.level,
    studyPace: onboarding.studyPace,
    studyPreference: onboarding.studyPreference,
  })

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME ?? 'HajimeNihongo'}" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `Chào mừng đến với HajimeNihongo, ${user.username}! 🎌`,
    html,
  })

  console.log(`[email] Welcome email sent to ${user.email}`)
}
