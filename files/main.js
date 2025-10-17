class UniversalManager {
    constructor() {
        this.elements = []; // Массив для хранения найденных элементов
        this.scanElements(); // Первоначальное сканирование элементов
        this.setupEventListeners(); // Настройка обработчиков событий
    }

    // Сканирует страницу и находит все кликабельные элементы
    scanElements() {
        this.elements = []; // Очищаем массив элементов

        // Находим все потенциально кликабельные элементы
        const buttons = document.querySelectorAll(
            'input[type="checkbox"], input[type="radio"], button, input[type="button"], input[type="submit"], select'
        );

        // Список текстов для навигационных кнопок, которые нужно игнорировать
        const navigationButtons = [
            'Предыдущая страница',
            'Следующая страница',
            'Завершить',
            'завершить',
            'Завершить попытку',
            'Previous',
            'Next',
            'Finish',
            'Submit',
            'End attempt'
        ];

        // Фильтруем элементы по различным критериям
        this.elements = Array.from(buttons).filter(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const value = element.value || element.textContent || '';

            // Проверяем, является ли элемент навигационной кнопкой
            const isNavigationButton = navigationButtons.some(navButton => 
                value.includes(navButton)
            );

            // Возвращаем true только для видимых, активных, не-навигационных элементов
            return (
                rect.width > 0 && // Элемент имеет размеры
                rect.height > 0 &&
                style.visibility === 'visible' && // Видимый
                style.display !== 'none' && // Не скрыт
                style.opacity !== '0' && // Не прозрачный
                !element.disabled && // Не заблокирован
                !element.hidden && // Не скрыт атрибутом
                !isNavigationButton // Не навигационная кнопка
            );
        });

        // Логируем результаты сканирования
        console.log('Найдено элементов:', this.elements.length);
        this.elements.forEach((el, i) => {
            const key = this.getKeyForIndex(i);
            console.log(`${key}:`, el.tagName, el.type || '', el.value || el.textContent);
        });

        // Если элементов нет - отключаем менеджер
        if (this.elements.length === 0) {
            console.log('Нет подходящих элементов - менеджер отключен');
            return;
        }
    }

    // Возвращает клавишу для элемента по его индексу
    getKeyForIndex(index) {
        if (index < 9) {
            // Цифры 1-9 для первых 9 элементов
            return (index + 1).toString();
        } else {
            // Русские буквы а-я для элементов с 10 по 42
            const letterIndex = index - 9;
            const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
            return russianAlphabet[letterIndex - 1] || '?';
        }
    }

    // Возвращает индекс элемента по клавише
    getIndexFromKey(key) {
        if (/^[1-9]$/.test(key)) {
            // Цифры 1-9
            return parseInt(key) - 1;
        } else if (/^[а-яё]$/.test(key)) {
            // Русские буквы а-яё
            const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
            const letterIndex = russianAlphabet.indexOf(key);
            return 9 + letterIndex;
        }
        return -1; // Неверная клавиша
    }

    // Активирует элемент по клавише или индексу
    activateElement(key) {
        // Проверка: если инпут активирован, ничего не делать
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
            index = key - 1; // Для обратной совместимости с числами
        } else {
            return false;
        }

        // Проверяем валидность индекса
        if (index < 0 || index >= this.elements.length) return false;

        const element = this.elements[index];

        // Обрабатываем разные типы элементов
        if (element.tagName === 'SELECT') {
            // Для select элементов фокусируем и открываем dropdown
            element.focus();
            element.click(); // Открываем список options
        } else if (element.type === 'checkbox') {
            element.checked = !element.checked; // Переключаем чекбокс
        } else if (element.type === 'radio') {
            element.checked = true; // Выбираем радиокнопку
        } else {
            element.click(); // Стандартный клик для других элементов
        }

        console.log(`Активирован элемент: ${this.getKeyForIndex(index)}`);
        return true;
    }

    // Настраивает обработчики событий клавиатуры
    setupEventListeners() {
        if (this.elements.length === 0) return;

        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();

            // Проверка: если инпут активирован, ничего не делать
            const activeElement = document.activeElement;
            if (activeElement && 
                (activeElement.tagName === 'INPUT' || 
                 activeElement.tagName === 'TEXTAREA' || 
                 activeElement.isContentEditable)) {
                return; // Пропускаем обработку, если активен элемент ввода
            }

            // Обработка цифр 1-9 и русских букв а-я
            if (/^[1-9а-яё]$/.test(key)) {
                event.preventDefault(); // Предотвращаем стандартное поведение
                this.activateElement(key);
            }

            // Обработка клавиши пересканирования (R или К)
            if (key === 'к' || key === 'К' || key === 'R' || key === 'r') {
                event.preventDefault();
                this.scanElements(); // Пересканируем элементы
            }
        });

        // Глобальная функция для активации элементов из консоли
        window.n = (key) => this.activateElement(key);
    }
}

// Создаем экземпляр менеджера при загрузке
const manager = new UniversalManager();