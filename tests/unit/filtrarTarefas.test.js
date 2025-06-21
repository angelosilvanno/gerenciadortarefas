const { filtrarTarefasPorStatus } = require('../../backend/utils/taskUtils');

describe('filtrarTarefasPorStatus', () => {
  const tarefasMock = [
    { id: 1, titulo: 'Tarefa 1', status: 'pendente' },
    { id: 2, titulo: 'Tarefa 2', status: 'feita' },
    { id: 3, titulo: 'Tarefa 3', status: 'pendente' }
  ];

  it('deve retornar apenas tarefas com status "pendente"', () => {
    const resultado = filtrarTarefasPorStatus('pendente', tarefasMock);
    expect(resultado).toEqual([
      { id: 1, titulo: 'Tarefa 1', status: 'pendente' },
      { id: 3, titulo: 'Tarefa 3', status: 'pendente' }
    ]);
  });

  it('deve retornar apenas tarefas com status "feita"', () => {
    const resultado = filtrarTarefasPorStatus('feita', tarefasMock);
    expect(resultado).toEqual([
      { id: 2, titulo: 'Tarefa 2', status: 'feita' }
    ]);
  });

  it('deve retornar array vazio se não houver nenhuma tarefa com o status', () => {
    const resultado = filtrarTarefasPorStatus('cancelada', tarefasMock);
    expect(resultado).toEqual([]);
  });

  it('deve retornar array vazio se o array de tarefas estiver vazio', () => {
    const resultado = filtrarTarefasPorStatus('pendente', []);
    expect(resultado).toEqual([]);
  });
});
