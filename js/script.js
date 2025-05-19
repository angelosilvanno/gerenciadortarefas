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

  const API_BASE_URL = 'https://gerenciador-de-tarefas-d0zd.onrender.com'; // Adicionado

  let editingTaskIndex = null;
  let tasksCache = [];

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const tagRegex = /^[a-zA-Z0-9-]+$/;

  const sanitizeInput = (input) => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

  // Removido hashPassword, pois o backend fará o hashing
  // async function hashPassword(password) { ... }

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

  // Modificado para usar API (ou localStorage como fallback se API falhar/não implementado)
  const saveTasks = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("authToken");

    if (currentUser && currentUser.username && token) {
      // TODO: Implementar chamada de API para salvar todas as tarefas se necessário,
      // ou salvar cada tarefa individualmente ao criar/editar/excluir.
      // Por agora, continuaremos usando localStorage para tarefas,
      // assumindo que a API lida com persistência individual.
      localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasksCache));
    } else {
      console.warn("Usuário não logado ou token ausente, salvando tarefas localmente como fallback.");
      localStorage.setItem("tasks", JSON.stringify(tasksCache));
    }
  };

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

  if (DOM.showRegisterLink) {
    DOM.showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRegisterPanel();
    });
  }
  if (DOM.showLoginLink) {
    DOM.showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginPanel();
    });
  }

  if (DOM.forgotPasswordLink) {
    DOM.forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showForgotPasswordModal();
    });
  }

  if (DOM.forgotPasswordForm && DOM.forgotEmailInput) {
    DOM.forgotPasswordForm.addEventListener("submit", async (e) => { // Adicionado async para futura chamada de API
      e.preventDefault();
      const email = DOM.forgotEmailInput.value.trim();
      if (!emailRegex.test(email)) {
        showUIMessage("E-mail inválido.");
        return;
      }
      // TODO: Implementar chamada de API para /api/auth/forgot-password
      // Por enquanto, mantém a lógica local
      const users = JSON.parse(localStorage.getItem("users")) || []; // Temporário, deve vir da API
      const user = users.find(u => u.email === email);
      if (user) {
        showUIMessage("Se o e-mail existir, instruções de recuperação serão enviadas!", false);
      } else {
        showUIMessage("Se o e-mail existir, instruções de recuperação serão enviadas!", false); // Mensagem genérica por segurança
      }
      if (DOM.forgotPasswordModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalInstance = bootstrap.Modal.getInstance(DOM.forgotPasswordModalElement);
        if (modalInstance) modalInstance.hide();
      }
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

  // MODIFICADO: Registro com API
  if (DOM.registerForm && DOM.registerUsernameInput && DOM.registerEmailInput && DOM.registerPasswordInput && DOM.registerConfirmPasswordInput) {
    DOM.registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = [DOM.registerUsernameInput, DOM.registerEmailInput, DOM.registerPasswordInput, DOM.registerConfirmPasswordInput];
      inputs.forEach(input => input.classList.remove("is-invalid"));
      const username = DOM.registerUsernameInput.value.trim();
      const email = DOM.registerEmailInput.value.trim();
      const password = DOM.registerPasswordInput.value.trim();
      const confirmPassword = DOM.registerConfirmPasswordInput.value.trim();

      if (!usernameRegex.test(username)) {
        DOM.registerUsernameInput.classList.add("is-invalid");
        showUIMessage("Nome de usuário inválido. Use 3 a 15 letras ou números.");
        return;
      }
      if (!emailRegex.test(email)) {
        DOM.registerEmailInput.classList.add("is-invalid");
        showUIMessage("E-mail inválido.");
        return;
      }
      if (!passwordRegex.test(password)) {
        DOM.registerPasswordInput.classList.add("is-invalid");
        showUIMessage("Senha inválida. Mínimo 6 caracteres, com pelo menos uma letra e um número.");
        return;
      }
      if (password !== confirmPassword) {
        DOM.registerConfirmPasswordInput.classList.add("is-invalid");
        showUIMessage("As senhas não coincidem.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/tarefas/api/cadastrar/`, { // Usando a URL da sua API
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          showUIMessage(data.message || `Erro no cadastro: ${response.statusText}`, true);
          if (data.message && data.message.toLowerCase().includes("e-mail")) {
            DOM.registerEmailInput.classList.add("is-invalid");
          }
          if (data.message && data.message.toLowerCase().includes("usuário")) {
            DOM.registerUsernameInput.classList.add("is-invalid");
          }
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

  // TODO: Adaptar login, e todas as operações de tarefas (criar, ler, atualizar, deletar) para usar fetch com a API_BASE_URL e o authToken.

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
      
      // MANTENDO LOCALSTORAGE POR ENQUANTO, ATÉ IMPLEMENTAR API DE LOGIN
      const users = JSON.parse(localStorage.getItem("users")) || []; 
      const hashedPassword = await hashPassword(password); // Ainda necessário se users vem do localStorage
      const user = users.find(u => u.username === username && u.password === hashedPassword);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify({ username: user.username, email: user.email }));
        // TODO: Após login via API, carregar tarefas da API
        tasksCache = JSON.parse(localStorage.getItem(`tasks_${user.username}`)) || [];
        showMainAppPanel();
        renderTasks();
        DOM.loginForm.reset();
      } else {
        DOM.loginUsernameInput.classList.add("is-invalid");
        DOM.loginPasswordInput.classList.add("is-invalid");
        showUIMessage("Usuário ou senha inválidos.");
      }
      if (spinner) spinner.classList.add("d-none");
      DOM.loginButton.disabled = false;
    });
  }

  if (DOM.taskForm) {
    // ... (manter como está por enquanto, será adaptado para API depois)
    const submitButton = DOM.taskForm.querySelector('button[type="submit"]');
    if (DOM.taskTitleInput && DOM.taskDescriptionInput && DOM.taskDueDateInput && DOM.taskPriorityInput && DOM.taskStatusInput && DOM.taskCategoryInput && DOM.taskTagsInput && submitButton) {
      DOM.taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = DOM.taskTitleInput.value.trim();
        const description = DOM.taskDescriptionInput.value.trim();
        const dueDate = DOM.taskDueDateInput.value;
        const priority = DOM.taskPriorityInput.value;
        const status = DOM.taskStatusInput.value;
        const category = DOM.taskCategoryInput.value.trim();
        const tagsValue = DOM.taskTagsInput.value.trim();
        const tags = tagsValue ? tagsValue.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
        if (!title || !description || !dueDate) {
          showUIMessage("Preencha os campos obrigatórios: Título, Descrição e Prazo.");
          return;
        }
        for (let tag of tags) {
          if (tag && !tagRegex.test(tag)) {
            showUIMessage(`Tag inválida: "${sanitizeInput(tag)}". Use apenas letras, números ou traços.`);
            return;
          }
        }
        const taskObj = { title, description, dueDate, priority, status, category, tags, id: Date.now() };
        tasksCache.push(taskObj);
        saveTasks();
        DOM.taskForm.reset();
        showUIMessage("Tarefa criada com sucesso!", false);
        renderTasks();
      });
    }
  }

  if (DOM.editTaskForm) {
    // ... (manter como está por enquanto, será adaptado para API depois)
    DOM.editTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (editingTaskIndex === null || !tasksCache[editingTaskIndex]) {
        showUIMessage("Erro: Nenhuma tarefa selecionada para edição.", true);
        return;
      }
      const title = DOM.editTitleInput.value.trim();
      const description = DOM.editDescriptionInput.value.trim();
      const dueDate = DOM.editDueDateInput.value;
      const priority = DOM.editPriorityInput.value;
      const status = DOM.editStatusInput.value;
      const category = DOM.editCategoryInput.value.trim();
      const tagsValue = DOM.editTagsInput.value.trim();
      const tags = tagsValue ? tagsValue.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
      if (!title || !description || !dueDate) {
        showUIMessage("Preencha os campos obrigatórios no formulário de edição: Título, Descrição e Prazo.", true);
        return;
      }
      for (let tag of tags) {
        if (tag && !tagRegex.test(tag)) {
          showUIMessage(`Tag inválida na edição: "${sanitizeInput(tag)}". Use apenas letras, números ou traços.`, true);
          return;
        }
      }
      tasksCache[editingTaskIndex] = {
        ...tasksCache[editingTaskIndex],
        title,
        description,
        dueDate,
        priority,
        status,
        category,
        tags
      };
      saveTasks();
      renderTasks();
      showUIMessage("Tarefa atualizada com sucesso!", false);
      if (DOM.editTaskModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalInstance = bootstrap.Modal.getInstance(DOM.editTaskModalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      editingTaskIndex = null;
    });
  }

  function handleTaskActions(event) {
    const target = event.target.closest('button');
    if (!target) return;
    const taskCard = target.closest('.task-card');
    if (!taskCard) return;
    const originalIndexAttr = target.dataset.index || taskCard.querySelector('.edit-btn')?.dataset.index || taskCard.querySelector('.delete-btn')?.dataset.index;
    if (originalIndexAttr === undefined) {
      console.error("Não foi possível encontrar o data-index no botão ou card.");
      return;
    }
    const index = parseInt(originalIndexAttr, 10);
    if (isNaN(index) || index < 0 || index >= tasksCache.length) {
      console.error("Índice de tarefa inválido ou tarefa não encontrada:", index);
      return;
    }
    if (target.classList.contains("edit-btn")) {
      editTask(index);
    } else if (target.classList.contains("delete-btn")) {
      confirmTaskDeletion(index);
    }
  }

  function handleCheckboxClick(e) {
    const checkbox = e.target.closest(".complete-checkbox");
    if (!checkbox) return;
    const originalIndexAttr = checkbox.dataset.index;
    if (originalIndexAttr === undefined) {
      console.error("Não foi possível encontrar o data-index no checkbox.");
      return;
    }
    const index = parseInt(originalIndexAttr, 10);
    if (isNaN(index) || index < 0 || index >= tasksCache.length) {
      console.error("Índice de tarefa inválido no checkbox:", index);
      return;
    }
    const task = tasksCache[index];
    if (!task) return;
    task.status = checkbox.checked ? "concluída" : "pendente";
    saveTasks();
    renderTasks();
  }

  function normalizeStatus(status) {
    if (typeof status !== 'string') return "";
    return status
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s/g, "")
      .toLowerCase();
  }

  function renderTasks(tasksToDisplay = tasksCache) {
    if (!DOM.taskList) return;
    const statusClass = {
      "pendente": "task-status-pendente",
      "emandamento": "task-status-em-andamento",
      "concluida": "task-status-concluida"
    };
    DOM.taskList.innerHTML = "";
    if (tasksToDisplay.length === 0) {
      DOM.taskList.innerHTML = '<p class="text-center text-muted" id="no-tasks-message">Nenhuma tarefa para exibir.</p>';
      updateProgress();
      return;
    }
    const groupedByDate = {};
    tasksToDisplay.forEach(task => {
      const [year, month, day] = task.dueDate.split("-");
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
        const originalIndex = tasksCache.findIndex(t => t.id === task.id);
        if (originalIndex === -1) {
          console.warn("Tarefa do groupedByDate não encontrada no tasksCache original. ID:", task.id);
          return;
        }
        const div = document.createElement("div");
        div.classList.add("task-card", "card", "p-3", "mb-2");
        const normStatus = normalizeStatus(task.status);
        if (statusClass[normStatus]) {
          div.classList.add(statusClass[normStatus]);
        }
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
  function confirmTaskDeletion(index) {
    if (!DOM.deleteModalElement || !DOM.confirmDeleteButton || typeof bootstrap === 'undefined' || !bootstrap.Modal) return;
    const taskToDelete = tasksCache[index];
    const modalBody = DOM.deleteModalElement.querySelector('.modal-body');
    if (modalBody && taskToDelete) {
      modalBody.textContent = `Deseja realmente excluir a tarefa "${sanitizeInput(taskToDelete.title)}"?`;
    } else if (modalBody) {
      modalBody.textContent = "Deseja realmente excluir esta tarefa?";
    }
    const modal = bootstrap.Modal.getOrCreateInstance(DOM.deleteModalElement);
    if (currentDeleteHandler) {
      DOM.confirmDeleteButton.removeEventListener('click', currentDeleteHandler);
    }
    currentDeleteHandler = function onConfirm() {
      tasksCache.splice(index, 1);
      saveTasks();
      showUIMessage("Tarefa removida com sucesso!", false);
      const currentFilterStatus = DOM.filterStatusSelect ? DOM.filterStatusSelect.value : "todos";
      const currentSearchQuery = DOM.searchTasksInput ? DOM.searchTasksInput.value : "";
      let tasksToRenderAfterDelete = filterTasksByStatus(currentFilterStatus);
      if (currentSearchQuery) {
        tasksToRenderAfterDelete = filterTasksBySearchQuery(currentSearchQuery).filter(task => tasksToRenderAfterDelete.includes(task));
      }
      renderTasks(tasksToRenderAfterDelete);
      modal.hide();
    };
    DOM.confirmDeleteButton.addEventListener('click', currentDeleteHandler, { once: true });
    modal.show();
  }

  function editTask(index) {
    const task = tasksCache[index];
    if (!task || !DOM.editTaskModalElement) {
      console.error("Tarefa não encontrada ou modal de edição não existe.");
      return;
    }
    if (DOM.editTitleInput) DOM.editTitleInput.value = task.title;
    if (DOM.editDescriptionInput) DOM.editDescriptionInput.value = task.description;
    if (DOM.editDueDateInput) DOM.editDueDateInput.value = task.dueDate;
    if (DOM.editPriorityInput) DOM.editPriorityInput.value = task.priority;
    if (DOM.editStatusInput) DOM.editStatusInput.value = task.status;
    if (DOM.editCategoryInput) DOM.editCategoryInput.value = task.category || '';
    if (DOM.editTagsInput) DOM.editTagsInput.value = task.tags ? task.tags.join(', ') : '';
    editingTaskIndex = index;
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getOrCreateInstance(DOM.editTaskModalElement);
      modal.show();
    }
  }

  if (DOM.filterStatusSelect) {
    DOM.filterStatusSelect.addEventListener("change", (e) => {
      const status = e.target.value;
      const query = DOM.searchTasksInput ? DOM.searchTasksInput.value : "";
      let filteredTasks = filterTasksByStatus(status);
      if (query) {
        filteredTasks = filterTasksBySearchQuery(query).filter(task => filteredTasks.includes(task));
      }
      renderTasks(filteredTasks);
    });
  }

  if (DOM.searchTasksInput) {
    DOM.searchTasksInput.addEventListener("input", debounce((e) => {
      const query = e.target.value;
      const status = DOM.filterStatusSelect ? DOM.filterStatusSelect.value : "todos";
      let searchedTasks = filterTasksBySearchQuery(query);
      if (status !== "todos") {
        searchedTasks = filterTasksByStatus(status).filter(task => searchedTasks.includes(task));
      }
      renderTasks(searchedTasks);
    }, 300));
  }

  if (DOM.exportTasksBtn) {
    DOM.exportTasksBtn.addEventListener("click", () => {
      if (tasksCache.length === 0) {
        showUIMessage("Nenhuma tarefa para exportar.");
        return;
      }
      const escapeCsvField = (field) => `"${String(field == null ? '' : field).replace(/"/g, '""')}"`;
      const csvHeader = ["Título", "Descrição", "Prazo", "Prioridade", "Status", "Categoria", "Tags"].map(escapeCsvField);
      const csvRows = tasksCache.map(task => [
        escapeCsvField(task.title),
        escapeCsvField(task.description),
        escapeCsvField(task.dueDate),
        escapeCsvField(task.priority),
        escapeCsvField(task.status),
        escapeCsvField(task.category),
        escapeCsvField(task.tags ? task.tags.join(";") : "")
      ]);
      const csvContent = [csvHeader.join(","), ...csvRows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tarefas.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showUIMessage("Tarefas exportadas com sucesso!", false);
    });
  }

  function checkDueDates() {
    if (!('Notification' in window) || Notification.permission !== "granted") return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    tasksCache.forEach(task => {
      if (normalizeStatus(task.status) !== "concluida" && task.dueDate) {
        const [year, month, day] = task.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        let notificationTitle = "";
        if (daysUntilDue === 0) {
          notificationTitle = `Tarefa "${sanitizeInput(task.title)}" vence HOJE!`;
        } else if (daysUntilDue === 1) {
          notificationTitle = `Tarefa "${sanitizeInput(task.title)}" vence AMANHÃ!`;
        }
        if (notificationTitle) {
          new Notification(notificationTitle, { body: `Prazo: ${task.dueDate}` });
        }
      }
    });
  }
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        checkDueDates();
        setInterval(checkDueDates, 60 * 60 * 1000);
      }
    });
  }

  function initializeApp() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.username) {
      tasksCache = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`)) || [];
      showMainAppPanel();
    } else {
      showLoginPanel();
      tasksCache = [];
    }
    renderTasks();
    showWelcomeModal();
  }

  document.querySelectorAll('[title]').forEach(el => {
    if (bootstrap && bootstrap.Tooltip) {
      new bootstrap.Tooltip(el);
    }
  });

  initializeApp();
});