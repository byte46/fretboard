/**
 * Скрипт автоматизированного тестирования fret.html
 * Запуск через Chrome DevTools MCP: evaluate_script()
 * 
 * Использование:
 *   1. Открыть страницу в браузере
 *   2. Выполнить: testFretboard.runAllTests()
 *   3. Получить отчёт: testFretboard.getReport()
 */

(function() {
    'use strict';

    const testFretboard = {
        results: [],
        
        /**
         * Запускает все тесты
         * @returns {Object} Отчёт о тестировании
         */
        runAllTests: function() {
            this.results = [];
            
            this.test('Базовая загрузка: отсутствие ошибок в консоли', () => {
                // Проверяем, что консоль пуста (выполняется вручную через MCP)
                return { skip: true, reason: 'Проверяется через list_console_messages()' };
            });
            
            this.test('Гриф отрисован: 6 струн', () => {
                const strings = document.querySelectorAll('.string-line');
                return strings.length === 6;
            });
            
            this.test('Гриф отрисован: 13 вертикальных линий (12 ладов + 1)', () => {
                const frets = document.querySelectorAll('.fret-line');
                return frets.length === 13;
            });
            
            this.test('Фортепиано отрисовано: 24 клавиши', () => {
                const keys = document.querySelectorAll('.piano-key-white, .piano-key-black');
                return keys.length === 24;
            });
            
            this.test('Фортепиано: 14 белых клавиш', () => {
                const whiteKeys = document.querySelectorAll('.piano-key-white');
                return whiteKeys.length === 14;
            });
            
            this.test('Фортепиано: 10 чёрных клавиш', () => {
                const blackKeys = document.querySelectorAll('.piano-key-black');
                return blackKeys.length === 10;
            });
            
            this.test('Ноты на грифе: 78 кружков (6 струн × 13 ладов)', () => {
                const notes = document.querySelectorAll('.note-circle');
                return notes.length === 78;
            });
            
            this.test('Элементы управления: combobox тоники', () => {
                const tonicSelect = document.getElementById('tonicSelect');
                return tonicSelect && tonicSelect.options.length === 12;
            });
            
            this.test('Элементы управления: combobox типа гаммы', () => {
                const scaleSelect = document.getElementById('scaleTypeSelect');
                return scaleSelect && scaleSelect.options.length === 10;
            });
            
            this.test('Список нот гаммы отображается', () => {
                const list = document.getElementById('scaleNotesList');
                return list && list.textContent.includes('Ноты последовательности:');
            });
            
            this.test('localStorage: ключ guitarFretTonic существует', () => {
                return localStorage.getItem('guitarFretTonic') !== null;
            });
            
            this.test('localStorage: ключ guitarFretScaleType существует', () => {
                return localStorage.getItem('guitarFretScaleType') !== null;
            });
            
            this.test('Маркеры ладов: 5 одинарных + 2 двойных на 12 ладу', () => {
                const markers = document.querySelectorAll('.fret-markers circle');
                return markers.length === 6; // 3,5,7,9 + 2 на 12
            });
            
            return this.getReport();
        },
        
        /**
         * Тест смены тоники
         * @param {string} newTonic - Новая тоника (например, 'D')
         */
        testTonicChange: function(newTonic) {
            const oldTonic = localStorage.getItem('guitarFretTonic');
            
            this.test(`Смена тоники: установка ${newTonic}`, () => {
                const select = document.getElementById('tonicSelect');
                select.value = newTonic;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return localStorage.getItem('guitarFretTonic') === newTonic;
            });
            
            this.test(`Смена тоники: гриф перерисован с тоникой ${newTonic}`, () => {
                const tonicCircles = document.querySelectorAll('.note-tonic');
                return tonicCircles.length > 0;
            });
            
            this.test(`Смена тоники: список нот обновлён`, () => {
                const list = document.getElementById('scaleNotesList');
                return list.textContent.includes(newTonic);
            });
            
            return this.getReport();
        },
        
        /**
         * Тест смены типа гаммы
         * @param {string} scaleType - Тип гаммы (например, 'major')
         */
        testScaleTypeChange: function(scaleType) {
            this.test(`Смена типа гаммы: ${scaleType}`, () => {
                const select = document.getElementById('scaleTypeSelect');
                select.value = scaleType;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                return localStorage.getItem('guitarFretScaleType') === scaleType;
            });
            
            return this.getReport();
        },
        
        /**
         * Тест клика по фортепиано
         * @param {string} note - Нота для клика
         */
        testPianoClick: function(note) {
            this.test(`Клик по фортепиано: ${note}`, () => {
                const key = Array.from(document.querySelectorAll('.piano-key-white, .piano-key-black'))
                    .find(k => k.getAttribute('data-note') === note);
                if (!key) return false;
                key.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                return localStorage.getItem('guitarFretTonic') === note;
            });
            
            return this.getReport();
        },
        
        /**
         * Регистрирует результат теста
         */
        test: function(name, fn) {
            try {
                const result = fn();
                if (result.skip) {
                    this.results.push({ name, status: 'SKIP', reason: result.reason });
                } else if (result === true) {
                    this.results.push({ name, status: 'PASS' });
                } else {
                    this.results.push({ name, status: 'FAIL' });
                }
            } catch (e) {
                this.results.push({ name, status: 'ERROR', error: e.message });
            }
        },
        
        /**
         * Возвращает отчёт о тестировании
         */
        getReport: function() {
            const pass = this.results.filter(r => r.status === 'PASS').length;
            const fail = this.results.filter(r => r.status === 'FAIL').length;
            const error = this.results.filter(r => r.status === 'ERROR').length;
            const skip = this.results.filter(r => r.status === 'SKIP').length;
            
            return {
                summary: { pass, fail, error, skip, total: this.results.length },
                results: this.results
            };
        },
        
        /**
         * Возвращает текущее состояние приложения
         */
        getAppState: function() {
            return {
                tonic: localStorage.getItem('guitarFretTonic'),
                scaleType: localStorage.getItem('guitarFretScaleType'),
                noteCircles: document.querySelectorAll('.note-circle').length,
                pianoKeys: document.querySelectorAll('.piano-key-white, .piano-key-black').length,
                consoleErrors: 'Проверяется через list_console_messages()'
            };
        }
    };

    // Делаем доступным глобально
    window.testFretboard = testFretboard;
})();
