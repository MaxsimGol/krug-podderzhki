document.documentElement.classList.add('js');
const cardButton = document.querySelector('#flip-card');
cardButton?.addEventListener('click', () => {
  const skip = cardButton.getAttribute('aria-pressed') !== 'true';
  cardButton.setAttribute('aria-pressed', String(skip));
  document.querySelector('#speaking-card').classList.toggle('is-red', skip);
  document.querySelector('#card-title').innerHTML = skip ? 'Пропускаю<br>очередь' : 'Готов(а)<br>говорить';
  document.querySelector('#card-description').textContent = skip ? 'Сейчас мне хочется послушать' : 'Можно дать мне слово';
  document.querySelector('#card-announcement').textContent = skip ? 'Красная сторона: пропускаю очередь. Объяснять причину не нужно.' : 'Зелёная сторона: готовность говорить. Можно передумать.';
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
async function copyText(text, status, fallback) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent = 'Скопировано. Можно вставить в свою почту.';
  } catch {
    status.textContent = 'Автоматическое копирование недоступно. Выделите текст и скопируйте вручную.';
    fallback?.focus();
    fallback?.select?.();
  }
}
document.querySelector('#copy-letter')?.addEventListener('click', () => copyText(letter.value, document.querySelector('#letter-status'), letter));
document.querySelectorAll('[data-copy-email]').forEach(button => {
  button.addEventListener('click', async () => {
    let status = button.parentElement.querySelector('[role="status"]');
    if (!status) { status = document.createElement('p'); status.setAttribute('role', 'status'); button.after(status); }
    await copyText(button.dataset.copyEmail, status);
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
