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
    toggleLoginPasswordBtn: document.querySelector(".toggle-password"),
  };

  let editingTaskIndex = null;
  let tasksCache = [];

  const togglePasswordBtn = document.getElementById("toggle-password-btn");
  const togglePasswordIcon = document.getElementById("toggle-login-password-icon");
  const passwordInput = DOM.loginPasswordInput;

  if (togglePasswordBtn && togglePasswordIcon && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPasswordVisible = passwordInput.type === "text";
      passwordInput.type = isPasswordVisible ? "password" : "text";
      togglePasswordIcon.classList.toggle("bi-eye", !isPasswordVisible);
      togglePasswordIcon.classList.toggle("bi-eye-slash", isPasswordDisible);
    });
  }

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const tagRegex = /^[a-zA-Z0-9-]+$/;

  const sanitizeInput = (input) => {
    if (typeof input !== 'string' && typeof input !== 'number') {
        return '';
    }
    const div = document.createElement("div");
    div.textContent = String(input);
    return div.innerHTML;
  };

  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  const showUIMessage = (msg, isError = true) => {
    if (!DOM.messageDiv) {
      console.warn("Message div not found in DOM.");
      return;
    }
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
    const currentUserItem = localStorage.getItem("currentUser");
    if (!currentUserItem) {
        console.error("Tentativa de salvar tarefas sem usuário logado (currentUser não encontrado).");
        return;
    }
    try {
        const currentUser = JSON.parse(currentUserItem);
        if (currentUser && currentUser.username) {
            localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasksCache));
        } else {
            console.error("Tentativa de salvar tarefas sem usuário logado válido ou username ausente.");
        }
    } catch (error) {
        console.error("Erro ao parsear currentUser de localStorage:", error);
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
    if (status === "todos") return tasksCache; // Returns a reference, be careful if modifying
    const normalizedFilterStatus = normalizeStatus(status);
    return tasksCache.filter(task => normalizeStatus(task.status) === normalizedFilterStatus);
  };

  const filterTasksBySearchQuery = (query) => {
    if (!query) return tasksCache; // Returns a reference
    const lowerCaseQuery = query.toLowerCase();
    return tasksCache.filter(task =>
      task.title.toLowerCase().includes(lowerCaseQuery) ||
      (task.tags && Array.isArray(task.tags) && task.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(lowerCaseQuery)))
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
          const modal = bootstrap.Modal.getOrCreateInstance(DOM.welcomeModalElement);
          modal.show();
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
        const modal = bootstrap.Modal.getOrCreateInstance(DOM.forgotPasswordModalElement);
        modal.show();
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
  if (DOM.toggleLoginPasswordBtn && DOM.loginPasswordInput) {
    DOM.toggleLoginPasswordBtn.addEventListener("click", () => {
      const input = DOM.loginPasswordInput;
      const icon = document.getElementById("toggle-login-password-icon");
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
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
    DOM.forgotPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = DOM.forgotEmailInput.value.trim();
      if (!emailRegex.test(email)) {
        showUIMessage("E-mail inválido.");
        return;
      }
      const usersRaw = localStorage.getItem("users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];
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
  } else if (DOM.forgotPasswordForm) {
    console.warn("Formulário de esqueci a senha não pôde ser inicializado completamente: campo de email ausente.");
  }


  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
      tasksCache = [];
      showLoginPanel();
      if (DOM.taskList) DOM.taskList.innerHTML = "";
      if (DOM.progressBar && DOM.progressText) updateProgress();
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
      const password = DOM.registerPasswordInput.value;
      const confirmPassword = DOM.registerConfirmPasswordInput.value;

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
      const usersRaw = localStorage.getItem("users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];
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
  } else if (DOM.registerForm) {
     console.warn("Formulário de registro não pôde ser inicializado completamente: campos ausentes.");
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
      const password = DOM.loginPasswordInput.value;

      try {
        const hashedPassword = await hashPassword(password);
        const usersRaw = localStorage.getItem("users");
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        const user = users.find(u => u.username === username && u.password === hashedPassword);

        if (user) {
          try {
            localStorage.setItem("currentUser", JSON.stringify({ username: user.username, email: user.email }));
        
            const userTasksRaw = localStorage.getItem(`tasks_${user.username}`);
            try {
              tasksCache = userTasksRaw ? JSON.parse(userTasksRaw) : [];
            } catch (parseErr) {
              console.warn("Erro ao fazer parse das tarefas do usuário:", parseErr);
              tasksCache = [];
            }
        
            showMainAppPanel();
        
            setTimeout(() => {
              renderTasks(tasksCache);
              updateProgress();
            }, 50);
        
            DOM.loginForm.reset();
          } catch (internalErr) {
            console.error("Erro ao configurar usuário logado:", internalErr);
            showUIMessage("Erro ao carregar dados do usuário.");
          }
        } else {
          DOM.loginUsernameInput.classList.add("is-invalid");
          DOM.loginPasswordInput.classList.add("is-invalid");
          showUIMessage("Usuário ou senha inválidos.");
        }
        
        } catch (error) {
          console.error("Erro durante o login:", error);
          showUIMessage("Ocorreu um erro inesperado durante o login. Tente novamente.");
        } finally {
          if (spinner) spinner.classList.add("d-none");
          DOM.loginButton.disabled = false;
        }
        
    });
  } else if (DOM.loginForm) {
      console.warn("Formulário de login não pôde ser inicializado completamente: campos ausentes.");
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
        const taskObj = { title, description, dueDate, priority, status, category, tags, id: Date.now() };
        tasksCache.push(taskObj);
        saveTasks();
        DOM.taskForm.reset();
        showUIMessage("Tarefa criada com sucesso!", false);
        renderTasks(tasksCache); // Display all tasks after adding a new one
      });
    } else {
        console.warn("Formulário de criação de tarefa não pôde ser inicializado completamente: campos ou botão de submit ausentes.");
    }
  }

  if (DOM.editTaskForm && DOM.editTitleInput && DOM.editDescriptionInput && DOM.editDueDateInput && DOM.editPriorityInput && DOM.editStatusInput && DOM.editCategoryInput && DOM.editTagsInput) {
    DOM.editTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (editingTaskIndex === null || !tasksCache[editingTaskIndex]) {
        showUIMessage("Erro: Nenhuma tarefa selecionada para edição ou tarefa inválida.", true);
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
      showUIMessage("Tarefa atualizada com sucesso!", false);
      if (DOM.editTaskModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalInstance = bootstrap.Modal.getInstance(DOM.editTaskModalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      editingTaskIndex = null;
      renderTasks(tasksCache); // Display all tasks after editing
    });
  } else if (DOM.editTaskForm) {
    console.warn("Formulário de edição de tarefa não pôde ser inicializado completamente: campos ausentes.");
  }


  function handleTaskActions(event) {
    const button = event.target.closest('button[data-index]');
    if (!button) return;

    const originalIndexAttr = button.dataset.index;
    const index = parseInt(originalIndexAttr, 10);

    if (isNaN(index) || index < 0 || index >= tasksCache.length) {
      console.error("Índice de tarefa inválido ou tarefa não encontrada:", index);
      showUIMessage("Erro ao processar ação da tarefa: tarefa não encontrada.", true);
      return;
    }

    if (button.classList.contains("edit-btn")) {
      editTask(index);
    } else if (button.classList.contains("delete-btn")) {
      confirmTaskDeletion(index);
    }
  }

  function handleCheckboxClick(e) {
    const checkbox = e.target.closest(".complete-checkbox[data-index]");
    if (!checkbox) return;

    const originalIndexAttr = checkbox.dataset.index;
    const index = parseInt(originalIndexAttr, 10);

    if (isNaN(index) || index < 0 || index >= tasksCache.length) {
      console.error("Índice de tarefa inválido no checkbox:", index);
      showUIMessage("Erro ao atualizar status da tarefa: tarefa não encontrada.", true);
      return;
    }
    const task = tasksCache[index];
    if (!task) {
        console.error("Tarefa não encontrada no cache para o índice (checkbox):", index);
        showUIMessage("Erro ao atualizar status da tarefa: dados da tarefa inconsistentes.", true);
        return;
    }
    task.status = checkbox.checked ? "concluída" : "pendente";
    saveTasks();
    renderTasks(tasksCache); // Display all tasks after status change
  }

  function normalizeStatus(status) {
    if (typeof status !== 'string') return "";
    return status
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function renderTasks(tasksToDisplay) { 
    if (!DOM.taskList) {
        console.error("Elemento taskList não encontrado no DOM. Não é possível renderizar tarefas.");
        return;
    }
    const statusClassMap = {
      "pendente": "task-status-pendente",
      "emandamento": "task-status-em-andamento",
      "concluida": "task-status-concluida"
    };
    DOM.taskList.innerHTML = "";
    if (!Array.isArray(tasksToDisplay) || tasksToDisplay.length === 0) {
      DOM.taskList.innerHTML = '<p class="text-center text-muted" id="no-tasks-message">Nenhuma tarefa para exibir.</p>';
      updateProgress();
      return;
    }

    const groupedByDate = {};
    tasksToDisplay.forEach(task => {
      if (!task || typeof task.dueDate !== 'string') {
        console.warn("Tarefa inválida ou sem data de vencimento encontrada:", task);
        return;
      }
      const [year, month, day] = task.dueDate.split("-");
      if (!year || !month || !day || isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) {
        console.warn("Formato de data inválido para a tarefa:", task.title, task.dueDate);
        const dateKey = 'Data Inválida';
        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
        groupedByDate[dateKey].push(task);
        return;
      }
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString().split("T")[0];
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(task);
    });

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        if (a === 'Data Inválida') return 1;
        if (b === 'Data Inválida') return -1;
        return new Date(a) - new Date(b);
    });

    sortedDates.forEach(date => {
      let formattedDate = date;
      if (date !== 'Data Inválida') {
        const [y, m, d] = date.split("-");
        formattedDate = `${d}/${m}/${y}`;
      }
      const dateHeaderWrapper = document.createElement("div");
      dateHeaderWrapper.className = "mt-4 mb-2 d-flex align-items-center justify-content-start";

      const datePill = document.createElement("span");
      datePill.className= "date-pill";
      datePill.textContent = formattedDate;

      dateHeaderWrapper.appendChild(datePill);
      DOM.taskList.appendChild(dateHeaderWrapper);

      groupedByDate[date].forEach(task => {
        const originalIndex = tasksCache.findIndex(t => t.id === task.id);
        if (originalIndex === -1) {
          console.warn("Tarefa do groupedByDate não encontrada no tasksCache original. ID:", task.id);
          return;
        }
        const div = document.createElement("div");
        div.classList.add("task-card", "card", "p-3", "mb-2");
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const [ano, mes, dia] = task.dueDate.split("-").map(Number);
        const dataTarefa = new Date(ano, mes -1, dia);

        if (dataTarefa < hoje && normalizeStatus(task.status) !== "concluida") {
          div.classList.add("tarefa-atrasada");
        }
        const normStatus = normalizeStatus(task.status);
        if (statusClassMap[normStatus]) {
          div.classList.add(statusClassMap[normStatus]);
        }
        div.setAttribute("role", "listitem");
        div.setAttribute("data-priority", task.priority);
        div.setAttribute("data-status", task.status);

        const tagsHtml = (task.tags && Array.isArray(task.tags) && task.tags.length > 0)
            ? `<small class="text-muted d-block"><strong>Tags:</strong> ${task.tags.map(sanitizeInput).join(", ")}</small>`
            : "";
        const categoryHtml = task.category ? `<small class="text-muted d-block"><strong>Categoria:</strong> ${sanitizeInput(task.category)}</small>` : "";

        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center flex-grow-1">
            ${normStatus === "concluida" ? `
              <i class="bi bi-check-circle-fill text-success me-2 fs-5" title="Tarefa concluída"></i>
            ` : `
              <input type="checkbox" class="form-check-input me-2 complete-checkbox" data-index="${originalIndex}" aria-label="Marcar tarefa ${sanitizeInput(task.title)} como concluída">
            `}            
                ${sanitizeInput(task.title)}
              </h5>
            </div>
            <div>
              <button class="btn btn-warning btn-sm me-2 edit-btn" data-index="${originalIndex}" title="Editar tarefa ${sanitizeInput(task.title)}" aria-label="Editar tarefa ${sanitizeInput(task.title)}">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-btn" data-index="${originalIndex}" title="Excluir tarefa ${sanitizeInput(task.title)}" aria-label="Excluir tarefa ${sanitizeInput(task.title)}">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
          <p class="mb-1 description-text">${sanitizeInput(task.description)}</p>
          <small class="text-muted d-block"><strong>Prazo:</strong> ${sanitizeInput(task.dueDate)}</small>
          <small class="text-muted d-block"><strong>Prioridade:</strong> ${sanitizeInput(task.priority)} | <strong>Status:</strong> ${sanitizeInput(task.status)}</small>
          ${categoryHtml}
          ${tagsHtml}
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
    if (!DOM.deleteModalElement || !DOM.confirmDeleteButton || typeof bootstrap === 'undefined' || !bootstrap.Modal) {
        console.error("Componentes do modal de exclusão não encontrados.");
        showUIMessage("Não foi possível abrir a confirmação de exclusão.", true);
        return;
    }
    const taskToDelete = tasksCache[index];
    const modalBody = DOM.deleteModalElement.querySelector('.modal-body');

    if (modalBody && taskToDelete) {
      modalBody.textContent = `Deseja realmente excluir a tarefa "${sanitizeInput(taskToDelete.title)}"?`;
    } else if (modalBody) {
      modalBody.textContent = "Deseja realmente excluir esta tarefa?";
    } else {
      console.error("Corpo do modal de exclusão não encontrado.");
    }

    const modal = bootstrap.Modal.getOrCreateInstance(DOM.deleteModalElement);
    if (currentDeleteHandler) {
      DOM.confirmDeleteButton.removeEventListener('click', currentDeleteHandler);
    }
    currentDeleteHandler = function onConfirm() {
      if (index < 0 || index >= tasksCache.length) {
        showUIMessage("Erro ao excluir tarefa: tarefa não encontrada.", true);
        modal.hide();
        return;
      }
      tasksCache.splice(index, 1);
      saveTasks();
      showUIMessage("Tarefa removida com sucesso!", false);

      const currentFilterStatus = DOM.filterStatusSelect ? DOM.filterStatusSelect.value : "todos";
      const currentSearchQuery = DOM.searchTasksInput ? DOM.searchTasksInput.value : "";
      let tasksToRenderAfterDelete = filterTasksByStatus(currentFilterStatus);
      if (currentSearchQuery) {
        const searchedOverall = filterTasksBySearchQuery(currentSearchQuery);
        tasksToRenderAfterDelete = tasksToRenderAfterDelete.filter(task => searchedOverall.includes(task));
      }
      renderTasks(tasksToRenderAfterDelete);
      modal.hide();
    };
    DOM.confirmDeleteButton.addEventListener('click', currentDeleteHandler, { once: true });
    modal.show();
  }

  function editTask(index) {
    if (index < 0 || index >= tasksCache.length) {
        showUIMessage("Tarefa inválida para edição.", true);
        return;
    }
    const task = tasksCache[index];
    if (!task || !DOM.editTaskModalElement || !DOM.editTitleInput || !DOM.editDescriptionInput || !DOM.editDueDateInput || !DOM.editPriorityInput || !DOM.editStatusInput || !DOM.editCategoryInput || !DOM.editTagsInput) {
      console.error("Tarefa não encontrada ou modal/campos de edição não existem.");
      showUIMessage("Não é possível editar a tarefa: formulário incompleto.", true);
      return;
    }
    DOM.editTitleInput.value = task.title;
    DOM.editDescriptionInput.value = task.description;
    DOM.editDueDateInput.value = task.dueDate;
    DOM.editPriorityInput.value = task.priority;
    DOM.editStatusInput.value = task.status;
    DOM.editCategoryInput.value = task.category || '';
    DOM.editTagsInput.value = (task.tags && Array.isArray(task.tags)) ? task.tags.join(', ') : '';
    editingTaskIndex = index;

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getOrCreateInstance(DOM.editTaskModalElement);
      modal.show();
    }
  }

  if (DOM.filterStatusSelect) {
    DOM.filterStatusSelect.addEventListener("change", (e) => {
      const status = e.target.value;
      const query = DOM.searchTasksInput ? DOM.searchTasksInput.value.trim() : "";
      let filteredTasks = filterTasksByStatus(status); // Uses tasksCache
      if (query) {
        const searchedOverall = filterTasksBySearchQuery(query); // Uses tasksCache
        filteredTasks = filteredTasks.filter(task => searchedOverall.includes(task));
      }
      renderTasks(filteredTasks);
    });
  }

  if (DOM.searchTasksInput) {
    DOM.searchTasksInput.addEventListener("input", debounce((e) => {
      const query = e.target.value.trim();
      const status = DOM.filterStatusSelect ? DOM.filterStatusSelect.value : "todos";
      let searchedTasksResult = filterTasksBySearchQuery(query); // Uses tasksCache
      if (status !== "todos") {
        const statusFiltered = filterTasksByStatus(status); // Uses tasksCache
        searchedTasksResult = searchedTasksResult.filter(task => statusFiltered.includes(task));
      }
      renderTasks(searchedTasksResult);
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
        escapeCsvField(task.tags && Array.isArray(task.tags) ? task.tags.join(";") : "")
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
      if (!task || normalizeStatus(task.status) === "concluida" || !task.dueDate) return;
      try {
        const [year, month, day] = task.dueDate.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return;

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
          new Notification(notificationTitle, { body: `Prazo: ${sanitizeInput(task.dueDate)}` });
        }
      } catch (error) {
          console.warn("Erro ao processar data de vencimento para notificação:", task.title, error);
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
    const currentUserItem = localStorage.getItem("currentUser");
  
    if (currentUserItem) {
      try {
        const currentUser = JSON.parse(currentUserItem);
        if (currentUser && currentUser.username) {
          const userTasksRaw = localStorage.getItem(`tasks_${currentUser.username}`);
          tasksCache = userTasksRaw ? JSON.parse(userTasksRaw) : [];
          showMainAppPanel();
  
          renderTasks(tasksCache);
        } else {
          showLoginPanel();
          tasksCache = [];
        }
      } catch (error) {
        console.error("Erro ao parsear currentUser ou tasks do localStorage na inicialização:", error);
        localStorage.removeItem("currentUser");
        showLoginPanel();
        tasksCache = [];
      }
    } else {
      showLoginPanel();
      tasksCache = [];
    }
  
    updateProgress();
    showWelcomeModal();
  }
  


  document.querySelectorAll('[title]').forEach(el => {
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      try {
        new bootstrap.Tooltip(el);
      } catch (e) {
        console.warn("Erro ao inicializar tooltip para o elemento:", el, e);
      }
    }
  });

  initializeApp();
});
