function formatarData(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function validarCamposTarefa(titulo, data) {
    if (!titulo || titulo.trim() === "") return "Título obrigatório";
    if (!data || data.trim() === "") return "Data obrigatória";
    return "ok";
  }

function filtrarTarefasPorStatus(status, tarefas) {
  return tarefas.filter(tarefa => tarefa.status === status);
}

  module.exports = {
    formatarData,
    validarCamposTarefa,
    filtrarTarefasPorStatus
  };

