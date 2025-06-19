const { formatarData } = require('../../backend/utils/taskUtils');

describe('Função formatarData', () => {
  test('deve formatar data corretamente', () => {
    expect(formatarData('2025-06-20')).toBe('20/06/2025');
  });

  test('deve retornar string vazia se data for vazia', () => {
    expect(formatarData('')).toBe('');
  });

  test('não deve formatar corretamente se data estiver em formato errado', () => {
    expect(formatarData('20-06-2025')).not.toBe('20/06/2025');
  });
});
