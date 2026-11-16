export function initInquiryForm() {
  const form = document.getElementById('inquiry-form');
  const successBox = document.getElementById('inquiry-success');
  const errorBox = document.getElementById('inquiry-error');
  const submitBtn = document.getElementById('inquiry-submit');
  const resetBtn = document.getElementById('inquiry-reset');
  if (!form || !successBox) return;

  const defaultHtml = submitBtn?.innerHTML || '';
  const spinnerHtml =
    '<svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" class="opacity-25"/><path d="M21 12a9 9 0 0 0-9-9" /></svg>';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox?.classList.add('hidden');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = spinnerHtml;
    }

    const formData = new FormData(form);
    const body = new URLSearchParams(formData).toString();

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      form.classList.add('hidden');
      successBox.classList.remove('hidden');
      form.reset();
    } catch (err) {
      console.error('Netlify form submission error:', err);
      errorBox?.classList.remove('hidden');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = defaultHtml;
      }
    }
  });

  resetBtn?.addEventListener('click', () => {
    successBox.classList.add('hidden');
    form.classList.remove('hidden');
  });
}
