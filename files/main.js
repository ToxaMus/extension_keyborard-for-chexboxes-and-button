class UniversalManager {
    constructor() {
        this.elements = [];
        this.scanElements();
        this.setupEventListeners();
    }

    scanElements() {
        this.elements = [];

        // Ищем только чекбоксы и кнопки
        const buttons = document.querySelectorAll(
            'input[type="checkbox"], input[type="radio"], button, input[type="button"], input[type="submit"]'
        );

        // Строгая проверка видимости + исключение по тексту
        this.elements = Array.from(buttons).filter(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const value = element.value || element.textContent || '';

            // Исключаем кнопки навигации по тексту (с учетом регистра)
            const isNavigationButton =
                value.includes('Предыдущая страница') ||
                value.includes('Следующая страница') ||
                value.includes('Завершить') ||
                value.includes('завершить') ||
                value.includes('Завершить попытку') ||
                value.includes('завершить попытку') ||
                value.includes('Завершить попытку...') ||
                value.includes('завершить попытку...') ||
                value.includes('Завершить попытку.') ||
                value.includes('завершить попытку.') ||
                value.includes('Завершить попытку..') ||
                value.includes('завершить попытку..') ||
                value.includes('Previous') ||
                value.includes('previous') ||
                value.includes('Next') ||
                value.includes('next') ||
                value.includes('Finish') ||
                value.includes('finish') ||
                value.includes('Submit') ||
                value.includes('submit') ||
                value.includes('End attempt') ||
                value.includes('end attempt') ||
                value.includes('End attempt...') ||
                value.includes('End attempt..') ||
                value.includes('end attempt..') ||
                value.includes('end attempt...') ||
                value.includes('End attempt.') ||
                value.includes('end attempt.'); // Закрывающая скобка была здесь

            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility === 'visible' &&
                style.display !== 'none' &&
                style.opacity !== '0' &&
                !element.disabled &&
                !element.hidden &&
                !isNavigationButton  // Исключаем навигационные кнопки
            );
        });

        console.log('Найдено элементов:', this.elements.length);
        this.elements.forEach((el, i) => {
            console.log(`${i + 1}:`, el.type, el.value || el.textContent);
        });

        if (this.elements.length === 0) {
            console.log('Нет подходящих элементов - менеджер отключен');
            return;
        }
    }

    activateElement(number) {
        if (this.elements.length === 0) return false;
        if (number < 1 || number > this.elements.length) return false;

        const element = this.elements[number - 1];

        if (element.type === 'checkbox') {
            element.checked = !element.checked;
        } else if (element.type === 'radio') {
            element.checked = true;
        } else {
            element.click();
        }

        return true;
    }

    setupEventListeners() {
        if (this.elements.length === 0) return;

        document.addEventListener('keydown', (event) => {
            const key = event.key;

            if (/^[1-9]$/.test(key)) {
                event.preventDefault();
                this.activateElement(parseInt(key));
            }

            if (key === 'r' || key === 'R') {
                event.preventDefault();
                this.scanElements();
            }
        });

        window.n = (number) => this.activateElement(number);
    }
}

const manager = new UniversalManager();