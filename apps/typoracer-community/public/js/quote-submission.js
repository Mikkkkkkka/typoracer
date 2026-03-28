const STORAGE_KEY = 'genericTypingTestUserQuotes';
const MIN_QUOTE_TEXT_LENGTH = 3;
const MAX_QUOTE_TEXT_LENGTH = 500;
const MAX_QUOTE_SOURCE_LENGTH = 100;

const quoteForm = document.getElementById('quote-form');
const quoteText = document.getElementById('quote-text');
const quoteSource = document.getElementById('quote-source');
const clearFormBtn = document.getElementById('clear-form');
const submissionsTable = document.getElementById('quote-submissions');
const submissionsTableHeaders =
  document.getElementById('quote-submissions').innerHTML;
const submissionRowTemplate = document.getElementById(
  'quote-submission-row-template',
);
const quoteFormError = document.getElementById('quote-form-error');

let editingId = null;

document.addEventListener('DOMContentLoaded', function () {
  loadSubmissions();
  setupEventListeners();
});

function setupEventListeners() {
  quoteForm.addEventListener('submit', handleFormSubmit);
  quoteText.addEventListener('input', clearFormError);
  quoteSource.addEventListener('input', clearFormError);
}

function handleFormSubmit(e) {
  e.preventDefault();
  console.log('default prevented!');

  const formData = new FormData(quoteForm);
  const submissionInput = getSubmissionInputFromFormData(formData);
  const validationError = validateSubmissionInput(submissionInput);

  if (validationError) {
    setFormError(validationError);
    quoteForm.reportValidity();
    return;
  }

  const submissions = getSubmissions();
  const nowIso = new Date().toISOString();
  const newId = Date.now().toString();
  const result = processSubmission(
    submissions,
    submissionInput,
    editingId,
    nowIso,
    newId,
  );

  // В реальности где то здесь был бы вызов метода, который кинул бы цитату на сервер
  saveSubmissions(result.submissions);
  editingId = result.editingId;
  updateSubmitButton(Boolean(editingId));

  loadSubmissions();
  clearForm();
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

function processSubmission(
  submissions,
  submissionInput,
  currentEditingId,
  nowIso,
  newId,
) {
  const source = submissionInput.source || 'Unknown';

  if (currentEditingId) {
    const updatedSubmissions = submissions.map((submission) => {
      if (submission.id !== currentEditingId) {
        return submission;
      }

      return {
        ...submission,
        text: submissionInput.text,
        source,
        updatedAt: nowIso,
      };
    });

    return {
      submissions: updatedSubmissions,
      editingId: null,
    };
  }

  const newSubmission = {
    id: newId,
    text: submissionInput.text,
    source,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return {
    submissions: [newSubmission, ...submissions],
    editingId: null,
  };
}

function updateSubmitButton(isEditing) {
  const submitBtn = document.querySelector('#clear-form');
  if (isEditing) {
    submitBtn.innerHTML = 'Update!';
  } else {
    submitBtn.innerHTML = 'Submit!';
  }
}

function clearForm() {
  quoteForm.reset();
  editingId = null;
  clearFormError();

  updateSubmitButton(false);
}

function loadSubmissions() {
  const submissions = getSubmissions();

  submissionsTable.innerHTML = submissionsTableHeaders;

  submissions.forEach((submission) => {
    const submissionElement = createSubmissionElement(submission);
    submissionsTable.appendChild(submissionElement);
  });
}

function createSubmissionElement(submission) {
  console.log('creating the submission element: ' + JSON.stringify(submission));
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

  tr.querySelector('[data-field="id"]').textContent = submission.id;
  tr.querySelector('[data-field="date"]').innerHTML =
    submission.createdAt !== submission.updateDate
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

function editSubmission(id) {
  const submissions = getSubmissions();
  const submission = submissions.find((sub) => sub.id === id);

  quoteForm.scrollIntoView();

  if (!submission) return;

  quoteText.value = submission.text;
  quoteSource.value = submission.source;

  editingId = id;

  updateSubmitButton(true);
}

function deleteSubmission(id) {
  if (!confirm('Are you sure you want to delete this quote?')) {
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
