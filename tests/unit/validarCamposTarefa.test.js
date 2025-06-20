const { validarCamposTarefa } = require('../../backend/utils/taskUtils');

describe('Função validarCamposTarefa', () => {
    test('deve retornar "ok" se o título e data forem válidos', () => {
        expect(validarCamposTarefa('Estudar', '2025-06-21')).toBe('ok');
    });

    test('deve retornar "Título obrigatório" se título estiver vazio', () => {
        expect(validarCamposTarefa('', '2025-06-21')).toBe('Título obrigatório');
    });

    test('deve retornar "Data obrigatória" se data estiver vazia', () => {
        expect(validarCamposTarefa('Estudar', '')).toBe('Data obrigatória');
    });
});