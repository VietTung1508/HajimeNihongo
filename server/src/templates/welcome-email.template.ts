import {LevelEnum, StudyPaceEnum, StudyPreferenceEnum} from '../enums/onboarding.enum'

interface WelcomeEmailData {
  username: string
  level: LevelEnum
  studyPace: StudyPaceEnum
  studyPreference: StudyPreferenceEnum
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function resolveClientUrl(): string {
  const raw = process.env.CLIENT_URL ?? 'http://localhost:3000'
  try {
    const parsed = new URL(raw)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
    return parsed.origin
  } catch {
    console.warn('[email] CLIENT_URL invalid, falling back to localhost')
    return 'http://localhost:3000'
  }
}

const CLIENT_URL = resolveClientUrl()

const levelLabels: Record<LevelEnum, string> = {
  [LevelEnum.ZERO]: 'Chưa xác định',
  [LevelEnum.N5]: 'N5 — Sơ cấp',
  [LevelEnum.N4]: 'N4 — Sơ trung cấp',
  [LevelEnum.N3]: 'N3 — Trung cấp',
  [LevelEnum.N2]: 'N2 — Cao cấp',
  [LevelEnum.N1]: 'N1 — Thành thạo',
}

const studyPaceLabels: Record<StudyPaceEnum, string> = {
  [StudyPaceEnum.RELAX]: 'Thư giãn',
  [StudyPaceEnum.DETERMINED]: 'Quyết tâm',
  [StudyPaceEnum.RIGOROUS]: 'Chuyên sâu',
}

const studyPreferenceLabels: Record<StudyPreferenceEnum, string> = {
  [StudyPreferenceEnum.GRAMMAR]: 'Ngữ pháp',
  [StudyPreferenceEnum.VOCABULARY]: 'Từ vựng',
  [StudyPreferenceEnum.BOTH]: 'Cả hai',
}

export function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
  const safeUsername = escapeHtml(data.username)

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chào mừng đến với HajimeNihongo</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#c0392b;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:2px;">はじめ日本語</h1>
            <p style="margin:8px 0 0;color:#f8d7d7;font-size:14px;">HajimeNihongo — Bắt đầu học tiếng Nhật</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#2c2c2c;font-size:22px;">Chào mừng, ${safeUsername}! 🎌</h2>
            <p style="margin:0 0 24px;color:#555;line-height:1.6;font-size:15px;">
              Cảm ơn bạn đã tham gia <strong>HajimeNihongo</strong>. Hành trình chinh phục tiếng Nhật của bạn bắt đầu từ hôm nay!
            </p>
            <!-- Onboarding Summary -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f6;border:1px solid #f0d0d0;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;color:#c0392b;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Thông tin học tập của bạn</p>
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color:#888;font-size:14px;width:140px;">Trình độ mục tiêu</td>
                    <td style="color:#2c2c2c;font-size:14px;font-weight:600;">${levelLabels[data.level] ?? data.level}</td>
                  </tr>
                  <tr>
                    <td style="color:#888;font-size:14px;">Tốc độ học</td>
                    <td style="color:#2c2c2c;font-size:14px;font-weight:600;">${studyPaceLabels[data.studyPace] ?? data.studyPace}</td>
                  </tr>
                  <tr>
                    <td style="color:#888;font-size:14px;">Ưu tiên học</td>
                    <td style="color:#2c2c2c;font-size:14px;font-weight:600;">${studyPreferenceLabels[data.studyPreference] ?? data.studyPreference}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
            <!-- CTA -->
            <p style="text-align:center;margin:0 0 28px;">
              <a href="${CLIENT_URL}/dashboard" style="display:inline-block;background:#c0392b;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;">Bắt đầu học ngay →</a>
            </p>
            <p style="margin:0;color:#888;font-size:13px;line-height:1.5;">
              Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#aaa;font-size:12px;">© 2026 HajimeNihongo. Chúc bạn học tốt! 🌸</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
