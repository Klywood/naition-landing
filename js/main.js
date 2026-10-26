const METRIKA_ID = 113666253;

function reachGoal(goal) {
    try {
        if (typeof window.ym === 'function') {
            window.ym(METRIKA_ID, 'reachGoal', goal);
        }
    } catch (error) {
        // аналитика не должна ломать страницу
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const registrationSection = document.getElementById('registration');
    const form = document.getElementById('registration-form');
    const message = document.getElementById('form-message');
    const registerButtons = document.querySelectorAll('.btn-register');

    registerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            reachGoal('register_click');

            const card = button.closest('.pricing-card');
            const tariff = card ? card.querySelector('[data-tariff]') : null;
            const price = card ? card.querySelector('.price') : null;
            const tariffNote = document.getElementById('selected-tariff');

            if (tariff && tariffNote) {
                tariffNote.textContent = 'Выбран тариф: ' + tariff.textContent.trim()
                    + (price ? ' · ' + price.textContent.trim() : '');
                tariffNote.hidden = false;
            }

            if (!registrationSection) {
                return;
            }

            registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    document.querySelectorAll('[data-goal]').forEach((link) => {
        link.addEventListener('click', () => reachGoal(link.dataset.goal));
    });

    const stickyCta = document.getElementById('sticky-cta');
    const hero = document.querySelector('.hero');

    if (stickyCta && hero && registrationSection && 'IntersectionObserver' in window) {
        let heroVisible = true;
        let formVisible = false;
        const update = () => stickyCta.classList.toggle('visible', !heroVisible && !formVisible);

        new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; update(); }).observe(hero);
        new IntersectionObserver(([entry]) => { formVisible = entry.isIntersecting; update(); }).observe(registrationSection);
    }

    if (!form) {
        return;
    }

    const purposeField = form.querySelector('textarea[name="purpose"]');
    let formStarted = false;

    form.addEventListener('focusin', () => {
        if (!formStarted) {
            formStarted = true;
            reachGoal('form_start');
        }
    });

    form.querySelectorAll('.chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            if (purposeField instanceof HTMLTextAreaElement) {
                purposeField.value = chip.dataset.purpose || '';
                purposeField.focus();
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);

        if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
            submitButton.dataset.label = submitButton.textContent || '';
            submitButton.textContent = 'Отправляем…';
        }

        if (message) {
            message.textContent = '';
            message.className = 'form-message';
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Не удалось отправить заявку.');
            }

            if (message) {
                message.textContent = 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.';
                message.className = 'form-message success';
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            form.reset();
            reachGoal('form_submit');
        } catch (error) {
            if (message) {
                message.textContent = error instanceof Error ? error.message : 'Не удалось отправить заявку.';
                message.className = 'form-message error';
            }
        } finally {
            if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.label || 'Отправить заявку';
            }
        }
    });
});
