// ==================== ИНИЦИАЛИЗАЦИЯ ====================
class UniversalManager {
    constructor() {
        this.elements = [];
        this.scanElements();
    }
    
    // Нахождение всех элементов
    scanElements() {
        this.elements = [];
        
        // Ищем все интерактивные элементы
        const allElements = document.querySelectorAll(
            'input[type="checkbox"], input[type="radio"], button, input[type="button"], input[type="submit"]'
        );
        
        // Добавляем и сортируем по положению в DOM
        allElements.forEach(element => this.elements.push(element));
        this.elements.sort((a, b) => {
            return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
    }
    
    // Активация элемента по номеру 1-9
    activateElement(number) {
        if (number < 1 || number > this.elements.length) return false;
        
        const element = this.elements[number - 1];
        
        // Выполняем действие в зависимости от типа элемента
        if (element.type === 'checkbox') {
            element.checked = !element.checked;
        }
        else if (element.type === 'radio') {
            element.checked = true;
        }
        else {
            element.click();
        }
        
        return true;
    }
}

const manager = new UniversalManager();


function initManager() {
    
    // Обработчик клавиш
    document.addEventListener('keydown', function(event) {
        console.log('keydown event')
        const key = event.key;
        
        // Цифры 1-9 для активации элементов
        if (/^[1-9]$/.test(key)) {
            const number = parseInt(key);
            manager.activateElement(number);
        }
        
        // R - пересканировать элементы
        if (key === 'r' || key === 'R') {
            manager.scanElements();
        }
    });
    
    // Глобальная функция для консоли
    window.n = function(number) {
        return manager.activateElement(number);
    };
    
    return manager;
}

// Запуск сразу
console.log('init extension')
const run = initManager();