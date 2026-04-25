const STORAGE_KEY = 'genericTypingTestUserQuotes';
const MIN_QUOTE_TEXT_LENGTH = 3;
const MAX_QUOTE_TEXT_LENGTH = 500;
const MAX_QUOTE_SOURCE_LENGTH = 100;

const quoteForm = document.getElementById('quote-form');
const quoteText = document.getElementById('quote-text');
const quoteSource = document.getElementById('quote-source');
const submissionsTable = document.getElementById('quote-submissions');
const submissionsTableBody = submissionsTable?.querySelector('tbody');
const submissionRowTemplate = document.getElementById(
  'quote-submission-row-template',
);
const quoteFormError = document.getElementById('quote-form-error');
const submitButton = document.getElementById('clear-form');

let editingId = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeQuoteSubmissionPage);
} else {
  initializeQuoteSubmissionPage();
}

function initializeQuoteSubmissionPage() {
  if (
    !(quoteForm instanceof HTMLFormElement) ||
    !(quoteText instanceof HTMLTextAreaElement) ||
    !(quoteSource instanceof HTMLInputElement) ||
    !(quoteFormError instanceof HTMLElement) ||
    !(submitButton instanceof HTMLButtonElement)
  ) {
    return;
  }

  loadSubmissions();
  setupEventListeners();
}

function setupEventListeners() {
  quoteForm.addEventListener('submit', handleFormSubmit);
  submitButton.addEventListener('click', handleFormSubmit);
  quoteText.addEventListener('input', clearFormError);
  quoteSource.addEventListener('input', clearFormError);
}

async function handleFormSubmit(e) {
  if (e?.preventDefault) {
    e.preventDefault();
  }

  const formData = new FormData(quoteForm);
  const submissionInput = getSubmissionInputFromFormData(formData);
  const validationError = validateSubmissionInput(submissionInput);

  if (validationError) {
    setFormError(validationError);
    quoteForm.reportValidity();
    return;
  }

  clearFormError();
  updateSubmitButton(Boolean(editingId), true);

  try {
    const response = await fetch(
      editingId ? `/api/quotes/${encodeURIComponent(editingId)}` : '/api/quotes',
      {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(submissionInput),
        credentials: 'same-origin',
      },
    );

    const payload = await readJsonSafely(response);

    if (!response.ok) {
      throw new Error(
        payload?.message ||
          (editingId ? 'Unable to update quote.' : 'Unable to submit quote.'),
      );
    }

    const submissions = getSubmissions();
    const nextSubmission = createStoredSubmission(payload, submissionInput);
    const nextSubmissions = editingId
      ? submissions.map((submission) =>
          submission.id === String(editingId)
            ? {
                ...submission,
                ...nextSubmission,
                createdAt: submission.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : submission,
        )
      : [nextSubmission, ...submissions];

    saveSubmissions(nextSubmissions);
    loadSubmissions();
    clearForm();
    setFormError(editingId ? 'Quote updated.' : 'Quote submitted for moderation.');
  } catch (error) {
    setFormError(
      error instanceof Error
        ? error.message
        : editingId
          ? 'Unable to update quote.'
          : 'Unable to submit quote.',
    );
  } finally {
    updateSubmitButton(false, false);
  }
}

function getSubmissionInputFromFormData(formData) {
  return {
    text: getFirstFormValue(formData, ['quote-text', 'text']),
    source: getFirstFormValue(formData, ['quote-source', 'source']),
  };
}

function getFirstFormValue(formData, keys) {
  const key = keys.find((candidate) => formData.has(candidate));
  return String((key && formData.get(key)) || '').trim();
}

function validateSubmissionInput(submissionInput) {
  if (submissionInput.text.length < MIN_QUOTE_TEXT_LENGTH) {
    return `Quote text must be at least ${MIN_QUOTE_TEXT_LENGTH} characters.`;
  }

  if (submissionInput.text.length > MAX_QUOTE_TEXT_LENGTH) {
    return `Quote text must be ${MAX_QUOTE_TEXT_LENGTH} characters or fewer.`;
  }

  if (submissionInput.source.length > MAX_QUOTE_SOURCE_LENGTH) {
    return `Quote source must be ${MAX_QUOTE_SOURCE_LENGTH} characters or fewer.`;
  }

  return '';
}

function setFormError(message) {
  quoteFormError.textContent = message;
}

function clearFormError() {
  quoteFormError.textContent = '';
}

function updateSubmitButton(isEditing, isSubmitting) {
  const submitBtn = document.querySelector('#clear-form');
  if (!(submitBtn instanceof HTMLButtonElement)) {
    return;
  }

  submitBtn.disabled = Boolean(isSubmitting);

  if (isSubmitting) {
    submitBtn.textContent = isEditing ? 'Updating...' : 'Submitting...';
    return;
  }

  if (isEditing) {
    submitBtn.textContent = 'Update!';
  } else {
    submitBtn.textContent = 'Submit!';
  }
}

function clearForm() {
  quoteForm.reset();
  editingId = null;
  clearFormError();

  updateSubmitButton(false);
}

function loadSubmissions() {
  if (!(submissionsTableBody instanceof HTMLTableSectionElement)) {
    return;
  }

  const submissions = getSubmissions();
  submissionsTableBody.innerHTML = '';

  if (submissions.length === 0) {
    submissionsTableBody.appendChild(createEmptySubmissionRow());
    return;
  }

  submissions.forEach((submission) => {
    const submissionElement = createSubmissionElement(submission);
    submissionsTableBody.appendChild(submissionElement);
  });
}

function createSubmissionElement(submission) {
  if (!(submissionRowTemplate instanceof HTMLTemplateElement)) {
    return document.createElement('tr');
  }

  const tr = submissionRowTemplate.content.firstElementChild.cloneNode(true);
  tr.dataset.id = submission.id;

  const createdDate = new Date(submission.createdAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );

  const updatedDate = new Date(submission.updatedAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );

  tr.querySelector('[data-field="id"]').textContent = String(submission.id);
  tr.querySelector('[data-field="date"]').innerHTML =
    submission.createdAt !== submission.updatedAt
      ? `<ul>${updatedDate}</ul>`
      : createdDate;
  tr.querySelector('[data-field="text"]').textContent = submission.text;
  tr.querySelector('[data-field="source"]').textContent = submission.source;

  const editButton = tr.querySelector('[data-action="edit"]');
  const deleteButton = tr.querySelector('[data-action="delete"]');

  editButton.addEventListener('click', () => editSubmission(submission.id));
  deleteButton.addEventListener('click', () => deleteSubmission(submission.id));

  return tr;
}

function createEmptySubmissionRow() {
  const tr = document.createElement('tr');
  tr.className = 'quote-submissions__row';
  tr.innerHTML = `
    <td class="quote-submissions__cell">-</td>
    <td class="quote-submissions__cell">-</td>
    <td class="quote-submissions__cell">No submissions yet.</td>
    <td class="quote-submissions__cell">-</td>
    <td class="quote-submissions__cell">
      <button type="button" class="quote-submissions__action-button" disabled>Edit</button>
    </td>
    <td class="quote-submissions__cell">
      <button type="button" class="quote-submissions__action-button" disabled>Delete</button>
    </td>
  `;

  return tr;
}

function editSubmission(id) {
  const submissions = getSubmissions();
  const submission = submissions.find((sub) => sub.id === id);

  quoteForm.scrollIntoView();

  if (!submission) return;

  quoteText.value = submission.text;
  quoteSource.value = submission.source === 'Unknown' ? '' : submission.source;

  editingId = id;

  updateSubmitButton(true);
}

function deleteSubmission(id) {
  if (
    !confirm('Are you sure you want to remove this item from your local submission list?')
  ) {
    return;
  }

  const submissions = getSubmissions();
  const filteredSubmissions = submissions.filter((sub) => sub.id !== id);

  saveSubmissions(filteredSubmissions);
  loadSubmissions();

  if (editingId === id) {
    clearForm();
  }
}

function getSubmissions() {
  const submissionsJson = localStorage.getItem(STORAGE_KEY);
  return submissionsJson ? JSON.parse(submissionsJson) : [];
}

function saveSubmissions(submissions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

function createStoredSubmission(payload, submissionInput) {
  const nowIso = new Date().toISOString();

  return {
    id: String(payload?.id ?? Date.now()),
    text: String(payload?.text ?? submissionInput.text),
    source: String((payload?.source ?? submissionInput.source) || 'Unknown'),
    status: String(payload?.status ?? 'SUBMITTED'),
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

async function readJsonSafely(response) {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
