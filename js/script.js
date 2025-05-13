document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");
  const mainPanel = document.getElementById("main-panel");

  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");
  const forgotPasswordLink = document.getElementById("forgot-password");
  const logoutBtn = document.getElementById("logout-btn");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const forgotPasswordForm = document.getElementById("forgot-password-form");
  const taskForm = document.getElementById("task-form");
  const taskList = document.getElementById("task-list");
  const searchTasksInput = document.getElementById("search-tasks");
  const filterStatusSelect = document.getElementById("filter-status");
  const exportTasksBtn = document.getElementById("export-tasks");

  const messageDiv = document.getElementById("message");

  // --- Estado da Aplicação ---
  let editingTaskIndex = null;
  let tasksCache = JSON.parse(localStorage.getItem("tasks")) || [];

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

  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  const showUIMessage = (msg, isError = true) => {
    if (!messageDiv) return;
    messageDiv.textContent = msg;
    messageDiv.className = isError ? "alert alert-danger text-center" : "alert alert-success text-center";
    messageDiv.classList.remove("d-none");
    messageDiv.setAttribute("role", "alert");
    messageDiv.tabIndex = -1; // Permite foco programático
    messageDiv.focus();
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.classList.add("d-none");
            messageDiv.textContent = "";
        }
    }, 4000);
  };

  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasksCache));
  };

  const updateProgress = () => {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");
    if (!progressBar || !progressText) return;

    const completed = tasksCache.filter(task => task.status === "concluída").length;
    const total = tasksCache.length;
    const progress = total ? (completed / total) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", progress);
    progressText.textContent = `${completed} de ${total} tarefas concluídas`;
  };

  const filterTasksByStatus = (status = "todos") => {
    return status === "todos" ? tasksCache : tasksCache.filter(task => task.status === status);
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

  // --- Funções de Controle de UI (Painéis) ---
  function showLoginPanel() {
      if (loginContainer) loginContainer.style.display = "block";
      if (registerContainer) registerContainer.style.display = "none";
      if (mainPanel) mainPanel.style.display = "none";
  }
  function showRegisterPanel() {
      if (loginContainer) loginContainer.style.display = "none";
      if (registerContainer) registerContainer.style.display = "block";
      if (mainPanel) mainPanel.style.display = "none";
  }
  function showMainAppPanel() {
      if (loginContainer) loginContainer.style.display = "none";
      if (registerContainer) registerContainer.style.display = "none";
      if (mainPanel) mainPanel.style.display = "block";
  }

  // --- Inicialização e Event Listeners ---

  // Modal de Boas-vindas (apenas na primeira visita)
  if (!localStorage.getItem("welcomeShown")) {
    const welcomeModalElement = document.getElementById("welcomeModal");
    if (welcomeModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        try {
            new bootstrap.Modal(welcomeModalElement).show();
            localStorage.setItem("welcomeShown", "true");
        } catch (e) {
            console.error("Erro ao mostrar modal de boas-vindas:", e);
        }
    }
  }

  // Navegação entre Login e Cadastro
  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRegisterPanel();
    });
  }
  if (showLoginLink) {
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginPanel();
    });
  }

  // Funcionalidade "Esqueci Minha Senha"
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      const forgotPasswordModalElement = document.getElementById("forgotPasswordModal");
      if (forgotPasswordModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          try {
            new bootstrap.Modal(forgotPasswordModalElement).show();
          } catch (e) {
            console.error("Erro ao mostrar modal de esquecer senha:", e);
          }
      }
    });
  }
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("forgot-email");
      if (!emailInput) return;
      const email = emailInput.value.trim();

      if (!emailRegex.test(email)) {
        showUIMessage("E-mail inválido.");
        return;
      }
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.email === email);
      if (user) {
        showUIMessage("Instruções de recuperação enviadas para o e-mail!", false);
      } else {
        showUIMessage("E-mail não encontrado.");
      }
      const forgotPasswordModalElement = document.getElementById("forgotPasswordModal");
      if (forgotPasswordModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalInstance = bootstrap.Modal.getInstance(forgotPasswordModalElement);
        if (modalInstance) modalInstance.hide();
      }
      emailInput.value = "";
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      tasksCache = JSON.parse(localStorage.getItem("tasks")) || [];
      showLoginPanel();
      renderTasks();
      showUIMessage("Você saiu do sistema.", false);
    });
  }

  // Formulário de Cadastro
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById("register-username");
      const emailInput = document.getElementById("register-email");
      const passwordInput = document.getElementById("register-password");
      const confirmPasswordInput = document.getElementById("register-password-confirm");

      if(!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) return;
      [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => input.classList.remove("is-invalid"));

      if (!usernameRegex.test(usernameInput.value.trim())) {
        usernameInput.classList.add("is-invalid");
        showUIMessage("Nome de usuário inválido. Use 3 a 15 letras ou números.");
        return;
      }
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        showUIMessage("E-mail inválido.");
        return;
      }
      if (!passwordRegex.test(passwordInput.value.trim())) {
        passwordInput.classList.add("is-invalid");
        showUIMessage("Senha inválida. Mínimo 6 caracteres, com pelo menos uma letra e um número.");
        return;
      }
      if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
        confirmPasswordInput.classList.add("is-invalid");
        showUIMessage("As senhas não coincidem.");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.some(u => u.email === emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        showUIMessage("Este e-mail já está cadastrado.");
        return;
      }
      if (users.some(u => u.username === usernameInput.value.trim())) {
        usernameInput.classList.add("is-invalid");
        showUIMessage("Nome de usuário já existe.");
        return;
      }

      const hashedPassword = await hashPassword(passwordInput.value.trim());
      users.push({ username: usernameInput.value.trim(), email: emailInput.value.trim(), password: hashedPassword });
      localStorage.setItem("users", JSON.stringify(users));

      showUIMessage("Cadastro realizado com sucesso!", false);
      showLoginPanel();
      registerForm.reset();
    });
  }

  // Formulário de Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById("login-username");
      const passwordInput = document.getElementById("login-password");
      const loginButton = document.getElementById("login-btn");
      const spinner = loginButton ? loginButton.querySelector(".spinner-border") : null;

      if (!usernameInput || !passwordInput || !loginButton) return;
      usernameInput.classList.remove("is-invalid");
      passwordInput.classList.remove("is-invalid");

      if (spinner) spinner.classList.remove("d-none");
      loginButton.disabled = true;

      const hashedPassword = await hashPassword(passwordInput.value.trim());
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.username === usernameInput.value.trim() && u.password === hashedPassword);
      
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        tasksCache = JSON.parse(localStorage.getItem("tasks")) || [];
        showMainAppPanel();
        renderTasks();
        loginForm.reset();
      } else {
        usernameInput.classList.add("is-invalid");
        passwordInput.classList.add("is-invalid");
        showUIMessage("Usuário ou senha inválidos.");
      }
      if (spinner) spinner.classList.add("d-none");
      loginButton.disabled = false;
    });
  }

  // Formulário de Tarefas (Criar/Editar)
  if (taskForm) {
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const titleInput = document.getElementById("title");
      const descriptionInput = document.getElementById("description");
      const dueDateInput = document.getElementById("dueDate");
      const priorityInput = document.getElementById("priority");
      const statusInput = document.getElementById("status");
      const categoryInput = document.getElementById("category");
      const tagsInputEl = document.getElementById("tags");
      const submitButton = taskForm.querySelector('button[type="submit"]');

      if(!titleInput || !descriptionInput || !dueDateInput || !priorityInput || !statusInput || !categoryInput || !tagsInputEl || !submitButton) return;

      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const dueDate = dueDateInput.value;
      const priority = priorityInput.value;
      const status = statusInput.value;
      const category = categoryInput.value.trim();
      const tagsValue = tagsInputEl.value.trim();
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

      const taskObj = { title, description, dueDate, priority, status, category, tags };
      if (editingTaskIndex !== null) {
        tasksCache[editingTaskIndex] = taskObj;
        editingTaskIndex = null;
        submitButton.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Criar Tarefa';
      } else {
        tasksCache.push(taskObj);
      }

      saveTasks();
      taskForm.reset();
      showUIMessage("Tarefa salva com sucesso!", false);
      renderTasks();
    });
  }
  
  // Delegação de Eventos para Ações nas Tarefas (Editar/Excluir)
  function handleTaskActions(event) {
    const target = event.target.closest('button');
    if (!target) return;

    const index = parseInt(target.dataset.index, 10);
    if (isNaN(index) || index < 0 || index >= tasksCache.length) {
        console.error("Índice de tarefa inválido:", index);
        return;
    }

    if (target.classList.contains("edit-btn")) {
      editTask(index);
    } else if (target.classList.contains("delete-btn")) {
      confirmTaskDeletion(index);
    }
  }
  
  // Renderização da Lista de Tarefas
  function renderTasks(tasksToDisplay = tasksCache) {
    if (!taskList) return;
    taskList.innerHTML = "";

    if (tasksToDisplay.length === 0) {
        taskList.innerHTML = '<p class="text-center text-muted">Nenhuma tarefa para exibir.</p>';
    } else {
        tasksToDisplay.forEach((task) => {
            const originalIndex = tasksCache.findIndex(t => t === task);
            if (originalIndex === -1) return; 

            const div = document.createElement("div");
            div.className = "border rounded p-3 mb-3 task-item";
            div.setAttribute("role", "listitem");
            div.setAttribute("data-priority", task.priority);
            div.setAttribute("data-status", task.status);

            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="mb-0">${sanitizeInput(task.title)}</h5>
                    <div>
                        <button class="btn btn-warning btn-sm me-2 edit-btn" data-index="${originalIndex}" aria-label="Editar tarefa ${sanitizeInput(task.title)}"><i class="bi bi-pencil-fill"></i></button>
                        <button class="btn btn-danger btn-sm delete-btn" data-index="${originalIndex}" aria-label="Excluir tarefa ${sanitizeInput(task.title)}"><i class="bi bi-trash-fill"></i></button>
                    </div>
                </div>
                <p class="mb-1 description-text">${sanitizeInput(task.description)}</p>
                <small class="text-muted d-block"><strong>Prazo:</strong> ${sanitizeInput(task.dueDate)}</small>
                <small class="text-muted d-block"><strong>Prioridade:</strong> ${sanitizeInput(task.priority)} | <strong>Status:</strong> ${sanitizeInput(task.status)}</small>
                ${task.category ? `<small class="text-muted d-block"><strong>Categoria:</strong> ${sanitizeInput(task.category)}</small>` : ''}
                ${task.tags && task.tags.length > 0 ? `<small class="text-muted d-block"><strong>Tags:</strong> ${task.tags.map(sanitizeInput).join(", ")}</small>` : ''}
            `;
            taskList.appendChild(div);
        });
    }
    taskList.removeEventListener('click', handleTaskActions); // Evita múltiplos listeners
    taskList.addEventListener('click', handleTaskActions);

    updateProgress();
  }

  // Confirmação e Exclusão de Tarefa
  function confirmTaskDeletion(index) {
    const deleteModalElement = document.getElementById("deleteModal");
    const confirmDeleteButton = document.getElementById("confirmDelete");

    if (!deleteModalElement || !confirmDeleteButton || typeof bootstrap === 'undefined' || !bootstrap.Modal) return;
    
    const taskToDelete = tasksCache[index];
    const modalBody = deleteModalElement.querySelector('.modal-body');
    if (modalBody && taskToDelete) {
        modalBody.textContent = `Deseja realmente excluir a tarefa "${sanitizeInput(taskToDelete.title)}"?`;
    } else if (modalBody) {
        modalBody.textContent = "Deseja realmente excluir esta tarefa?";
    }

    const modal = bootstrap.Modal.getOrCreateInstance(deleteModalElement);

    // Reanexar o listener do botão de confirmação para evitar execuções múltiplas
    const newConfirmDeleteButton = confirmDeleteButton.cloneNode(true);
    confirmDeleteButton.parentNode.replaceChild(newConfirmDeleteButton, confirmDeleteButton);
    
    newConfirmDeleteButton.addEventListener('click', function onConfirm() {
        tasksCache.splice(index, 1);
        saveTasks();
        showUIMessage("Tarefa removida com sucesso!", false);
        // Re-renderizar mantendo os filtros/busca atuais
        const currentFilterStatus = filterStatusSelect ? filterStatusSelect.value : "todos";
        const currentSearchQuery = searchTasksInput ? searchTasksInput.value : "";
        let tasksToRenderAfterDelete = filterTasksByStatus(currentFilterStatus);
        if (currentSearchQuery) {
            tasksToRenderAfterDelete = filterTasksBySearchQuery(currentSearchQuery).filter(task => tasksToRenderAfterDelete.includes(task));
        }
        renderTasks(tasksToRenderAfterDelete);
        
        modal.hide();
    }, { once: true }); // { once: true } garante que o listener execute apenas uma vez

    modal.show();
  }

  // Edição de Tarefa
  function editTask(index) {
    const task = tasksCache[index];
    if (!task) return;

    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const dueDateInput = document.getElementById("dueDate");
    const priorityInput = document.getElementById("priority");
    const statusInput = document.getElementById("status");
    const categoryInput = document.getElementById("category");
    const tagsInputEl = document.getElementById("tags");
    const submitButton = taskForm ? taskForm.querySelector('button[type="submit"]') : null;

    if(!titleInput || !descriptionInput || !dueDateInput || !priorityInput || !statusInput || !categoryInput || !tagsInputEl || !submitButton) return;

    titleInput.value = task.title;
    descriptionInput.value = task.description;
    dueDateInput.value = task.dueDate;
    priorityInput.value = task.priority;
    statusInput.value = task.status;
    categoryInput.value = task.category || "";
    tagsInputEl.value = task.tags ? task.tags.join(", ") : "";
    editingTaskIndex = index;

    submitButton.innerHTML = '<i class="bi bi-save me-1"></i> Salvar Alterações';
    titleInput.focus(); // Foco no campo título para facilitar a edição
    showUIMessage(`Editando tarefa: "${sanitizeInput(task.title)}" ...`, false);
  }

  // Filtro de Tarefas por Status
  if (filterStatusSelect) {
    filterStatusSelect.addEventListener("change", (e) => {
      const status = e.target.value;
      const query = searchTasksInput ? searchTasksInput.value : "";
      let filteredTasks = filterTasksByStatus(status);
      if (query) {
          filteredTasks = filterTasksBySearchQuery(query).filter(task => filteredTasks.includes(task));
      }
      renderTasks(filteredTasks);
    });
  }

  // Busca de Tarefas
  if (searchTasksInput) {
    searchTasksInput.addEventListener("input", debounce((e) => {
      const query = e.target.value;
      const status = filterStatusSelect ? filterStatusSelect.value : "todos";
      let searchedTasks = filterTasksBySearchQuery(query);
      if (status !== "todos") {
          searchedTasks = filterTasksByStatus(status).filter(task => searchedTasks.includes(task));
      }
      renderTasks(searchedTasks);
    }, 300));
  }

  // Exportação de Tarefas para CSV
  if (exportTasksBtn) {
    exportTasksBtn.addEventListener("click", () => {
      if (tasksCache.length === 0) {
        showUIMessage("Nenhuma tarefa para exportar.");
        return;
      }
      const escapeCsvField = (field) => `"${String(field || '').replace(/"/g, '""')}"`; // Escapa aspas duplas

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

  // Notificações de Prazos (Web Notifications API)
  function checkDueDates() {
    if (!('Notification' in window) || Notification.permission !== "granted") return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasksCache.forEach(task => {
      if (task.status !== "concluída" && task.dueDate) {
        const [year, month, day] = task.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0,0,0,0);

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
        setInterval(checkDueDates, 60 * 60 * 1000); // Verifica a cada hora
      }
    });
  }

  // --- Função de Inicialização da Aplicação ---
  function initializeApp() {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
          tasksCache = JSON.parse(localStorage.getItem("tasks")) || [];
          showMainAppPanel();
      } else {
          showLoginPanel();
          tasksCache = [];
      }
      renderTasks();
  }

  initializeApp();
});