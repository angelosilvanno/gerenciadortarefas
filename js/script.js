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
    // Login form inputs
    loginUsernameInput: document.getElementById("login-username"),
    loginPasswordInput: document.getElementById("login-password"),
    loginButton: document.getElementById("login-btn"),
    // Register form inputs
    registerUsernameInput: document.getElementById("register-username"),
    registerEmailInput: document.getElementById("register-email"),
    registerPasswordInput: document.getElementById("register-password"),
    registerConfirmPasswordInput: document.getElementById("register-password-confirm"),
    // Forgot password form inputs
    forgotEmailInput: document.getElementById("forgot-email"),
    // Task form inputs
    taskTitleInput: document.getElementById("title"),
    taskDescriptionInput: document.getElementById("description"),
    taskDueDateInput: document.getElementById("dueDate"),
    taskPriorityInput: document.getElementById("priority"),
    taskStatusInput: document.getElementById("status"),
    taskCategoryInput: document.getElementById("category"),
    taskTagsInput: document.getElementById("tags"),
  };

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

  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasksCache));
  };

  const updateProgress = () => {
    if (!DOM.progressBar || !DOM.progressText) return;
    const completed = tasksCache.filter(task => task.status === "concluída").length;
    const total = tasksCache.length;
    const progress = total ? (completed / total) * 100 : 0;
    DOM.progressBar.style.width = `${progress}%`;
    DOM.progressBar.setAttribute("aria-valuenow", progress);
    DOM.progressText.textContent = `${completed} de ${total} tarefas concluídas`;
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

  // --- Inicialização e Event Listeners ---

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
      if (DOM.forgotPasswordModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        try {
          new bootstrap.Modal(DOM.forgotPasswordModalElement).show();
        } catch (err) {
          console.error("Erro ao mostrar modal de esquecer senha:", err);
        }
      }
    });
  }
  if (DOM.forgotPasswordForm && DOM.forgotEmailInput) {
    DOM.forgotPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = DOM.forgotEmailInput.value.trim();

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
      tasksCache = JSON.parse(localStorage.getItem("tasks")) || []; // Reset local cache or fetch default
      showLoginPanel();
      renderTasks();
      showUIMessage("Você saiu do sistema.", false);
    });
  }

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

      const users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.some(u => u.email === email)) {
        DOM.registerEmailInput.classList.add("is-invalid");
        showUIMessage("Este e-mail já está cadastrado.");
        return;
      }
      if (users.some(u => u.username === username)) {
        DOM.registerUsernameInput.classList.add("is-invalid");
        showUIMessage("Nome de usuário já existe.");
        return;
      }

      const hashedPassword = await hashPassword(password);
      users.push({ username, email, password: hashedPassword });
      localStorage.setItem("users", JSON.stringify(users));

      showUIMessage("Cadastro realizado com sucesso!", false);
      showLoginPanel();
      DOM.registerForm.reset();
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
      const hashedPassword = await hashPassword(password);
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.username === username && u.password === hashedPassword);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        tasksCache = JSON.parse(localStorage.getItem(`tasks_${user.username}`)) || JSON.parse(localStorage.getItem("tasks")) || []; // Load user-specific tasks or general
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

        const taskObj = { title, description, dueDate, priority, status, category, tags };
        if (editingTaskIndex !== null) {
          tasksCache[editingTaskIndex] = taskObj;
          editingTaskIndex = null;
          submitButton.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Criar Tarefa';
        } else {
          tasksCache.push(taskObj);
        }

        saveTasks();
        DOM.taskForm.reset();
        showUIMessage("Tarefa salva com sucesso!", false);
        renderTasks();
      });
    }
  }

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

  function renderTasks(tasksToDisplay = tasksCache) {
    if (!DOM.taskList) return;
    DOM.taskList.innerHTML = "";
    const noTasksMessage = DOM.taskList.querySelector("#no-tasks-message") || document.createElement('p');
    noTasksMessage.id = "no-tasks-message";
    noTasksMessage.className = "text-center text-muted";
    noTasksMessage.textContent = "Nenhuma tarefa para exibir.";


    if (tasksToDisplay.length === 0) {
      DOM.taskList.appendChild(noTasksMessage);
      noTasksMessage.classList.remove('d-none');
    } else {
      noTasksMessage.classList.add('d-none'); // Hide if there are tasks
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
        DOM.taskList.appendChild(div);
      });
    }
    DOM.taskList.removeEventListener('click', handleTaskActions);
    DOM.taskList.addEventListener('click', handleTaskActions);

    updateProgress();
  }

  let currentDeleteHandler = null; // To manage the confirm delete event listener

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

    // Remove previous listener if any, then add the new one
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
    if (!task) return;
    const submitButton = DOM.taskForm ? DOM.taskForm.querySelector('button[type="submit"]') : null;

    if (!DOM.taskTitleInput || !DOM.taskDescriptionInput || !DOM.taskDueDateInput || !DOM.taskPriorityInput || !DOM.taskStatusInput || !DOM.taskCategoryInput || !DOM.taskTagsInput || !submitButton) return;

    DOM.taskTitleInput.value = task.title;
    DOM.taskDescriptionInput.value = task.description;
    DOM.taskDueDateInput.value = task.dueDate;
    DOM.taskPriorityInput.value = task.priority;
    DOM.taskStatusInput.value = task.status;
    DOM.taskCategoryInput.value = task.category || "";
    DOM.taskTagsInput.value = task.tags ? task.tags.join(", ") : "";
    editingTaskIndex = index;

    submitButton.innerHTML = '<i class="bi bi-save me-1"></i> Salvar Alterações';
    DOM.taskTitleInput.focus();
    showUIMessage(`Editando tarefa: "${sanitizeInput(task.title)}" ...`, false);
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
      if (task.status !== "concluída" && task.dueDate) {
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
    if (currentUser) {
      tasksCache = JSON.parse(localStorage.getItem(`tasks_${currentUser.username}`)) || JSON.parse(localStorage.getItem("tasks")) || [];
      showMainAppPanel();
    } else {
      showLoginPanel();
      tasksCache = [];
    }
    renderTasks();
  }

  initializeApp();
});