function handleLogout(DOM, showLoginPanel) {
    localStorage.removeItem("currentUser");
  
    if (DOM?.taskList) DOM.taskList.innerHTML = "";
    if (DOM?.taskListTitle) DOM.taskListTitle.textContent = "Minhas Tarefas";
  
    if (typeof showLoginPanel === "function") {
      showLoginPanel();
    }
  }
  
  module.exports = { handleLogout };
  