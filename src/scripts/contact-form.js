export function initContactForm() {
  const params = new URLSearchParams(window.location.search);
  const serviceSelect = document.getElementById('service');
  const commentTextarea = document.getElementById('comment');

  if (serviceSelect && params.get('service')) {
    const targetVal = params.get('service');
    const exists = Array.from(serviceSelect.options).some(
      (o) => o.value === targetVal,
    );
    if (exists) serviceSelect.value = targetVal;
  }
  if (commentTextarea && params.get('summary')) {
    commentTextarea.value = params.get('summary');
  }

  document.querySelectorAll('.js-phone-input').forEach((input) => {
    input.addEventListener('input', () => {
      let digits = input.value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (digits.length > 0 && !digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);

      let out = '';
      if (digits.length > 0) out = '+7';
      if (digits.length > 1) out += ' (' + digits.slice(1, 4);
      if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
      if (digits.length >= 7) out += '-' + digits.slice(7, 9);
      if (digits.length >= 9) out += '-' + digits.slice(9, 11);
      input.value = out;
    });
  });

  document.querySelectorAll('.js-lead-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msgEl = form.querySelector('.form-msg');
      const fd = new FormData(form);

      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const phone = String(fd.get('phone') || '').trim();
      const service = String(fd.get('service') || '').trim();
      const comment = String(fd.get('comment') || '').trim();

      if (name.length < 2) {
        if (msgEl) {
          msgEl.className = 'form-msg form-msg--err';
          msgEl.textContent =
            'Пожалуйста, укажите ваше имя или название компании.';
        }
        return;
      }
      if (phone.replace(/\D/g, '').length < 11) {
        if (msgEl) {
          msgEl.className = 'form-msg form-msg--err';
          msgEl.textContent = 'Пожалуйста, введите полный номер телефона.';
        }
        return;
      }

      if (!form.reportValidity()) return;
      const serviceName =
        serviceSelect?.selectedOptions[0]?.textContent || service;
      const body = `Имя / организация: ${name}\nТелефон: ${phone}\nEmail: ${email}\nУслуга: ${serviceName}\n\n${comment}`;
      window.location.href = `mailto:info@classicag.ru?subject=${encodeURIComponent('Запрос расчёта — Классика-АГ')}&body=${encodeURIComponent(body)}`;
      if (msgEl) {
        msgEl.className = 'form-msg form-msg--ok';
        msgEl.textContent =
          'Письмо подготовлено для вашей почтовой программы. Если она не открылась, напишите на info@classicag.ru или позвоните +7 (495) 933-74-96. Заявка ещё не отправлена.';
      }
    });
  });
}
