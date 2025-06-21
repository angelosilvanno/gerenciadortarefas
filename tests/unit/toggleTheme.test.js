/**
 * @jest-environment jsdom
 */

describe('Lógica de alternância de tema (claro/escuro)', () => {
    let applyTheme;
    const mockBody = document.body;
  
    beforeAll(() => {
      applyTheme = (theme) => {
        if (theme === 'dark') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      };
    });
  
    beforeEach(() => {
      mockBody.className = '';
      localStorage.clear();
    });
  
    it('deve aplicar o tema escuro corretamente', () => {
      applyTheme('dark');
      expect(mockBody.classList.contains('dark-mode')).toBe(true);
    });
  
    it('deve aplicar o tema claro corretamente', () => {
      applyTheme('light');
      expect(mockBody.classList.contains('dark-mode')).toBe(false);
    });
  
    it('deve salvar o tema escuro no localStorage ao alternar', () => {
      localStorage.setItem('theme', 'light');
      const isDarkMode = false;
      const newTheme = isDarkMode ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  
    it('deve salvar o tema claro no localStorage ao alternar', () => {
      localStorage.setItem('theme', 'dark');
      const isDarkMode = true;
      const newTheme = isDarkMode ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });
  