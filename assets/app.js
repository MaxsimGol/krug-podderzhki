document.documentElement.classList.add('js');
const cardButton = document.querySelector('#flip-card');
cardButton?.addEventListener('click', () => {
  const skip = cardButton.getAttribute('aria-pressed') !== 'true';
  cardButton.setAttribute('aria-pressed', String(skip));
  document.querySelector('#speaking-card').classList.toggle('is-red', skip);
  document.querySelector('#card-title').innerHTML = skip ? 'Пропускаю<br>очередь' : 'Готов(а)<br>говорить';
  document.querySelector('#card-description').textContent = skip ? 'Сейчас мне хочется послушать' : 'Можно предложить мне слово';
  document.querySelector('#card-announcement').textContent = skip ? 'Красная сторона: пропускаю очередь. Объяснять причину не нужно.' : 'Зелёная сторона: можно предложить мне слово. Можно передумать.';
});
const nameInput = document.querySelector('#participant-name');
const nameHint = document.querySelector('#name-hint');
const letter = document.querySelector('#letter');
const sendLink = document.querySelector('#send-letter');
let previousNameLine = '';
let nameEditedInLetter = false;
letter?.removeAttribute('readonly');
const updateMail = () => {
  if (sendLink) sendLink.href = 'mailto:' + sendLink.dataset.email + '?subject=' + encodeURIComponent('Круг поддержки — участие') + '&body=' + encodeURIComponent(letter.value);
};
nameInput?.addEventListener('input', () => {
  if (nameEditedInLetter) return;
  const name = nameInput.value.trim().replace(/[\r\n]/g, ' ');
  let text = letter.value;
  if (previousNameLine && text.includes(previousNameLine)) text = text.replace(previousNameLine, '');
  previousNameLine = name ? 'Меня можно называть ' + name + '.\n\n' : '';
  if (previousNameLine) {
    const greeting = 'Здравствуйте!\n\n';
    text = text.startsWith(greeting) ? greeting + previousNameLine + text.slice(greeting.length) : previousNameLine + text;
  }
  letter.value = text;
  updateMail();
});
letter?.addEventListener('input', () => {
  if (previousNameLine && !letter.value.includes(previousNameLine)) {
    nameEditedInLetter = true;
    if (nameInput) nameInput.readOnly = true;
    if (nameHint) nameHint.textContent = 'Вы изменили строку с именем. Теперь редактируйте имя прямо в письме; поле выше больше не меняет текст.';
  }
  updateMail();
});
// Compatibility path for HTTP and browsers without the asynchronous Clipboard API.
function copyWithSelection(text) {
  if (typeof document.execCommand !== 'function') return false;
  const activeElement = document.activeElement;
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.setAttribute('aria-hidden', 'true');
  helper.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px';
  document.body.append(helper);
  try {
    helper.focus({ preventScroll: true });
    helper.select();
    return document.execCommand('copy') === true;
  } finally {
    helper.remove();
    activeElement?.focus?.({ preventScroll: true });
  }
}
async function copyText(text, status, fallback, successMessage = 'Скопировано. Можно вставить в свою почту.') {
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {}
  if (!copied) {
    try { copied = copyWithSelection(text); } catch {}
  }
  if (copied) {
    status.textContent = successMessage;
  } else {
    status.textContent = 'Автоматическое копирование недоступно. Выделите текст и скопируйте вручную.';
    fallback?.focus();
    fallback?.select?.();
  }
}
document.querySelector('#copy-letter')?.addEventListener('click', () => copyText(letter.value, document.querySelector('#letter-status'), letter, 'Текст письма скопирован. Откройте свою почту, укажите адрес получателя и вставьте текст.'));
document.querySelectorAll('[data-copy-email]').forEach(button => {
  button.addEventListener('click', async () => {
    let status = button.parentElement.querySelector('[role="status"]');
    if (!status) { status = document.createElement('p'); status.setAttribute('role', 'status'); button.after(status); }
    await copyText(button.dataset.copyEmail, status, null, 'Адрес скопирован. Вставьте его в поле «Кому» в своей почте.');
  });
});
document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));

// If a cover cannot load, retain its author and title.
document.querySelectorAll('[data-cover-image]').forEach(img => {
  const showFallback = () => {
    const cover = img.closest('.real-book-cover');
    cover.classList.add('cover-missing');
    cover.querySelector('.cover-fallback')?.removeAttribute('aria-hidden');
  };
  img.addEventListener('error', showFallback);
  if (img.complete && img.naturalWidth === 0) showFallback();
});
