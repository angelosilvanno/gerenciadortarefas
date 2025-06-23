/** @jest-environment jsdom */
const { handleLogout } = require('../../js/logoutHelper');

describe('Função handleLogout', () => {
  let removeItemSpy;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="taskList">Tarefas antigas</div>
      <h3 id="taskListTitle">Título antigo</h3>
    `;

    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    global.showLoginPanel = jest.fn();

    global.DOM = {
      taskList: document.getElementById("taskList"),
      taskListTitle: document.getElementById("taskListTitle")
    };
  });

  afterEach(() => {
    removeItemSpy.mockRestore(); 
  });

  it('deve limpar o localStorage e resetar o estado da aplicação', () => {
    handleLogout(DOM, showLoginPanel);

    expect(removeItemSpy).toHaveBeenCalledWith("currentUser");
    expect(DOM.taskList.innerHTML).toBe("");
    expect(DOM.taskListTitle.textContent).toBe("Minhas Tarefas");
    expect(showLoginPanel).toHaveBeenCalled();
  });
});




