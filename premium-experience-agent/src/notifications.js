export async function notify(summary) {
  const tasks = [];

  if (process.env.DISCORD_WEBHOOK_URL) {
    tasks.push(sendDiscord(summary));
  }

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    tasks.push(sendTelegram(summary));
  }

  if (tasks.length === 0) return;

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.warn(`Notification failed: ${result.reason?.message || result.reason}`);
    }
  }
}

async function sendDiscord(summary) {
  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: truncate(`Premium Experience Agent\n\n${summary}`, 1900)
    })
  });

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}`);
  }
}

async function sendTelegram(summary) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: truncate(`Premium Experience Agent\n\n${summary}`, 3900),
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram API returned ${response.status}`);
  }
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 20)}\n... truncated`;
}
