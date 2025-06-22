export function handleLogout() {
    localStorage.removeItem("currentUser");
    DOM.taskList.innerHTML = "";
    DOM.taskListTitle.textContent = "Minhas Tarefas";
    showLoginPanel();
  }
  