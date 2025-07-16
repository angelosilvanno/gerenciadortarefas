if (typeof document !== "undefined") {
document.addEventListener("DOMContentLoaded", () => {
  const apiService = {
    BASE_URL: "http://localhost:3000/api",

    async _fetch(endpoint, options = {}) {
      const currentUserData = JSON.parse(localStorage.getItem("currentUser"));
      const token = currentUserData?.token;
  
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
  
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
  
      try {
        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
          method: options.method || 'GET',
          headers,
          body: options.body,
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || 'Ocorreu um erro na comunicação com o servidor.');
        }
  
        return response.status === 204 ? {} : await response.json();
      } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
      }
    }, 
  
    login: (username, password) =>
      apiService._fetch("/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      }),
  
    register: (username, email, password) =>
      apiService._fetch("/cadastrar", {
        method: "POST",
        body: JSON.stringify({ username, email, password })
      }),
  
    getTasks: () => apiService._fetch("/tasks"),
  
    createTask: (taskData) =>
      apiService._fetch("/tasks", {
        method: "POST",
        body: JSON.stringify(taskData)
      }),
  
    updateTask: (taskId, updateData) =>
      apiService._fetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(updateData)
      }),
  
    deleteTask: (taskId) =>
      apiService._fetch(`/tasks/${taskId}`, {
        method: "DELETE"
      }),
  
    getComments: (taskId) => apiService._fetch(`/tasks/${taskId}/comments`),
  
    addComment: (taskId, content) =>
      apiService._fetch(`/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content })
      }),
    
    deleteComment: (taskId, commentId) =>
      apiService._fetch(`/tasks/${taskId}/comments/${commentId}`, {
        method: "DELETE"
      }),
  
    getHistory: (taskId) => apiService._fetch(`/tasks/${taskId}/history`),
  };
  
  
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
    filterPrioritySelect: document.getElementById("filter-priority"),
    filterCategoryInput: document.getElementById("filter-category"),
    filterDueDateInput: document.getElementById("filter-dueDate"),
    searchTasksInput: document.getElementById("search-tasks"),
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
    taskCategoryInput: document.getElementById("category"),
    editTitleInput: document.getElementById('edit-title'),
    editDescriptionInput: document.getElementById('edit-description'),
    editDueDateInput: document.getElementById('edit-dueDate'),
    editPriorityInput: document.getElementById('edit-priority'),
    editStatusInput: document.getElementById('edit-status'),
    editCategoryInput: document.getElementById('edit-category'),
    themeToggleButton: document.getElementById("theme-toggle-btn"),
    clearCompletedBtn: document.getElementById("clear-completed-btn"),
    loginEyeBtn: document.getElementById('login-eye-btn'),
    registerEyeBtn: document.getElementById('register-eye-btn'),
    confirmRegisterEyeBtn: document.getElementById('confirm-register-eye-btn'),
    taskListTitle: document.querySelector("#main-panel h5"),
    commentsList: document.getElementById('comments-list'),
    historyList: document.getElementById('history-list'),
    addCommentForm: document.getElementById('add-comment-form'),
    commentTextInput: document.getElementById('comment-text'),
    addCommentButton: document.querySelector('#add-comment-form button[type="submit"]'),
    taskDateTimeInput: document.getElementById("dateTime"),
    taskReminderSelect: document.getElementById("reminderMinutes"),  
    editDateTimeInput: document.getElementById("edit-dateTime"),
    editDueTimeInput: document.getElementById("edit-dueTime"),
    editReminderSelect: document.getElementById("edit-reminder-minutes"),
  };

  let editingTask = null;
  let tasksCache = [];
  window.tasksCache = tasksCache;

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,80}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const sanitizeInput = (input) => {
    if (typeof input !== 'string' && typeof input !== 'number') return '';
    const div = document.createElement("div");
    div.textContent = String(input);
    return div.innerHTML;
  };
  
  const showUIMessage = (msg, isError = true, onTop = false) => {
    if (!DOM.messageDiv) return;

    DOM.messageDiv.style.zIndex = onTop ? '1060' : '1050';

    DOM.messageDiv.textContent = msg;
    DOM.messageDiv.className = `alert ${isError ? "alert-danger" : "alert-success"} text-center shadow p-3`;
    DOM.messageDiv.classList.remove("d-none");
    DOM.messageDiv.setAttribute("role", "alert");
    DOM.messageDiv.tabIndex = -1;
    DOM.messageDiv.focus();
    
    setTimeout(() => {
      if (DOM.messageDiv) {
        DOM.messageDiv.classList.add("d-none");
        DOM.messageDiv.style.zIndex = 'auto'; 
      }
    }, 4000);
  };
  
  function updateLogoForTheme() {
    const logo = document.getElementById("logo-switch");
    const isDark = document.body.classList.contains("dark-mode");
    if (logo) {
      logo.src =isDark ? "image/img-dark.png" : "image/img.png";
    }
  }

  const applyTheme = (theme) => {
    const body = document.body;
    if (!DOM.themeToggleButton) return;
    const icon = DOM.themeToggleButton.querySelector('i');

    if (theme === 'dark') {
      body.classList.add('dark-mode');
      icon.classList.remove('bi-moon-fill');
      icon.classList.add('bi-sun-fill');
      DOM.themeToggleButton.setAttribute('title', 'Alternar para modo claro');
    } else {
      body.classList.remove('dark-mode');
      icon.classList.remove('bi-sun-fill');
      icon.classList.add('bi-moon-fill');
      DOM.themeToggleButton.setAttribute('title', 'Alternar para modo escuro');
    }

    updateLogoForTheme();

    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      const tooltipInstance = bootstrap.Tooltip.getInstance(DOM.themeToggleButton);
      if (tooltipInstance) tooltipInstance.dispose();
      new bootstrap.Tooltip(DOM.themeToggleButton);
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

  const filterAndRender = () => {
    let filteredTasks = [...tasksCache];

    const searchQuery = DOM.searchTasksInput?.value.toLowerCase().trim() || "";
    const statusFilter = DOM.filterStatusSelect?.value || "";
    const priorityFilter = DOM.filterPrioritySelect?.value || "";
    const categoryFilter = DOM.filterCategoryInput?.value.toLowerCase().trim() || "";
    const dueDateFilter = DOM.filterDueDateInput?.value || "";

    if (statusFilter && statusFilter !== "todos") {
      filteredTasks = filteredTasks.filter(task => normalizeStatus(task.status) === normalizeStatus(statusFilter));
    }

    if (priorityFilter) {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    if (categoryFilter) {
      filteredTasks = filteredTasks.filter(task =>
        task.category && task.category.toLowerCase().includes(categoryFilter)
      );
    }

    if (dueDateFilter) {
      filteredTasks = filteredTasks.filter(task => task.due_date === dueDateFilter);
    }

    if (searchQuery) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery)
      );
    }

    renderTasks(filteredTasks);
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const setupPasswordToggle = (inputEl, buttonEl) => {
    if (!inputEl || !buttonEl) return;
    buttonEl.addEventListener('click', () => {
      const icon = buttonEl.querySelector('i');
      if (inputEl.type === 'password') {
        inputEl.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      } else {
        inputEl.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      }
    });
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
          const modal = bootstrap.Modal.getOrCreateInstance(DOM.welcomeModalElement);
          modal.show();
          localStorage.setItem("welcomeShown", "true");
        } catch (e) { console.error("Erro ao mostrar modal de boas-vindas:", e); }
      }
    }
  }

  function showForgotPasswordModal() {
    if (DOM.forgotPasswordModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      try {
        const modal = bootstrap.Modal.getOrCreateInstance(DOM.forgotPasswordModalElement);
        modal.show();
      } catch (err) { console.error("Erro ao mostrar modal de esquecer senha:", err); }
    }
  }

  function normalizeStatus(status) {
    if (typeof status !== 'string') return "";
    return status.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
  }
  
  async function loadAndRenderTasks() {
    try {
      const tasksFromServer = await apiService.getTasks();
  
      tasksCache = tasksFromServer.map(task => ({
        ...task,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : null
      }));
  
      window.tasksCache = tasksCache;
  
      console.log("tasksCache atualizado:", tasksCache); 
      filterAndRender();
  
      if ("Notification" in window && Notification.permission === "granted") {
        setInterval(verificarLembretes, 60000);
      }
  
    } catch (error) {
      showUIMessage(error.message || "Falha ao carregar as tarefas.", true);
      if (String(error.message).includes('Acesso negado') || String(error.message).includes('inválido')) {
        handleLogout();
      }
    }
  }
      
  function handleLogout() {
    localStorage.removeItem("currentUser");
    tasksCache = [];
    showLoginPanel();
    if (DOM.taskList) DOM.taskList.innerHTML = "";
    updateProgress();
    showUIMessage("Você saiu do sistema.", false);
  }

  function renderTasks(tasksToDisplay) {
    if (!DOM.taskList) return;
    const statusClassMap = { pendente: "task-status-pendente", emandamento: "task-status-em-andamento", concluida: "task-status-concluida" };
    DOM.taskList.innerHTML = "";
    if (!Array.isArray(tasksToDisplay) || tasksToDisplay.length === 0) {
      DOM.taskList.innerHTML = '<p class="text-center text-muted" id="no-tasks-message">Nenhuma tarefa para exibir.</p>';
      updateProgress();
      return;
    }
    const groupedByDate = {};
    tasksToDisplay.forEach(task => {
      const dateKey = task.due_date || 'Data Inválida';
      if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
      groupedByDate[dateKey].push(task);
    });
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
      if (a === 'Data Inválida') return 1; if (b === 'Data Inválida') return -1;
      return new Date(a) - new Date(b);
    });
    sortedDates.forEach(date => {
      let formattedDate = date;
      if (date !== 'Data Inválida') { const [y, m, d] = date.split("-"); formattedDate = `${d}/${m}/${y}`; }
      const dateHeaderWrapper = document.createElement("div");
      dateHeaderWrapper.className = "mt-4 mb-2 d-flex align-items-center justify-content-start";
      const datePill = document.createElement("span");
      datePill.className = "date-pill";
      datePill.innerHTML = `🗓️ ${formattedDate}`;
      dateHeaderWrapper.appendChild(datePill);
      DOM.taskList.appendChild(dateHeaderWrapper);
      groupedByDate[date].forEach(task => {
        const div = document.createElement("div");
        div.classList.add("task-card", "card", "p-3", "mb-2");
        if (task.due_date) {
            const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
            const [ano, mes, dia] = task.due_date.split("-").map(Number);
            const dataTarefa = new Date(ano, mes - 1, dia);
            if (dataTarefa < hoje && normalizeStatus(task.status) !== "concluida") { div.classList.add("tarefa-atrasada"); }
        }
        const normStatus = normalizeStatus(task.status);
        if (statusClassMap[normStatus]) { div.classList.add(statusClassMap[normStatus]); }
        div.setAttribute("role", "listitem");
        div.setAttribute("data-priority", task.priority);
        div.setAttribute("data-status", task.status);
        div.setAttribute("data-id", task.id);
        const categoryHtml = task.category ? `<span class="task-category-badge" data-category="${sanitizeInput(task.category)}">${sanitizeInput(task.category)}</span>` : "";
        const metaHtml = categoryHtml ? `<div class="task-meta-wrapper">${categoryHtml}</div>` : "";
        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center flex-grow-1">
              ${normStatus === "concluida" ? `<i class="bi bi-check-circle-fill text-success me-2 fs-5" title="Tarefa concluída"></i>` : `<input type="checkbox" class="form-check-input me-2 complete-checkbox" data-id="${task.id}" ${task.status === "concluída" ? "checked" : ""} aria-label="Marcar tarefa como concluída">`}
              <h5 class="mb-0 flex-grow-1 task-title" style="word-break: break-word;">${sanitizeInput(task.title)}</h5>
            </div>
            <div>
              <button class="btn btn-warning btn-sm me-2 edit-btn" data-id="${task.id}" title="Editar tarefa"><i class="bi bi-pencil-fill"></i></button>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${task.id}" title="Excluir tarefa"><i class="bi bi-trash-fill"></i></button>
            </div>
          </div>
          <p class="mb-1 description-text">${sanitizeInput(task.description)}</p>
          <small class="text-muted d-block">
              <strong>Prazo:</strong> ${task.due_date ? formattedDate : 'N/A'} |
              <strong>Hora:</strong> ${task.date_time ? new Date(task.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </small>
          <small class="text-muted d-block"><strong>Prioridade:</strong> ${sanitizeInput(task.priority)} | <strong>Status:</strong> ${sanitizeInput(task.status)}</small>
          ${metaHtml}
        `;
        DOM.taskList.appendChild(div);
      });
    });
    updateProgress();
  }

  async function loadComments(taskId) {
    if (!DOM.commentsList) return;
    DOM.commentsList.innerHTML = '<p class="text-center text-muted">Carregando...</p>';
    try {
      const comments = await apiService.getComments(taskId);
      DOM.commentsList.innerHTML = '';

      if (comments.length === 0) {
        DOM.commentsList.innerHTML = '<p class="text-center text-muted">Nenhum comentário ainda.</p>';
        return;
      }

      const currentUserData = JSON.parse(localStorage.getItem("currentUser"));
      const currentUserId = currentUserData?.user?.id;

      comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item mb-2 p-2 border rounded small';

        const deleteButtonHtml = (currentUserId === comment.user_id)
          ? `<button class="btn btn-outline-danger btn-sm py-0 px-1 float-end delete-comment-btn" data-comment-id="${comment.id}" title="Excluir Comentário">
              <i class="bi bi-trash-fill"></i>
            </button>`
          : '';

        const formattedDate = new Date(comment.created_at).toLocaleString('pt-BR');
        
        commentDiv.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <strong class="comment-author">${sanitizeInput(comment.user_name)}</strong>
            ${deleteButtonHtml}
          </div>
          <p class="mb-1 mt-1 comment-content">${sanitizeInput(comment.content)}</p>
          <small class="text-muted comment-date">${formattedDate}</small>
        `;
        DOM.commentsList.appendChild(commentDiv);
      });
    } catch (error) {
      DOM.commentsList.innerHTML = '<p class="text-center text-danger">Falha ao carregar comentários.</p>';
    }
  }

  async function loadHistory(taskId) {
    if (!DOM.historyList) return;
    DOM.historyList.innerHTML = '<p class="text-center text-muted">Carregando...</p>';
    try {
      const historyLogs = await apiService.getHistory(taskId);
      DOM.historyList.innerHTML = '';
      if (historyLogs.length === 0) {
        DOM.historyList.innerHTML = '<p class="text-center text-muted">Nenhum histórico para esta tarefa.</p>';
        return;
      }
      historyLogs.forEach(log => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'mb-2 p-2 border rounded small';
        const formattedDate = new Date(log.created_at).toLocaleString('pt-BR');
        historyDiv.innerHTML = `
          <p class="mb-0"><strong>${sanitizeInput(log.user_name)}</strong> ${sanitizeInput(log.description)}</p>
          <small class="text-muted">${formattedDate}</small>
        `;
        DOM.historyList.appendChild(historyDiv);
      });
    } catch (error) {
      DOM.historyList.innerHTML = '<p class="text-center text-danger">Falha ao carregar histórico.</p>';
    }
  }

  if (DOM.themeToggleButton) DOM.themeToggleButton.addEventListener("click", () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const newTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });

  if (DOM.showRegisterLink) DOM.showRegisterLink.addEventListener("click", (e) => { e.preventDefault(); showRegisterPanel(); });
  if (DOM.showLoginLink) DOM.showLoginLink.addEventListener("click", (e) => { e.preventDefault(); showLoginPanel(); });
  if (DOM.logoutBtn) DOM.logoutBtn.addEventListener("click", handleLogout);
  if (DOM.forgotPasswordLink) DOM.forgotPasswordLink.addEventListener("click", (e) => { e.preventDefault(); showForgotPasswordModal(); });

  if (DOM.forgotPasswordForm) {
    DOM.forgotPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showUIMessage("Funcionalidade de recuperação de senha em desenvolvimento.", false);
      const modalInstance = bootstrap.Modal.getInstance(DOM.forgotPasswordModalElement);
      if (modalInstance) modalInstance.hide();
      DOM.forgotEmailInput.value = "";
    });
  }

  if (DOM.registerForm) {
    DOM.registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = [ DOM.registerUsernameInput, DOM.registerEmailInput, DOM.registerPasswordInput, DOM.registerConfirmPasswordInput ];
      inputs.forEach(input => input.classList.remove("is-invalid"));
      const username = DOM.registerUsernameInput.value.trim();
      const email = DOM.registerEmailInput.value.trim();
      const password = DOM.registerPasswordInput.value;
      const confirmPassword = DOM.registerConfirmPasswordInput.value;
      if (!usernameRegex.test(username)) return showUIMessage("Nome de usuário inválido. Use 3 a 15 letras ou números.");
      if (!emailRegex.test(email)) return showUIMessage("E-mail inválido.");
      if (!passwordRegex.test(password)) return showUIMessage("Senha inválida. Sua senha deve ter entre 6 a 80 caracteres, com pelo menos uma letra e um número.");
      if (password !== confirmPassword) return showUIMessage("As senhas não coincidem.");
      try {
        await apiService.register(username, email, password);
        showUIMessage("Cadastro realizado com sucesso! Faça o login.", false);
        showLoginPanel();
        DOM.registerForm.reset();
      } catch (err) {
        showUIMessage(err.message || "Erro ao tentar se cadastrar.", true);
      }
    });
  }

  if (DOM.loginForm) {
    DOM.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      DOM.loginUsernameInput.classList.remove("is-invalid");
      DOM.loginPasswordInput.classList.remove("is-invalid");
      DOM.loginButton.disabled = true;
      const username = DOM.loginUsernameInput.value.trim();
      const password = DOM.loginPasswordInput.value;
      try {
        const data = await apiService.login(username, password);
        localStorage.setItem("currentUser", JSON.stringify({ user: data.user, token: data.token }));
        showMainAppPanel();
        document.getElementById("main-header").style.display = "flex";
        await loadAndRenderTasks();
        DOM.loginForm.reset();
      } catch (error) {
        DOM.loginUsernameInput.classList.add("is-invalid");
        DOM.loginPasswordInput.classList.add("is-invalid");
        showUIMessage(error.message || "Usuário e/ou senha inválidos.");
      } finally {
        DOM.loginButton.disabled = false;
      }
    });
  }

  if (DOM.taskForm) {
    DOM.taskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const taskData = {
        title: DOM.taskTitleInput.value.trim(),
        description: DOM.taskDescriptionInput.value.trim(),
        due_date: DOM.taskDateTimeInput.value ? DOM.taskDateTimeInput.value.split('T')[0] : null,
        date_time: DOM.taskDateTimeInput.value || null,
        reminder_minutes: parseInt(DOM.taskReminderSelect.value) || 15,
        priority: DOM.taskPriorityInput.value,
        status: "pendente",
        category: DOM.taskCategoryInput.value.trim()
      };

      if (taskData.date_time) {
        const now = new Date();
        const taskDateTime = new Date(taskData.date_time);
        if (taskDateTime < now) {
          return showUIMessage("A data e hora da tarefa não podem estar no passado.", true);
        }
      }
  
      if (!taskData.title || !taskData.description || !taskData.due_date) {
        return showUIMessage("Preencha os campos obrigatórios: Título, Descrição e Prazo.");
      }
  
      const currentUserData = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUserData || !currentUserData.token) {
        return showUIMessage("Você precisa estar logado para criar tarefas.", "danger");
      }
  
      try {
        await apiService.createTask(taskData);
        showUIMessage("Tarefa criada com sucesso!", false);
        DOM.taskForm.reset();
        await loadAndRenderTasks();
      } catch (error) {
        showUIMessage(error.message || "Erro ao criar tarefa.");
      }
    });
  }
  
  if (DOM.editTaskForm) {
    DOM.editTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!editingTask) return showUIMessage("Erro: Nenhuma tarefa selecionada para edição.", true, true);

      const updatedData = {
        title: DOM.editTitleInput.value.trim(),
        description: DOM.editDescriptionInput.value.trim(),
        due_date: DOM.editDueDateInput.value,
        date_time:
          DOM.editDueDateInput.value && DOM.editDueTimeInput.value
            ? `${DOM.editDueDateInput.value}T${DOM.editDueTimeInput.value}`
            : null,
        reminder_minutes: parseInt(DOM.editReminderSelect.value) || null,
        priority: DOM.editPriorityInput.value,
        status: DOM.editStatusInput.value,
        category: DOM.editCategoryInput.value.trim()
      };

      if (updatedData.date_time) {
        const now = new Date();
        const taskDateTime = new Date(updatedData.date_time);
        if (taskDateTime < now) {
          return showUIMessage("A data e hora da tarefa não podem estar no passado.", true, true);
        }
      }

      if (!updatedData.title || !updatedData.description || !updatedData.due_date) {
        return showUIMessage("Preencha os campos obrigatórios: Título, Descrição e Prazo.", true, true);
      }

      try {
        await apiService.updateTask(editingTask.id, updatedData);
        showUIMessage("Tarefa atualizada com sucesso!", false); 
        const modalInstance = bootstrap.Modal.getInstance(DOM.editTaskModalElement);
        if (modalInstance) modalInstance.hide();
        editingTask = null;
        await loadAndRenderTasks();
      } catch (error) {
        showUIMessage(error.message || "Erro ao atualizar tarefa.", true, true);
      }
    });
  }
  
  let currentDeleteHandler = null;
  let currentCommentDeleteHandler = null;

  function confirmTaskDeletion(task) {
    if (!DOM.deleteModalElement || !DOM.confirmDeleteButton) return;
    const modalBody = DOM.deleteModalElement.querySelector('.modal-body');
    if (modalBody) modalBody.textContent = `Deseja realmente excluir a tarefa "${sanitizeInput(task.title)}"?`;
    const modal = bootstrap.Modal.getOrCreateInstance(DOM.deleteModalElement);
    if (currentDeleteHandler) {
      DOM.confirmDeleteButton.removeEventListener('click', currentDeleteHandler);
    }
    currentDeleteHandler = async () => {
      try {
        await apiService.deleteTask(task.id);
        showUIMessage("Tarefa removida com sucesso!", false);
        await loadAndRenderTasks();
      } catch (error) { showUIMessage(error.message || "Erro ao remover tarefa."); }
      modal.hide();
    };
    DOM.confirmDeleteButton.addEventListener('click', currentDeleteHandler, { once: true });
    modal.show();
  }

  function confirmCommentDeletion(commentId) {
    if (!DOM.deleteModalElement || !DOM.confirmDeleteButton) return;
    
    const modalBody = DOM.deleteModalElement.querySelector('.modal-body');
    if (modalBody) {
      modalBody.textContent = "Deseja realmente excluir este comentário?";
    }

    const modal = bootstrap.Modal.getOrCreateInstance(DOM.deleteModalElement);

    if (currentCommentDeleteHandler) {
      DOM.confirmDeleteButton.removeEventListener('click', currentCommentDeleteHandler);
    }
    if (currentDeleteHandler) {
        DOM.confirmDeleteButton.removeEventListener('click', currentDeleteHandler);
    }

    currentCommentDeleteHandler = async () => {
      const taskId = editingTask.id;
      try {
        await apiService.deleteComment(taskId, commentId);
        showUIMessage("Comentário removido com sucesso!", false, true);
        await loadComments(taskId);
      } catch (error) {
        showUIMessage(error.message || "Erro ao remover comentário.", true, true);
      }
      modal.hide();
    };

    DOM.confirmDeleteButton.addEventListener('click', currentCommentDeleteHandler, { once: true });
    modal.show();
  }

  function editTask(task) {
    if (!task) return;
    editingTask = task;
    
    DOM.editTitleInput.value = task.title;
    DOM.editDescriptionInput.value = task.description;
    DOM.editDueDateInput.value = task.due_date;
    DOM.editPriorityInput.value = task.priority;
    DOM.editStatusInput.value = task.status;
    DOM.editCategoryInput.value = task.category || '';

    if (task.date_time) {
      
      const localDate = new Date(task.date_time);

      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const hours = String(localDate.getHours()).padStart(2, '0');
      const minutes = String(localDate.getMinutes()).padStart(2, '0');

      const localDateString = `${year}-${month}-${day}`;
      const localTimeString = `${hours}:${minutes}`;

      if (DOM.editDueDateInput._flatpickr) {
        DOM.editDueDateInput._flatpickr.setDate(localDateString, true);
      } else {
        DOM.editDueDateInput.value = localDateString;
      }

      DOM.editDueTimeInput.value = localTimeString;

    } else {
      if (DOM.editDueDateInput._flatpickr) {
        DOM.editDueDateInput._flatpickr.clear();
      }
      DOM.editDueTimeInput.value = '';
    }

    DOM.editReminderSelect.value = task.reminder_minutes || '';
    
    loadComments(task.id);
    loadHistory(task.id);

    const modal = bootstrap.Modal.getOrCreateInstance(DOM.editTaskModalElement);
    modal.show();
  }

  function handleTaskActions(event) {
    const button = event.target.closest('button[data-id]');
    const badge = event.target.closest('[data-category]');

    if (button) {
      const taskId = button.dataset.id;
      const task = tasksCache.find(t => t.id == taskId);
      if (!task) return;
      if (button.classList.contains("edit-btn")) editTask(task);
      else if (button.classList.contains("delete-btn")) confirmTaskDeletion(task);
    } else if (badge) {
      if (badge.dataset.category) {
          currentFilter = { type: 'category', value: badge.dataset.category };
          if (DOM.filterStatusSelect) DOM.filterStatusSelect.value = 'todos';
          filterAndRender();
      }
    }
  }

  async function handleCheckboxClick(e) {
    const checkbox = e.target.closest(".complete-checkbox[data-id]");
    if (!checkbox) return;
    const taskId = checkbox.dataset.id;
    const newStatus = checkbox.checked ? "concluída" : "pendente";
    try {
      await apiService.updateTask(taskId, { status: newStatus });
      await loadAndRenderTasks();
    } catch (error) {
      showUIMessage(error.message || "Erro ao atualizar status da tarefa.");
    }
  }
  
  DOM.filterStatusSelect?.addEventListener("change", filterAndRender);
  DOM.filterPrioritySelect?.addEventListener("change", filterAndRender);
  DOM.filterCategoryInput?.addEventListener("input", debounce(filterAndRender, 300));
  DOM.filterDueDateInput?.addEventListener("change", filterAndRender);
  DOM.searchTasksInput?.addEventListener("input", debounce(filterAndRender, 300));

  if (DOM.searchTasksInput) DOM.searchTasksInput.addEventListener("input", debounce(filterAndRender, 300));
  
  if (DOM.clearCompletedBtn) {
    DOM.clearCompletedBtn.addEventListener("click", async () => {
      const completedTasks = tasksCache.filter(task => normalizeStatus(task.status) === 'concluida');
      if (completedTasks.length === 0) return showUIMessage("Nenhuma tarefa concluída para limpar.", false);
      try {
        await Promise.all(completedTasks.map(task => apiService.deleteTask(task.id)));
        showUIMessage("Tarefas concluídas foram limpas.", false);
        await loadAndRenderTasks();
      } catch (error) { showUIMessage(error.message || "Erro ao limpar tarefas concluídas."); }
    });
  }

  if (DOM.exportTasksBtn) {
    DOM.exportTasksBtn.addEventListener("click", () => {
      if (tasksCache.length === 0) return showUIMessage("Nenhuma tarefa para exportar.");
      const escapeCsvField = (field) => `"${String(field == null ? '' : field).replace(/"/g, '""')}"`;
      const csvHeader = ["Título", "Descrição", "Prazo", "Prioridade", "Status", "Categoria"].map(escapeCsvField);
      const csvRows = tasksCache.map(task => [
        escapeCsvField(task.title), escapeCsvField(task.description), escapeCsvField(task.due_date),
        escapeCsvField(task.priority), escapeCsvField(task.status), escapeCsvField(task.category)
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
      if (!task || normalizeStatus(task.status) === "concluida" || !task.due_date) return;
      try {
        const [year, month, day] = task.due_date.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return;
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);
        const timeDiff = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        let notificationTitle = "";
        if (daysUntilDue === 0) notificationTitle = `Tarefa "${sanitizeInput(task.title)}" vence HOJE!`;
        else if (daysUntilDue === 1) notificationTitle = `Tarefa "${sanitizeInput(task.title)}" vence AMANHÃ!`;
        if (notificationTitle) new Notification(notificationTitle, { body: `Prazo: ${task.due_date}` });
      } catch (error) { console.warn("Erro ao processar data para notificação:", task.title, error); }
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

  const lembretesEnviados = new Set();

  function verificarLembretes() {
    console.log("🕐 Rodando verificarLembretes", new Date().toLocaleTimeString());

    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const agora = new Date();

    tasksCache.forEach(task => {
      if (
        !task.date_time ||
        !task.reminder_minutes ||
        !task.id ||
        normalizeStatus(task.status) === "concluida"
      ) return;

      const dataTarefa = new Date(task.date_time);
      const diffMin = Math.floor((dataTarefa - agora) / 60000);

      if (
        diffMin === Number(task.reminder_minutes) &&
        !lembretesEnviados.has(task.id)
      ) {
        const titulo = `Lembrete: ${sanitizeInput(task.title)}`;
        const corpo = `O prazo de sua tarefa '${task.title}' termina em ${task.reminder_minutes} minutos.`;

        new Notification(titulo, { body: corpo });
        lembretesEnviados.add(task.id);

        console.log("🔔 Notificação enviada:", task.title, "->", diffMin, "min antes");
      }
    });
  }

  function setupCommentDeletion() {
    if (!DOM.commentsList) return;

    DOM.commentsList.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-comment-btn');

      if (!deleteBtn) return;

      const commentId = deleteBtn.dataset.commentId;
      
      confirmCommentDeletion(commentId);
    });
  }

  function initializeApp() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    setupPasswordToggle(DOM.loginPasswordInput, DOM.loginEyeBtn);
    setupPasswordToggle(DOM.registerPasswordInput, DOM.registerEyeBtn);
    setupPasswordToggle(DOM.confirmRegisterPasswordInput, DOM.confirmRegisterEyeBtn);

    setupCommentDeletion();

    if (DOM.taskList) {
      DOM.taskList.addEventListener("click", handleTaskActions);
      DOM.taskList.addEventListener("change", handleCheckboxClick);
    }
    
    if (DOM.addCommentForm) {
      DOM.addCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = DOM.commentTextInput.value.trim();
        if (!content || !editingTask) return;
        
        if (DOM.addCommentButton) {
            DOM.addCommentButton.disabled = true;
            DOM.addCommentButton.textContent = 'Adicionando...';
        }

        try {
          await apiService.addComment(editingTask.id, content);
          DOM.commentTextInput.value = '';
          await loadComments(editingTask.id);
        } catch (error) {
          showUIMessage('Falha ao adicionar comentário.', true);
        } finally {
          if (DOM.addCommentButton) {
            DOM.addCommentButton.disabled = false;
            DOM.addCommentButton.textContent = 'Adicionar Comentário';
          }
        }
      });
    }

    const currentUserData = localStorage.getItem("currentUser");
    if (currentUserData) {
      try {
        const { user, token } = JSON.parse(currentUserData);
        if (user && token) {
          showMainAppPanel();
          loadAndRenderTasks();
        } else {
          handleLogout();
        }
      } catch (error) {
        handleLogout();
      }
    } else {
      showLoginPanel();
    }

    document.querySelectorAll('[title]').forEach(el => {
      if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        new bootstrap.Tooltip(el);
      }
    });

    flatpickr("#dueDate", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      locale: "pt",
    });

    flatpickr("#edit-dueDate", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      locale: "pt",
    });

    flatpickr("#filter-dueDate", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      allowInput: true,
      locale: "pt",
    });

    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setInterval(verificarLembretes, 60000);
        }
      });
    }
  }

  initializeApp();

  function handleLogout() {
    localStorage.removeItem("currentUser");
  
    if (typeof DOM !== "undefined") {
      if (DOM.taskList) DOM.taskList.innerHTML = "";
      if (DOM.taskListTitle) DOM.taskListTitle.textContent = "Minhas Tarefas";
    }
  
    if (typeof showLoginPanel === "function") {
      showLoginPanel();
    }
  }
  
  if (typeof module !== "undefined") {
    module.exports = { handleLogout };
  }
  
});

}

