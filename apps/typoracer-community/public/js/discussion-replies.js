(function () {
  window.addEventListener('load', function () {
    const form = document.getElementById('discussion-reply-form');

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const repliesList = document.getElementById('discussion-replies-list');
    const status = document.getElementById('discussion-reply-status');
    const textInput = document.getElementById('reply-text');
    const discussionId = form.dataset.discussionId;
    const currentUser = form.dataset.currentUser;

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!(textInput instanceof HTMLTextAreaElement) || !discussionId || !currentUser) {
        return;
      }

      const text = textInput.value.trim();

      if (!text) {
        if (status) {
          status.textContent = 'Reply text is required.';
        }

        return;
      }

      if (status) {
        status.textContent = 'Posting reply...';
      }

      try {
        const response = await fetch(`/forums/${discussionId}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-User': currentUser,
          },
          body: JSON.stringify({ text }),
        });

        const payload = await response.json();

        if (!response.ok || !payload.reply) {
          throw new Error(payload.message || 'Unable to post reply.');
        }

        appendReply(repliesList, payload.reply);
        form.reset();

        if (status) {
          status.textContent = 'Reply posted.';
        }
      } catch (error) {
        if (status) {
          status.textContent =
            error instanceof Error ? error.message : 'Unable to post reply.';
        }
      }
    });
  });

  function appendReply(repliesList, reply) {
    if (!(repliesList instanceof HTMLElement)) {
      return;
    }

    const article = document.createElement('article');
    article.className = 'card discussion-reply';

    const author = document.createElement('p');
    author.className = 'discussion-reply__author';

    const authorLink = document.createElement('a');
    authorLink.href = `/users/${reply.author}`;
    authorLink.textContent = reply.author;

    author.appendChild(authorLink);

    const text = document.createElement('p');
    text.textContent = reply.text;

    article.appendChild(author);
    article.appendChild(text);
    repliesList.appendChild(article);
  }
})();
