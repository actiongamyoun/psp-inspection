// Vercel Serverless Function
// 앱 → 이 함수 → Apps Script → 구글시트 + 드라이브

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSkgXqpOTCiHEKcLkv6yaa_YjJMt6hpB0qg5hQkkVhMe0k9kw3Z4OMqKQYKWoeadkllA/exec';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // 사진 포함된 Excel 업로드 대응
    },
  },
  maxDuration: 60, // Apps Script 응답 대기
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'GET') {
      const action = req.query.action || '';
      const response = await fetch(`${APPS_SCRIPT_URL}?action=${action}`);
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
