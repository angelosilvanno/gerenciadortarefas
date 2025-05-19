document.addEventListener("DOMContentLoaded", () => {
  const DOM = {
    loginContainer: document.getElementById("login-container"),
    registerContainer: document.getElementById("register-container"),
    mainPanel: document.getElementById("main-panel"),
    showRegisterLink: document.getElementById("show-register"),
    showLoginLink: document.getElementById("show-login"),
    forgotPasswordLink: document.getElementById("forgot-password"),
    logoutBtn: document.getElementById("logout-btn"),
    loginForm: document.getElementById("login-form"),
    registerForm: document.getElementById("register-form"),
    forgotPasswordForm: document.getElementById("forgot-password-form"),
    taskForm: document.getElementById("task-form"),
    taskList: document.getElementById("task-list"),
    searchTasksInput: document.getElementById("search-tasks"),
    filterStatusSelect: document.getElementById("filter-status"),
    exportTasksBtn: document.getElementById("export-tasks"),
    messageDiv: document.getElementById("message"),
    progressBar: document.getElementById("progress-bar"),
    progressText: document.getElementById("progress-text"),
    welcomeModalElement: document.getElementById("welcomeModal"),
    forgotPasswordModalElement: document.getElementById("forgotPasswordModal"),
    deleteModalElement: document.getElementById("deleteModal"),
    confirmDeleteButton: document.getElementById("confirmDelete"),
    editTaskModalElement: document.getElementById("editTaskModal"),
    editTaskForm: document.getElementById("edit-task-form"),
    saveEditButton: document.getElementById("save-edit-btn"),
    loginUsernameInput: document.getElementById("login-username"),
    loginPasswordInput: document.getElementById("login-password"),
    loginButton: document.getElementById("login-btn"),
    registerUsernameInput: document.getElementById("register-username"),
    registerEmailInput: document.getElementById("register-email"),
    registerPasswordInput: document.getElementById("register-password"),
    registerConfirmPasswordInput: document.getElementById("register-password-confirm"),
    forgotEmailInput: document.getElementById("forgot-email"),
    taskTitleInput: document.getElementById("title"),
    taskDescriptionInput: document.getElementById("description"),
    taskDueDateInput: document.getElementById("dueDate"),
    taskPriorityInput: document.getElementById("priority"),
    taskStatusInput: document.getElementById("status"),
    taskCategoryInput: document.getElementById("category"),
    taskTagsInput: document.getElementById("tags"),
    editTitleInput: document.getElementById('edit-title'),
    editDescriptionInput: document.getElementById('edit-description'),
    editDueDateInput: document.getElementById('edit-dueDate'),
    editPriorityInput: document.getElementById('edit-priority'),
    editStatusInput: document.getElementById('edit-status'),
    editCategoryInput: document.getElementById('edit-category'),
    editTagsInput: document.getElementById('edit-tags'),
  };

  const API_BASE_URL = 'https://gerenciador-de-tarefas-d0zd.onrender.com';
  const API_AUTH_REGISTER_ENDPOINT = `${API_BASE_URL}/tarefas/api/cadastrar/`;
  const API_AUTH_LOGIN_ENDPOINT = `${API_BASE_URL}/tarefas/api/login/`;
  const API_TASKS_ENDPOINT = `${API_BASE_URL}/api/Tarefas/`;


  let editingTaskIndex = null; // Índice no tasksCache da tarefa sendo editada
  let tasksCache = []; // Cache local das tarefas do usuário

  // --- Regex para Validações ---
  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const tagRegex = /^[a-zA-Z0-9-]+$/;

  // --- Funções Utilitárias ---
  const sanitizeInput = (input) => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

  const showUIMessage = (msg, isError = true) => {
    if (!DOM.messageDiv) return;
    DOM.messageDiv.textContent = msg;
    DOM.messageDiv.className = `alert ${isError ? "alert-danger" : "alert-success"} text-center shadow p-3`;
    DOM.messageDiv.classList.remove("d-none");
    DOM.messageDiv.setAttribute("role", "alert");
    DOM.messageDiv.tabIndex = -1;
    DOM.messageDiv.focus();
    setTimeout(() => {
      if (DOM.messageDiv) {
        DOM.messageDiv.classList.add("d-none");
        DOM.messageDiv.textContent = "";
      }
    }, 4000);
  };

  async function fetchTasksFromAPI() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("Nenhum token encontrado, não buscando tarefas.");
      tasksCache = [];
      renderTasks(); // Limpa a UI
      // showLoginPanel(); // Descomente se quiser forçar o login imediatamente
      return;
    }
    try {
      const response = await fetch(API_TASKS_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("authToken");
          tasksCache = [];
          showLoginPanel();
          showUIMessage("Sessão expirada ou inválida. Faça login novamente.", true);
        } else {
          const errorData = await response.json().catch(() => ({ message: `Erro ao buscar tarefas: ${response.status}` }));
          showUIMessage(errorData.message || "Erro ao buscar tarefas.", true);
        }
        tasksCache = [];
        renderTasks();
        return;
      }
      const tasksFromAPI = await response.json();
      // Mapear campos da API para o formato que o frontend espera, principalmente o 'id' e 'dueDate'
      tasksCache = Array.isArray(tasksFromAPI) ? tasksFromAPI.map(task => ({
        id: task.id || task._id, // O backend DEVE retornar um ID único
        title: task.title,
        description: task.description,
        dueDate: task.due_date, // Ajuste se o nome do campo for diferente na API
        priority: task.priority,
        status: task.status,
        category: task.category || "",
        tags: Array.isArray(task.tags) ? task.tags : (task.tags ? [task.tags] : []), // Garante que tags seja um array
      })) : [];
      renderTasks();
    } catch (error) {
      console.error("Erro de conexão ao buscar tarefas:", error);
      showUIMessage("Erro de conexão ao buscar tarefas.", true);
      tasksCache = [];
      renderTasks();
    }
  }

  const updateProgress = () => {
    if (!DOM.progressBar || !DOM.progressText) return;
    const completed = tasksCache.filter(task => normalizeStatus(task.status) === "concluida").length;
    const total = tasksCache.length;
    const progress = total ? (completed / total) * 100 : 0;
    DOM.progressBar.style.width = `${progress}%`;
    DOM.progressBar.setAttribute("aria-valuenow", progress);
    DOM.progressText.textContent = `${completed} de ${total} tarefas concluídas`;
  };

  const filterTasksByStatus = (status = "todos") => {
    if (status === "todos") return tasksCache;
    const normalizedFilterStatus = normalizeStatus(status);
    return tasksCache.filter(task => normalizeStatus(task.status) === normalizedFilterStatus);
  };

  const filterTasksBySearchQuery = (query) => {
    if (!query) return tasksCache;
    const lowerCaseQuery = query.toLowerCase();
    return tasksCache.filter(task =>
      task.title.toLowerCase().includes(lowerCaseQuery) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
    );
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  function showLoginPanel() {
    if (DOM.loginContainer) DOM.loginContainer.style.display = "block";
    if (DOM.registerContainer) DOM.registerContainer.style.display = "none";
    if (DOM.mainPanel) DOM.mainPanel.style.display = "none";
  }
  function showRegisterPanel() {
    if (DOM.loginContainer) DOM.loginContainer.style.display = "none";
    if (DOM.registerContainer) DOM.registerContainer.style.display = "block";
    if (DOM.mainPanel) DOM.mainPanel.style.display = "none";
  }
  function showMainAppPanel() {
    if (DOM.loginContainer) DOM.loginContainer.style.display = "none";
    if (DOM.registerContainer) DOM.registerContainer.style.display = "none";
    if (DOM.mainPanel) DOM.mainPanel.style.display = "block";
  }

  function showWelcomeModal() {
    if (!localStorage.getItem("welcomeShown")) {
      if (DOM.welcomeModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        try {
          new bootstrap.Modal(DOM.welcomeModalElement).show();
          localStorage.setItem("welcomeShown", "true");
        } catch (e) {
          console.error("Erro ao mostrar modal de boas-vindas:", e);
        }
      }
    }
  }

  function showForgotPasswordModal() {
    if (DOM.forgotPasswordModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      try {
        new bootstrap.Modal(DOM.forgotPasswordModalElement).show();
      } catch (err) {
        console.error("Erro ao mostrar modal de esquecer senha:", err);
      }
    }
  }

  // --- EVENT LISTENERS ---
  if (DOM.showRegisterLink) { DOM.showRegisterLink.addEventListener("click", (e) => { e.preventDefault(); showRegisterPanel(); }); }
  if (DOM.showLoginLink) { DOM.showLoginLink.addEventListener("click", (e) => { e.preventDefault(); showLoginPanel(); }); }
  if (DOM.forgotPasswordLink) { DOM.forgotPasswordLink.addEventListener("click", (e) => { e.preventDefault(); showForgotPasswordModal(); });}

  if (DOM.forgotPasswordForm && DOM.forgotEmailInput) {
    DOM.forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = DOM.forgotEmailInput.value.trim();
      if (!emailRegex.test(email)) { showUIMessage("E-mail inválido."); return; }
      // TODO: Implementar chamada real de API para /api/auth/forgot-password
      // Exemplo:
      // try {
      //   const response = await fetch(`${API_AUTH_ENDPOINT}/forgot-password`, { /* ... */ });
      //   // Tratar resposta
      // } catch (error) { showUIMessage("Erro de conexão.", true); }
      showUIMessage("Se o e-mail existir em nossa base, instruções de recuperação serão enviadas.", false);
      bootstrap.Modal.getInstance(DOM.forgotPasswordModalElement)?.hide();
      DOM.forgotEmailInput.value = "";
    });
  }

  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
      tasksCache = [];
      showLoginPanel();
      renderTasks();
      showUIMessage("Você saiu do sistema.", false);
    });
  }

  if (DOM.registerForm && DOM.registerUsernameInput && DOM.registerEmailInput && DOM.registerPasswordInput && DOM.registerConfirmPasswordInput) {
    DOM.registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      // ... (validações regex como antes)
      const username = DOM.registerUsernameInput.value.trim();
      const email = DOM.registerEmailInput.value.trim();
      const password = DOM.registerPasswordInput.value.trim();
      const confirmPassword = DOM.registerConfirmPasswordInput.value.trim();

      if (!usernameRegex.test(username)) { DOM.registerUsernameInput.classList.add("is-invalid"); showUIMessage("Nome de usuário inválido. Use 3 a 15 letras ou números."); return; }
      if (!emailRegex.test(email)) { DOM.registerEmailInput.classList.add("is-invalid"); showUIMessage("E-mail inválido."); return; }
      if (!passwordRegex.test(password)) { DOM.registerPasswordInput.classList.add("is-invalid"); showUIMessage("Senha inválida. Mínimo 6 caracteres, com pelo menos uma letra e um número."); return; }
      if (password !== confirmPassword) { DOM.registerConfirmPasswordInput.classList.add("is-invalid"); showUIMessage("As senhas não coincidem."); return; }

      try {
        const response = await fetch(API_AUTH_REGISTER_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          showUIMessage(data.message || data.detail || `Erro no cadastro: ${response.statusText}`, true);
          return;
        }
        showUIMessage("Cadastro realizado com sucesso! Faça o login.", false);
        showLoginPanel();
        DOM.registerForm.reset();
      } catch (error) {
        console.error("Erro ao registrar:", error);
        showUIMessage("Erro de conexão ao tentar registrar. Tente novamente.", true);
      }
    });
  }

  if (DOM.loginForm && DOM.loginUsernameInput && DOM.loginPasswordInput && DOM.loginButton) {
    DOM.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const spinner = DOM.loginButton.querySelector(".spinner-border");
      DOM.loginUsernameInput.classList.remove("is-invalid");
      DOM.loginPasswordInput.classList.remove("is-invalid");
      if (spinner) spinner.classList.remove("d-none");
      DOM.loginButton.disabled = true;
      const username = DOM.loginUsernameInput.value.trim();
      const password = DOM.loginPasswordInput.value.trim();
      try {
        const response = await fetch(API_AUTH_LOGIN_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          DOM.loginUsernameInput.classList.add("is-invalid");
          DOM.loginPasswordInput.classList.add("is-invalid");
          showUIMessage(data.message || data.detail || "Usuário ou senha inválidos.", true);
        } else {
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          localStorage.setItem("authToken", data.token);
          await fetchTasksFromAPI(); // Carrega e renderiza tarefas
          showMainAppPanel();
          DOM.loginForm.reset();
        }
      } catch (error) {
        console.error("Erro no login:", error);
        showUIMessage("Erro de conexão ao tentar fazer login. Tente novamente.", true);
      } finally {
        if (spinner) spinner.classList.add("d-none");
        DOM.loginButton.disabled = false;
      }
    });
  }

  if (DOM.taskForm) {
    DOM.taskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("authToken");
      if (!token) { showUIMessage("Você precisa estar logado para criar tarefas.", true); showLoginPanel(); return; }
      const title = DOM.taskTitleInput.value.trim();
      const description = DOM.taskDescriptionInput.value.trim();
      const dueDate = DOM.taskDueDateInput.value;
      const priority = DOM.taskPriorityInput.value;
      const status = DOM.taskStatusInput.value;
      const category = DOM.taskCategoryInput.value.trim();
      const tagsValue = DOM.taskTagsInput.value.trim();
      const tags = tagsValue ? tagsValue.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
      if (!title || !description || !dueDate) { showUIMessage("Título, Descrição e Prazo são obrigatórios.", true); return; }
      // Validação de tags omitida para brevidade
      const taskData = { title, description, due_date: dueDate, priority, status, category, tags };
      try {
        const response = await fetch(API_TASKS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
          body: JSON.stringify(taskData)
        });
        const newTaskFromAPI = await response.json();
        if (!response.ok) { showUIMessage(newTaskFromAPI.message || newTaskFromAPI.detail || "Erro ao criar tarefa.", true); return; }
        tasksCache.push({
            id: newTaskFromAPI.id || newTaskFromAPI._id, title: newTaskFromAPI.title, description: newTaskFromAPI.description,
            dueDate: newTaskFromAPI.due_date, priority: newTaskFromAPI.priority, status: newTaskFromAPI.status,
            category: newTaskFromAPI.category, tags: newTaskFromAPI.tags || []
        });
        DOM.taskForm.reset();
        showUIMessage("Tarefa criada com sucesso!", false);
        renderTasks();
      } catch (error) { showUIMessage("Erro de conexão ao criar tarefa.", true); }
    });
  }

  if (DOM.editTaskForm) {
    DOM.editTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("authToken");
      if (!token || editingTaskIndex === null || !tasksCache[editingTaskIndex]) { showUIMessage("Erro: Nenhuma tarefa selecionada ou sessão inválida.", true); return; }
      const taskToEdit = tasksCache[editingTaskIndex];
      const taskId = taskToEdit.id;
      if (!taskId) { showUIMessage("Erro: ID da tarefa inválido para edição.", true); return; }
      const title = DOM.editTitleInput.value.trim();
      const description = DOM.editDescriptionInput.value.trim();
      const dueDate = DOM.editDueDateInput.value;
      const priority = DOM.editPriorityInput.value;
      const status = DOM.editStatusInput.value;
      const category = DOM.editCategoryInput.value.trim();
      const tagsValue = DOM.editTagsInput.value.trim();
      const tags = tagsValue ? tagsValue.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
      if (!title || !description || !dueDate) { showUIMessage("Título, Descrição e Prazo são obrigatórios.", true); return; }
      const updatedTaskData = { title, description, due_date: dueDate, priority, status, category, tags };
      try {
        const response = await fetch(`${API_TASKS_ENDPOINT}/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
          body: JSON.stringify(updatedTaskData)
        });
        const updatedTaskFromAPI = await response.json();
        if (!response.ok) { showUIMessage(updatedTaskFromAPI.message || updatedTaskFromAPI.detail || "Erro ao atualizar tarefa.", true); return; }
        tasksCache[editingTaskIndex] = {
            id: updatedTaskFromAPI.id || updatedTaskFromAPI._id, title: updatedTaskFromAPI.title, description: updatedTaskFromAPI.description,
            dueDate: updatedTaskFromAPI.due_date, priority: updatedTaskFromAPI.priority, status: updatedTaskFromAPI.status,
            category: updatedTaskFromAPI.category, tags: updatedTaskFromAPI.tags || []
        };
        renderTasks();
        showUIMessage("Tarefa atualizada com sucesso!", false);
        bootstrap.Modal.getInstance(DOM.editTaskModalElement)?.hide();
        editingTaskIndex = null;
      } catch (error) { showUIMessage("Erro de conexão ao atualizar tarefa.", true); }
    });
  }

  function handleTaskActions(event) {
    const target = event.target.closest('button');
    if (!target) return;
    const taskCard = target.closest('.task-card');
    if (!taskCard) return;
    const originalIndexAttr = target.dataset.index;
    if (originalIndexAttr === undefined) return;
    const index = parseInt(originalIndexAttr, 10);
    if (isNaN(index) || index < 0 || index >= tasksCache.length) return;
    if (target.classList.contains("edit-btn")) editTask(index);
    else if (target.classList.contains("delete-btn")) confirmTaskDeletion(index);
  }

  async function handleCheckboxClick(e) {
    const checkbox = e.target.closest(".complete-checkbox");
    if (!checkbox) return;
    const originalIndexAttr = checkbox.dataset.index;
    if (originalIndexAttr === undefined) return;
    const index = parseInt(originalIndexAttr, 10);
    if (isNaN(index) || index < 0 || index >= tasksCache.length) return;
    const task = tasksCache[index];
    if (!task) return;
    const newStatus = checkbox.checked ? "Concluída" : "Pendente"; // Valores que a API pode esperar
    const token = localStorage.getItem("authToken");
    if (!token) { showUIMessage("Sessão inválida.", true); checkbox.checked = !checkbox.checked; return; }
    const taskId = task.id;
    if (!taskId) { showUIMessage("Erro: ID da tarefa não encontrado.", true); checkbox.checked = !checkbox.checked; return; }
    try {
      // Enviar a tarefa inteira com o status modificado, ou apenas o status, dependendo da API
      const payload = { ...tasksCache[index], status: newStatus }; 
      // Remover campos que a API não deve receber ou que não podem ser modificados por esta ação
      delete payload.id; 
      // delete payload._id; // se _id for usado internamente mas não na API de update

      const response = await fetch(`${API_TASKS_ENDPOINT}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(payload) 
      });
      const updatedTaskFromAPI = await response.json();
      if (!response.ok) {
        showUIMessage(updatedTaskFromAPI.message || updatedTaskFromAPI.detail || "Erro ao atualizar status.", true);
        checkbox.checked = !checkbox.checked; return;
      }
      // Atualiza o cache com a resposta completa da API para manter a consistência
      tasksCache[index] = {
        id: updatedTaskFromAPI.id || updatedTaskFromAPI._id, title: updatedTaskFromAPI.title, description: updatedTaskFromAPI.description,
        dueDate: updatedTaskFromAPI.due_date, priority: updatedTaskFromAPI.priority, status: updatedTaskFromAPI.status, // status da API
        category: updatedTaskFromAPI.category, tags: updatedTaskFromAPI.tags || []
      };
      renderTasks();
    } catch (error) {
      showUIMessage("Erro de conexão ao atualizar status.", true);
      checkbox.checked = !checkbox.checked;
    }
  }

  function normalizeStatus(status) {
    if (typeof status !== 'string') return "";
    return status.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase();
  }

  function renderTasks(tasksToDisplay = tasksCache) {
    if (!DOM.taskList) return;
    const statusClass = { "pendente": "task-status-pendente", "emandamento": "task-status-em-andamento", "concluida": "task-status-concluida" };
    DOM.taskList.innerHTML = "";
    if (tasksToDisplay.length === 0) { DOM.taskList.innerHTML = '<p class="text-center text-muted" id="no-tasks-message">Nenhuma tarefa para exibir.</p>'; updateProgress(); return; }
    const groupedByDate = {};
    tasksToDisplay.forEach(task => {
      if (!task.dueDate || typeof task.dueDate !== 'string') { console.warn("Tarefa com dueDate inválido:", task); return; }
      const [year, month, day] = task.dueDate.split("-");
      if (!year || !month || !day ) { console.warn("Formato de dueDate inválido:", task.dueDate); return;}
      const date = new Date(year, parseInt(month) - 1, day).toISOString().split("T")[0];
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(task);
    });
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
    sortedDates.forEach(date => {
      const [y, m, d] = date.split("-");
      const formattedDate = `${d}/${m}/${y}`;
      const dateHeader = document.createElement("h6");
      dateHeader.className = "mt-4 text-primary border-bottom pb-1";
      dateHeader.textContent = `📅 ${formattedDate}`;
      DOM.taskList.appendChild(dateHeader);
      groupedByDate[date].forEach(task => {
        const taskId = task.id;
        const originalIndex = tasksCache.findIndex(t => t.id === taskId);
        if (originalIndex === -1) { console.warn("Tarefa não encontrada no cache:", taskId); return; }
        const div = document.createElement("div");
        div.classList.add("task-card", "card", "p-3", "mb-2");
        const normStatus = normalizeStatus(task.status);
        if (statusClass[normStatus]) div.classList.add(statusClass[normStatus]);
        div.setAttribute("role", "listitem");
        div.setAttribute("data-priority", task.priority);
        div.setAttribute("data-status", task.status);
        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center flex-grow-1">
              <input type="checkbox" class="form-check-input me-2 complete-checkbox" data-index="${originalIndex}" ${normStatus === "concluida" ? "checked" : ""}>
              <h5 class="mb-0 ${normStatus === "concluida" ? "text-decoration-line-through text-muted" : ""}" style="font-weight: bold;">
                ${sanitizeInput(task.title)}
              </h5>
            </div>
            <div>
              <button class="btn btn-warning btn-sm me-2 edit-btn" data-index="${originalIndex}" title="Editar tarefa">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-btn" data-index="${originalIndex}" title="Excluir tarefa">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
          <p class="mb-1 description-text">${sanitizeInput(task.description)}</p>
          <small class="text-muted d-block"><strong>Prazo:</strong> ${sanitizeInput(task.dueDate)}</small>
          <small class="text-muted d-block"><strong>Prioridade:</strong> ${sanitizeInput(task.priority)} | <strong>Status:</strong> ${sanitizeInput(task.status)}</small>
          ${task.category ? `<small class="text-muted d-block"><strong>Categoria:</strong> ${sanitizeInput(task.category)}</small>` : ""}
          ${task.tags && task.tags.length > 0 ? `<small class="text-muted d-block"><strong>Tags:</strong> ${task.tags.map(sanitizeInput).join(", ")}</small>` : ""}
        `;
        DOM.taskList.appendChild(div);
      });
    });
    DOM.taskList.removeEventListener("click", handleTaskActions);
    DOM.taskList.addEventListener("click", handleTaskActions);
    DOM.taskList.removeEventListener("change", handleCheckboxClick);
    DOM.taskList.addEventListener("change", handleCheckboxClick);
    updateProgress();
  }

  let currentDeleteHandler = null;
  async function confirmTaskDeletion(index) {
    if (!DOM.deleteModalElement || !DOM.confirmDeleteButton) return;
    const taskToDelete = tasksCache[index];
    if (!taskToDelete) { showUIMessage("Erro: Tarefa para exclusão não encontrada.", true); return; }
    const token = localStorage.getItem("authToken");
    if (!token) { showUIMessage("Sessão inválida.", true); return; }
    const taskId = taskToDelete.id;
    if(!taskId) { showUIMessage("Erro: ID da tarefa não encontrado para exclusão.", true); return; }
    const modalBody = DOM.deleteModalElement.querySelector('.modal-body');
    if (modalBody) modalBody.textContent = `Deseja realmente excluir a tarefa "${sanitizeInput(taskToDelete.title)}"?`;
    const modal = bootstrap.Modal.getOrCreateInstance(DOM.deleteModalElement);
    if (currentDeleteHandler) DOM.confirmDeleteButton.removeEventListener('click', currentDeleteHandler);
    currentDeleteHandler = async function onConfirm() {
      try {
        const response = await fetch(`${API_TASKS_ENDPOINT}/${taskId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Erro ao excluir tarefa."}));
          showUIMessage(errorData.message || "Erro ao excluir tarefa.", true); return;
        }
        tasksCache.splice(index, 1);
        showUIMessage("Tarefa removida com sucesso!", false);
        renderTasks();
      } catch (error) { showUIMessage("Erro de conexão ao excluir tarefa.", true);
      } finally { modal.hide(); }
    };
    DOM.confirmDeleteButton.addEventListener('click', currentDeleteHandler, { once: true });
    modal.show();
  }

  function editTask(index) {
    const task = tasksCache[index];
    if (!task || !DOM.editTaskModalElement) { showUIMessage("Erro ao tentar editar tarefa.", true); return; }
    if (DOM.editTitleInput) DOM.editTitleInput.value = task.title;
    if (DOM.editDescriptionInput) DOM.editDescriptionInput.value = task.description;
    if (DOM.editDueDateInput) DOM.editDueDateInput.value = task.dueDate;
    if (DOM.editPriorityInput) DOM.editPriorityInput.value = task.priority;
    if (DOM.editStatusInput) DOM.editStatusInput.value = task.status;
    if (DOM.editCategoryInput) DOM.editCategoryInput.value = task.category || '';
    if (DOM.editTagsInput) DOM.editTagsInput.value = task.tags ? task.tags.join(', ') : '';
    editingTaskIndex = index;
    bootstrap.Modal.getOrCreateInstance(DOM.editTaskModalElement).show();
  }

  if (DOM.filterStatusSelect) {
    DOM.filterStatusSelect.addEventListener("change", (e) => {
      const status = e.target.value;
      const query = DOM.searchTasksInput ? DOM.searchTasksInput.value.trim() : "";
      let filteredTasks = filterTasksByStatus(status);
      if (query) {
        filteredTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
      }
      renderTasks(filteredTasks);
    });
  }

  if (DOM.searchTasksInput) {
    DOM.searchTasksInput.addEventListener("input", debounce((e) => {
      const query = e.target.value.trim();
      const status = DOM.filterStatusSelect ? DOM.filterStatusSelect.value : "todos";
      let searchedTasks = tasksCache;
      if (status !== "todos") {
        searchedTasks = filterTasksByStatus(status);
      }
      if (query) {
        searchedTasks = searchedTasks.filter(task =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
      }
      renderTasks(searchedTasks);
    }, 300));
  }

  if (DOM.exportTasksBtn) {
    DOM.exportTasksBtn.addEventListener("click", () => {
      if (tasksCache.length === 0) { showUIMessage("Nenhuma tarefa para exportar."); return; }
      const escapeCsvField = (field) => `"${String(field == null ? '' : field).replace(/"/g, '""')}"`;
      const csvHeader = ["Título", "Descrição", "Prazo", "Prioridade", "Status", "Categoria", "Tags"].map(escapeCsvField);
      const csvRows = tasksCache.map(task => [
        escapeCsvField(task.title), escapeCsvField(task.description), escapeCsvField(task.dueDate),
        escapeCsvField(task.priority), escapeCsvField(task.status), escapeCsvField(task.category),
        escapeCsvField(task.tags ? task.tags.join(";") : "")
      ]);
      const csvContent = [csvHeader.join(","), ...csvRows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "tarefas.csv";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showUIMessage("Tarefas exportadas com sucesso!", false);
    });
  }

  function checkDueDates() {
    if (!('Notification' in window) || Notification.permission !== "granted") return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    tasksCache.forEach(task => {
      if (normalizeStatus(task.status) !== "concluida" && task.dueDate) {
        const [year, month, day] = task.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day); dueDate.setHours(0, 0, 0, 0);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        let notificationTitle = "";
        if (daysUntilDue === 0) notificationTitle = `Tarefa "${sanitizeInput(task.title)}" vence HOJE!`;
        else if (daysUntilDue === 1) notificationTitle = `Tarefa "${sanitizeInput(task.title)}" vence AMANHÃ!`;
        if (notificationTitle) new Notification(notificationTitle, { body: `Prazo: ${task.dueDate}` });
      }
    });
  }
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") { checkDueDates(); setInterval(checkDueDates, 60 * 60 * 1000); }
    });
  }

  async function initializeApp() {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("currentUser");
    if (token && storedUser) {
      await fetchTasksFromAPI(); // fetchTasksFromAPI agora chama renderTasks internamente
      showMainAppPanel();
    } else {
      showLoginPanel();
      tasksCache = [];
      renderTasks(); // Garante que a lista seja limpa
    }
    showWelcomeModal();
  }

  document.querySelectorAll('[title]').forEach(el => {
    if (bootstrap && bootstrap.Tooltip) { new bootstrap.Tooltip(el); }
  });

  initializeApp();
});