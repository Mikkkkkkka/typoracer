(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const quotePage = document.querySelector('[data-quote-page]');
    const recordsContainer = document.getElementById('quote-records');
    const status = document.getElementById('quote-records-status');

    if (
      !(quotePage instanceof HTMLElement) ||
      !(recordsContainer instanceof HTMLElement) ||
      !(status instanceof HTMLElement)
    ) {
      return;
    }

    if (typeof window.EventSource !== 'function') {
      status.textContent = 'Live updates are unavailable in this browser.';
      return;
    }

    const quoteId = quotePage.dataset.quoteId;

    if (!quoteId) {
      status.textContent = 'Live updates unavailable for this quote.';
      return;
    }

    const stream = new window.EventSource(
      `/api/quotes/${encodeURIComponent(quoteId)}/records/stream`,
    );

    stream.addEventListener('records', function (event) {
      const payload = parsePayload(event);

      if (!payload) {
        return;
      }

      recordsContainer.innerHTML = renderRecords(payload.records);
      status.textContent = `Live updates connected. Last synced ${formatUpdatedAt(payload.updatedAt)}.`;
    });

    stream.addEventListener('heartbeat', function () {
      if (!status.textContent.startsWith('Live updates connected.')) {
        status.textContent = 'Live updates connected.';
      }
    });

    stream.onerror = function () {
      status.textContent = 'Live updates disconnected. Retrying...';
    };

    window.addEventListener(
      'beforeunload',
      function () {
        stream.close();
      },
      { once: true },
    );
  });
})();

function parsePayload(event) {
  try {
    return JSON.parse(event.data);
  } catch {
    return null;
  }
}

function renderRecords(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return '<p>No attempts yet for this quote.</p>';
  }

  const rows = entries
    .map(function (entry, index) {
      const username = escapeHtml(String(entry.username ?? ''));
      const encodedUsername = encodeURIComponent(String(entry.username ?? ''));
      const wpm = Number(entry.wpm ?? 0);
      const accuracy = Number(entry.accuracy ?? 0);

      return `
        <tr class="leaderboard__row">
          <td class="leaderboard__cell">${index + 1}</td>
          <td class="leaderboard__cell">
            <a href="/users/${encodedUsername}">${username}</a>
          </td>
          <td class="leaderboard__cell">${wpm}</td>
          <td class="leaderboard__cell">${accuracy}%</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table class="leaderboard" aria-label="Quote records">
      <thead class="leaderboard__head">
        <tr>
          <th class="leaderboard__header">#</th>
          <th class="leaderboard__header">Name</th>
          <th class="leaderboard__header">Best WPM</th>
          <th class="leaderboard__header">Accuracy</th>
        </tr>
      </thead>
      <tbody class="leaderboard__body">${rows}</tbody>
    </table>
  `;
}

function formatUpdatedAt(updatedAt) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return 'just now';
  }

  return date.toLocaleTimeString('ru-RU', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function escapeHtml(value) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return value.replace(/[&<>"']/g, function (character) {
    return htmlEscapes[character];
  });
}
