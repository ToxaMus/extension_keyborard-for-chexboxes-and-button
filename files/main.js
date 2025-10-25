class UniversalManager {
    constructor() {
        this.elements = [];
        this.navigationButtons = {
            prev: null,
            next: null
        };
        this.scanElements();
        this.scanNavigationButtons();
        this.setupEventListeners();
    }

    // Сканирует страницу и находит только элементы, относящиеся к ответам
    scanElements() {
        this.elements = [];

        // Находим все потенциально кликабельные элементы
        const buttons = document.querySelectorAll(
            'input[type="checkbox"], input[type="radio"], button, input[type="button"], input[type="submit"], select'
        );

        // Расширенный список текстов для игнорирования
        const ignoreTexts = [
            'Предыдущая страница', 'Следующая страница', 'Завершить', 'завершить',
            'Завершить попытку', 'Previous', 'Next', 'Finish', 'Submit', 'End attempt',
            'Назад', 'Вперед', 'Back', 'Forward', 'Continue', 'Продолжить',
            'Сохранить', 'Save', 'Отмена', 'Cancel', 'Закрыть', 'Close',
            'Меню', 'Menu', 'Настройки', 'Settings', 'Поиск', 'Search',
            'Открыть боковую панель'
        ];

        // Селекторы элементов, которые нужно всегда игнорировать
        const ignoreSelectors = [
            'nav', 'header', 'footer', 'aside', '.sidebar', '.navigation',
            '.nav', '.header', '.footer', '.menu', '.navbar', '.pagination',
            '.tooltip.fade.show.bs-tooltip-left',
            '[title*="боковую панель"]',
            '[aria-label*="боковую панель"]',
            '[class*="sidebar-toggle"]',
            '[id*="sidebar-toggle"]'
        ];

        this.elements = Array.from(buttons).filter(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const value = (element.value || element.textContent || element.placeholder || '').trim();
            const parent = element.closest(ignoreSelectors.join(', '));

            // Проверяем, находится ли элемент в игнорируемой области
            if (parent) {
                return false;
            }

            // Проверяем текст элемента на совпадение с игнорируемыми фразами
            const shouldIgnore = ignoreTexts.some(ignoreText => 
                value.toLowerCase().includes(ignoreText.toLowerCase())
            );

            // Проверяем видимость и доступность
            const isVisible = (
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility === 'visible' &&
                style.display !== 'none' &&
                style.opacity !== '0' &&
                !element.disabled &&
                !element.hidden
            );

            // Дополнительная проверка: элемент должен быть в основном контенте
            const isInMainContent = this.isInMainContent(element);

            return isVisible && !shouldIgnore && isInMainContent;
        });

        console.log('Найдено элементов ответа:', this.elements.length);
        this.elements.forEach((el, i) => {
            const key = this.getKeyForIndex(i);
            console.log(`${key}:`, el.tagName, el.type || '', el.value || el.textContent || el.placeholder);
        });

        if (this.elements.length === 0) {
            console.log('Нет элементов ответа - менеджер отключен');
            return;
        }
    }

    // Сканирует страницу и находит навигационные кнопки
    scanNavigationButtons() {
        this.navigationButtons.prev = null;
        this.navigationButtons.next = null;

        // Ищем все потенциальные навигационные кнопки
        const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn, a.button');
        
        const prevTexts = ['предыдущая страница', 'previous', 'назад', 'back', '←'];
        const nextTexts = ['следующая страница', 'next', 'вперед', 'forward', '→', 'далее', 'continue'];

        allButtons.forEach(button => {
            const text = (button.textContent || button.value || button.placeholder || '').toLowerCase().trim();
            const rect = button.getBoundingClientRect();
            const style = getComputedStyle(button);
            
            // Проверяем видимость
            const isVisible = (
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility === 'visible' &&
                style.display !== 'none' &&
                style.opacity !== '0' &&
                !button.disabled &&
                !button.hidden
            );

            if (!isVisible) return;

            // Проверяем на текст "предыдущая страница"
            if (prevTexts.some(prevText => text.includes(prevText))) {
                this.navigationButtons.prev = button;
                console.log('Найдена кнопка "Предыдущая страница"');
            }

            // Проверяем на текст "следующая страница"
            if (nextTexts.some(nextText => text.includes(nextText))) {
                this.navigationButtons.next = button;
                console.log('Найдена кнопка "Следующая страница"');
            }
        });

        // Если не нашли по тексту, попробуем найти по классам или ID
        if (!this.navigationButtons.prev || !this.navigationButtons.next) {
            const prevSelectors = [
                '[id*="prev"]', '[class*="prev"]', '[id*="back"]', '[class*="back"]',
                '.pagination-prev', '.page-prev', '.nav-prev', '.previous'
            ];
            const nextSelectors = [
                '[id*="next"]', '[class*="next"]', '[id*="forward"]', '[class*="forward"]',
                '.pagination-next', '.page-next', '.nav-next', '.next'
            ];

            if (!this.navigationButtons.prev) {
                const prevElement = document.querySelector(prevSelectors.join(', '));
                if (prevElement && this.isElementVisible(prevElement)) {
                    this.navigationButtons.prev = prevElement;
                    console.log('Найдена кнопка "Предыдущая" по селектору');
                }
            }

            if (!this.navigationButtons.next) {
                const nextElement = document.querySelector(nextSelectors.join(', '));
                if (nextElement && this.isElementVisible(nextElement)) {
                    this.navigationButtons.next = nextElement;
                    console.log('Найдена кнопка "Следующая" по селектору');
                }
            }
        }
    }

    // Проверяет видимость элемента
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        
        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility === 'visible' &&
            style.display !== 'none' &&
            style.opacity !== '0' &&
            !element.disabled &&
            !element.hidden
        );
    }

    // Проверяет, находится ли элемент в основном контенте страницы
    isInMainContent(element) {
        const ignoredContainers = [
            'header', 'footer', 'nav', 'aside', 
            '.header', '.footer', '.nav', '.sidebar',
            '.navigation', '.navbar', '.pagination',
            '.tooltip',
            '[class*="sidebar"]'
        ];

        for (const selector of ignoredContainers) {
            if (element.closest(selector)) {
                return false;
            }
        }

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const rect = element.getBoundingClientRect();

        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= viewportHeight &&
            rect.right <= viewportWidth
        );

        return isInViewport;
    }

    // Возвращает клавишу для элемента по его индексу
    getKeyForIndex(index) {
        if (index < 9) {
            return (index + 1).toString();
        } else {
            const letterIndex = index - 9;
            const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
            return russianAlphabet[letterIndex - 1] || '?';
        }
    }

    // Возвращает индекс элемента по клавише
    getIndexFromKey(key) {
        if (/^[1-9]$/.test(key)) {
            return parseInt(key) - 1;
        } else if (/^[а-яё]$/.test(key)) {
            const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
            const letterIndex = russianAlphabet.indexOf(key);
            return 9 + letterIndex;
        }
        return -1;
    }

    // Активирует элемент по клавише или индексу
    activateElement(key) {
        const activeElement = document.activeElement;
        if (activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA' || 
             activeElement.isContentEditable)) {
            console.log('Активный элемент ввода - действие отменено');
            return false;
        }

        if (this.elements.length === 0) return false;
        
        let index;
        if (typeof key === 'string') {
            index = this.getIndexFromKey(key.toLowerCase());
        } else if (typeof key === 'number') {
            index = key - 1;
        } else {
            return false;
        }

        if (index < 0 || index >= this.elements.length) return false;

        const element = this.elements[index];

        if (element.tagName === 'SELECT') {
            element.focus();
            element.click();
        } else if (element.type === 'checkbox') {
            element.checked = !element.checked;
        } else if (element.type === 'radio') {
            element.checked = true;
        } else {
            element.click();
        }

        console.log(`Активирован элемент: ${this.getKeyForIndex(index)}`);
        return true;
    }

    // Нажимает навигационную кнопку
    pressNavigationButton(direction) {
        const activeElement = document.activeElement;
        if (activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA' || 
             activeElement.isContentEditable)) {
            console.log('Активный элемент ввода - действие отменено');
            return false;
        }

        const button = this.navigationButtons[direction];
        if (button && this.isElementVisible(button)) {
            button.click();
            console.log(`Нажата кнопка: ${direction === 'prev' ? 'Предыдущая страница' : 'Следующая страница'}`);
            return true;
        } else {
            console.log(`Кнопка "${direction}" не найдена или не видима`);
            return false;
        }
    }

    // Настраивает обработчики событий клавиатуры
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();

            const activeElement = document.activeElement;
            if (activeElement && 
                (activeElement.tagName === 'INPUT' || 
                 activeElement.tagName === 'TEXTAREA' || 
                 activeElement.isContentEditable)) {
                return;
            }

            // Обработка цифр 1-9 и русских букв а-я для ответов
            if (/^[1-9а-яё]$/.test(key)) {
                event.preventDefault();
                this.activateElement(key);
            }

            // Обработка стрелок для навигации
            if (key === 'arrowleft') {
                event.preventDefault();
                this.pressNavigationButton('prev');
            } else if (key === 'arrowright') {
                event.preventDefault();
                this.pressNavigationButton('next');
            }

            // Обработка клавиши пересканирования (R или К)
            if (key === 'к' || key === 'r' || key === 'К' || key === 'R') {
                event.preventDefault();
                this.scanElements();
                this.scanNavigationButtons();
            }
        });

        // Глобальные функции для консоли
        window.n = (key) => this.activateElement(key);
        window.prevPage = () => this.pressNavigationButton('prev');
        window.nextPage = () => this.pressNavigationButton('next');
    }
}

// Создаем экземпляр менеджера при загрузке
const manager = new UniversalManager();