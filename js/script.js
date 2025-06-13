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
    themeToggleButton: document.getElementById("theme-toggle-btn"),
    tagsContainer: document.getElementById("tags-container"),
    editTagsContainer: document.getElementById("edit-tags-container"),
    clearCompletedBtn: document.getElementById("clear-completed-btn"),
    loginEyeBtn: document.getElementById('login-eye-btn'),
    registerEyeBtn: document.getElementById('register-eye-btn'),
    confirmRegisterEyeBtn: document.getElementById('confirm-register-eye-btn'),
    taskListTitle: document.querySelector("#main-panel h5"),
  };

  let editingTaskIndex = null;
  let tasksCache = [];
  let currentFilter = { type: 'status', value: 'todos' };

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,80}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const tagRegex = /^[a-zA-Z0-9\u00C0-\u017F-]+$/;

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

    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      const tooltipInstance = bootstrap.Tooltip.getInstance(DOM.themeToggleButton);
      if (tooltipInstance) {
        tooltipInstance.dispose();
      }
      new bootstrap.Tooltip(DOM.themeToggleButton);
    }
  };

  const setupTagInput = (inputElement, containerElement) => {
    if (!inputElement || !containerElement) return;
    inputElement.addEventListener("keyup", (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tagValue = inputElement.value.trim().replace(/,$/, '').toLowerCase();
        if (tagValue && tagRegex.test(tagValue)) {
          createTagPill(tagValue, containerElement);
          inputElement.value = "";
        } else if (tagValue) {
            showUIMessage(`Tag inválida: "${sanitizeInput(tagValue)}". Use apenas letras, números ou traços.`);
        }
      }
    });
  };

  const createTagPill = (tagValue, containerElement) => {
    const pill = document.createElement('div');
    pill.className = 'tag-pill';
    
    const text = document.createElement('span');
    text.textContent = tagValue;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'tag-remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.setAttribute('aria-label', `Remover tag ${tagValue}`);
    removeBtn.onclick = () => pill.remove();

    pill.appendChild(text);
    pill.appendChild(removeBtn);
    containerElement.appendChild(pill);
  };
  
  const getTagsFromContainer = (containerElement) => {
    if (!containerElement) return [];
    return Array.from(containerElement.querySelectorAll('.tag-pill span')).map(span => span.textContent);
  };
  
  const saveTasks = () => {
    const currentUserItem = localStorage.getItem("currentUser");
    if (!currentUserItem) return;
    try {
      const currentUser = JSON.parse(currentUserItem);
      if (currentUser && currentUser.username) {
        localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasksCache));
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

  const filterAndRender = () => {
    let filteredTasks = [...tasksCache];
    const query = DOM.searchTasksInput.value.toLowerCase().trim();

    if (currentFilter.type === 'status') {
      if (currentFilter.value !== 'todos') {
        filteredTasks = filteredTasks.filter(task => normalizeStatus(task.status) === normalizeStatus(currentFilter.value));
      }
      if (DOM.taskListTitle) DOM.taskListTitle.textContent = "Lista de Tarefas";
    } else if (currentFilter.type === 'category') {
      filteredTasks = filteredTasks.filter(task => task.category && task.category.toLowerCase() === currentFilter.value.toLowerCase());
      if (DOM.taskListTitle) DOM.taskListTitle.innerHTML = `Lista de Tarefas <small class="text-muted fs-6">(Categoria: ${sanitizeInput(currentFilter.value)})</small>`;
    } else if (currentFilter.type === 'tag') {
      filteredTasks = filteredTasks.filter(task => task.tags && task.tags.includes(currentFilter.value));
      if (DOM.taskListTitle) DOM.taskListTitle.innerHTML = `Lista de Tarefas <small class="text-muted fs-6">(Tag: ${sanitizeInput(currentFilter.value)})</small>`;
    }
    
    if (query) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    renderTasks(filteredTasks);
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

  if (DOM.themeToggleButton) {
    DOM.themeToggleButton.addEventListener("click", () => {
      const isDarkMode = document.body.classList.contains('dark-mode');
      const newTheme = isDarkMode ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
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
  }

  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      tasksCache = [];
      showLoginPanel();
      if (DOM.taskList) DOM.taskList.innerHTML = "";
      if (DOM.progressBar && DOM.progressText) updateProgress();
      showUIMessage("Você saiu do sistema.", false);
    });
  }

  if (
    DOM.registerForm &&
    DOM.registerUsernameInput &&
    DOM.registerEmailInput &&
    DOM.registerPasswordInput &&
    DOM.registerConfirmPasswordInput
  ) {
    DOM.registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const inputs = [
        DOM.registerUsernameInput,
        DOM.registerEmailInput,
        DOM.registerPasswordInput,
        DOM.registerConfirmPasswordInput
      ];
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
        showUIMessage("Senha inválida. Sua senha deve ter entre 6 a 80 caracteres, com pelo menos uma letra e um número.");
        return;
      }

      if (password !== confirmPassword) {
        DOM.registerConfirmPasswordInput.classList.add("is-invalid");
        showUIMessage("As senhas não coincidem.");
        return;
      }

      const hashedPassword = await hashPassword(password);

      try {
        const res = await fetch("http://localhost:3000/api/cadastrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: username,
            email,
            password: hashedPassword
          })
        });

        const data = await res.json();
        if (data.success) {
          showUIMessage("Cadastro realizado com sucesso!", false);
          showLoginPanel();
          DOM.registerForm.reset();
        } else {
          if (data.message.includes("Email")) {
            DOM.registerEmailInput.classList.add("is-invalid");
          }
          if (data.message.includes("nome")) {
            DOM.registerUsernameInput.classList.add("is-invalid");
          }
          showUIMessage(data.message, true);
        }
      } catch (err) {
        console.error("Erro ao enviar dados para o servidor:", err);
        showUIMessage("Erro ao tentar se cadastrar. Tente novamente.", true);
      }
    });
  }

  if (DOM.loginForm && DOM.loginUsernameInput && DOM.loginPasswordInput && DOM.loginButton) {
    DOM.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      DOM.loginUsernameInput.classList.remove("is-invalid");
      DOM.loginPasswordInput.classList.remove("is-invalid");
      DOM.loginButton.disabled = true;

      const username = DOM.loginUsernameInput.value.trim();
      const password = DOM.loginPasswordInput.value;

      try {
        const hashedPassword = await hashPassword(password);

        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password: hashedPassword })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          tasksCache = [];
          showMainAppPanel();
          filterAndRender();
          updateProgress();
          DOM.loginForm.reset();
        } else {
          DOM.loginUsernameInput.classList.add("is-invalid");
          DOM.loginPasswordInput.classList.add("is-invalid");
          showUIMessage("Usuário e/ou senha inválidos.");
        }
      } catch (error) {
        console.error("Erro durante o login:", error);
        showUIMessage("Ocorreu um erro inesperado durante o login. Tente novamente.");
      } finally {
        DOM.loginButton.disabled = false;
      }
    });
  }

  if (DOM.taskForm) {
    if (DOM.taskTitleInput && DOM.taskDescriptionInput && DOM.taskDueDateInput && DOM.taskPriorityInput && DOM.taskCategoryInput && DOM.taskTagsInput) {
      DOM.taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = DOM.taskTitleInput.value.trim();
        const description = DOM.taskDescriptionInput.value.trim();
        const dueDate = DOM.taskDueDateInput.value;
        const priority = DOM.taskPriorityInput.value;
        const status = "pendente";
        const category = DOM.taskCategoryInput.value.trim();
        const tags = getTagsFromContainer(DOM.tagsContainer);

        if (!title || !description || !dueDate) {
          showUIMessage("Preencha os campos obrigatórios: Título, Descrição e Prazo.");
          return;
        }

        const taskObj = {
          title,
          description,
          dueDate,
          priority,
          status,
          category,
          tags,
          id: Date.now()
        };
        tasksCache.push(taskObj);
        saveTasks();
        DOM.taskForm.reset();
        if (DOM.tagsContainer) DOM.tagsContainer.innerHTML = '';
        showUIMessage("Tarefa criada com sucesso!", false);
        filterAndRender();
      });
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
      const tags = getTagsFromContainer(DOM.editTagsContainer);

      if (!title || !description || !dueDate) {
        showUIMessage("Preencha os campos obrigatórios no formulário de edição: Título, Descrição e Prazo.", true);
        return;
      }

      const task = tasksCache[editingTaskIndex];
      task.title = title;
      task.description = description;
      task.dueDate = dueDate;
      task.priority = priority;
      task.status = status;
      task.category = category;
      task.tags = tags;

      saveTasks();
      showUIMessage("Tarefa atualizada com sucesso!", false);
      if (DOM.editTaskModalElement && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalInstance = bootstrap.Modal.getInstance(DOM.editTaskModalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      editingTaskIndex = null;
      filterAndRender();
    });
  }

  function handleTaskActions(event) {
    const button = event.target.closest('button[data-index]');
    const badge = event.target.closest('[data-category], [data-tag]');

    if (button) {
      const originalIndexAttr = button.dataset.index;
      const index = parseInt(originalIndexAttr, 10);
      
      const task = tasksCache.find(t => t.id === parseInt(button.dataset.id));
      const taskIndex = tasksCache.indexOf(task);

      if (!task) {
        showUIMessage("Erro ao processar ação da tarefa: tarefa não encontrada.", true);
        return;
      }

      if (button.classList.contains("edit-btn")) {
        editTask(taskIndex);
      } else if (button.classList.contains("delete-btn")) {
        confirmTaskDeletion(taskIndex);
      }
    } else if (badge) {
        if (badge.dataset.category) {
            currentFilter = { type: 'category', value: badge.dataset.category };
            if (DOM.filterStatusSelect) DOM.filterStatusSelect.value = 'todos';
        } else if (badge.dataset.tag) {
            currentFilter = { type: 'tag', value: badge.dataset.tag };
            if (DOM.filterStatusSelect) DOM.filterStatusSelect.value = 'todos';
        }
        filterAndRender();
    }
  }

  function handleCheckboxClick(e) {
    const checkbox = e.target.closest(".complete-checkbox[data-index]");
    if (!checkbox) return;

    const originalIndexAttr = checkbox.dataset.index;
    const task = tasksCache.find(t => t.id === parseInt(checkbox.dataset.id));

    if (!task) {
      showUIMessage("Erro ao atualizar status da tarefa: tarefa não encontrada.", true);
      return;
    }
    task.status = checkbox.checked ? "concluída" : "pendente";
    saveTasks();
    filterAndRender();
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
    if (!DOM.taskList) return;

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
      if (!task || typeof task.dueDate !== 'string') return;
      const [year, month, day] = task.dueDate.split("-");
      if (!year || !month || !day || isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) {
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
      datePill.className = "date-pill";
      datePill.innerHTML = `🗓️ ${formattedDate}`;

      dateHeaderWrapper.appendChild(datePill);
      DOM.taskList.appendChild(dateHeaderWrapper);

      groupedByDate[date].forEach(task => {
        const originalIndex = tasksCache.findIndex(t => t.id === task.id);
        if (originalIndex === -1) return;

        const div = document.createElement("div");
        div.classList.add("task-card", "card", "p-3", "mb-2");
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const [ano, mes, dia] = task.dueDate.split("-").map(Number);
        const dataTarefa = new Date(ano, mes - 1, dia);

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
        
        const categoryHtml = task.category 
            ? `<span class="task-category-badge" data-category="${sanitizeInput(task.category)}">${sanitizeInput(task.category)}</span>` 
            : "";

        const tagsHtml = (task.tags && Array.isArray(task.tags) && task.tags.length > 0) 
            ? task.tags.map(tag => `<span class="task-tag-badge" data-tag="${sanitizeInput(tag)}">${sanitizeInput(tag)}</span>`).join('') 
            : "";
        
        const metaHtml = (categoryHtml || tagsHtml)
            ? `<div class="task-meta-wrapper">${categoryHtml}${tagsHtml}</div>`
            : "";

        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center flex-grow-1">
              ${normStatus === "concluida" ?
              `<i class="bi bi-check-circle-fill text-success me-2 fs-5" title="Tarefa concluída"></i>` :
              `<input type="checkbox" class="form-check-input me-2 complete-checkbox" data-index="${originalIndex}" data-id="${task.id}" aria-label="Marcar tarefa ${sanitizeInput(task.title)} como concluída">`
              }
              <h5 class="mb-0 flex-grow-1 task-title" style="word-break: break-word;">
                ${sanitizeInput(task.title)}
              </h5>
            </div>
            <div>
              <button class="btn btn-warning btn-sm me-2 edit-btn" data-index="${originalIndex}" data-id="${task.id}" title="Editar tarefa ${sanitizeInput(task.title)}" aria-label="Editar tarefa ${sanitizeInput(task.title)}">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-btn" data-index="${originalIndex}" data-id="${task.id}" title="Excluir tarefa ${sanitizeInput(task.title)}" aria-label="Excluir tarefa ${sanitizeInput(task.title)}">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
          <p class="mb-1 description-text">${sanitizeInput(task.description)}</p>
          <small class="text-muted d-block"><strong>Prazo:</strong> ${sanitizeInput(task.dueDate)}</small>
          <small class="text-muted d-block"><strong>Prioridade:</strong> ${sanitizeInput(task.priority)} | <strong>Status:</strong> ${sanitizeInput(task.status)}</small>
          ${metaHtml}
        `;
        DOM.taskList.appendChild(div);
      });
    });
    
    updateProgress();
  }

  let currentDeleteHandler = null;

  function confirmTaskDeletion(index) {
    if (!DOM.deleteModalElement || !DOM.confirmDeleteButton || typeof bootstrap === 'undefined' || !bootstrap.Modal) {
      showUIMessage("Não foi possível abrir a confirmação de exclusão.", true);
      return;
    }
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
      if (index < 0 || index >= tasksCache.length) {
        showUIMessage("Erro ao excluir tarefa: tarefa não encontrada.", true);
        modal.hide();
        return;
      }
      tasksCache.splice(index, 1);
      saveTasks();
      showUIMessage("Tarefa removida com sucesso!", false);
      filterAndRender();
      modal.hide();
    };
    DOM.confirmDeleteButton.addEventListener('click', currentDeleteHandler, {
      once: true
    });
    modal.show();
  }

  function editTask(index) {
    if (index < 0 || index >= tasksCache.length) {
      showUIMessage("Tarefa inválida para edição.", true);
      return;
    }
    const task = tasksCache[index];
    if (!task || !DOM.editTaskModalElement || !DOM.editTitleInput || !DOM.editDescriptionInput || !DOM.editDueDateInput || !DOM.editPriorityInput || !DOM.editStatusInput || !DOM.editCategoryInput || !DOM.editTagsInput) {
      showUIMessage("Não é possível editar a tarefa: formulário incompleto.", true);
      return;
    }
    DOM.editTitleInput.value = task.title;
    DOM.editDescriptionInput.value = task.description;
    DOM.editDueDateInput.value = task.dueDate;
    DOM.editPriorityInput.value = task.priority;
    DOM.editStatusInput.value = task.status;
    DOM.editCategoryInput.value = task.category || '';
    
    if (DOM.editTagsContainer) DOM.editTagsContainer.innerHTML = '';
    if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => createTagPill(tag, DOM.editTagsContainer));
    }
    if (DOM.editTagsInput) DOM.editTagsInput.value = '';
    
    editingTaskIndex = index;

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getOrCreateInstance(DOM.editTaskModalElement);
      modal.show();
    }
  }

  if (DOM.filterStatusSelect) {
    DOM.filterStatusSelect.addEventListener("change", (e) => {
      currentFilter = { type: 'status', value: e.target.value };
      filterAndRender();
    });
  }

  if (DOM.searchTasksInput) {
    DOM.searchTasksInput.addEventListener("input", debounce(() => {
        filterAndRender();
    }, 300));
  }
  
  if (DOM.clearCompletedBtn) {
      DOM.clearCompletedBtn.addEventListener("click", () => {
          const completedTasks = tasksCache.some(task => normalizeStatus(task.status) === 'concluida');
          if (!completedTasks) {
              showUIMessage("Nenhuma tarefa concluída para limpar.", false);
              return;
          }
          tasksCache = tasksCache.filter(task => normalizeStatus(task.status) !== 'concluida');
          saveTasks();
          showUIMessage("Tarefas concluídas foram limpas.", false);
          filterAndRender();
      });
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
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
      });
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
          new Notification(notificationTitle, {
            body: `Prazo: ${sanitizeInput(task.dueDate)}`
          });
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
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    setupPasswordToggle(DOM.loginPasswordInput, DOM.loginEyeBtn);
    setupPasswordToggle(DOM.registerPasswordInput, DOM.registerEyeBtn);
    setupPasswordToggle(DOM.registerConfirmPasswordInput, DOM.confirmRegisterEyeBtn);

    setupTagInput(DOM.taskTagsInput, DOM.tagsContainer);
    setupTagInput(DOM.editTagsInput, DOM.editTagsContainer);

    if (DOM.taskList) {
        DOM.taskList.addEventListener("click", handleTaskActions);
        DOM.taskList.addEventListener("change", handleCheckboxClick);
    }
    
    const currentUserItem = localStorage.getItem("currentUser");
    if (currentUserItem) {
      try {
        const currentUser = JSON.parse(currentUserItem);
        if (currentUser && currentUser.username) {
          const userTasksRaw = localStorage.getItem(`tasks_${currentUser.username}`);
          tasksCache = userTasksRaw ? JSON.parse(userTasksRaw) : [];
          showMainAppPanel();
          filterAndRender();
        } else {
          localStorage.removeItem("currentUser");
          showLoginPanel();
          tasksCache = [];
        }
      } catch (error) {
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
      new bootstrap.Tooltip(el);
    }
  });

  function initializeApplogged() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
      tasksCache = [];
      showMainAppPanel();
      filterAndRender();
      updateProgress();
    } else {
      showLoginPanel();
    }
  }

  initializeApplogged();
});