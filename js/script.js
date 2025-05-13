document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");
  const mainPanel = document.getElementById("main-panel");

  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");
  const forgotPassword = document.getElementById("forgot-password");
  const logoutBtn = document.getElementById("logout-btn");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const forgotPasswordForm = document.getElementById("forgot-password-form");
  const taskForm = document.getElementById("task-form");
  const taskList = document.getElementById("task-list");
  const searchTasks = document.getElementById("search-tasks");
  const filterStatus = document.getElementById("filter-status");
  const exportTasksBtn = document.getElementById("export-tasks");

  const message = document.getElementById("message");
  let editingTaskIndex = null;
  let tasksCache = JSON.parse(localStorage.getItem("tasks")) || [];

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const tagRegex = /^[a-zA-Z0-9-]+$/;

  // Função para sanitizar entradas (prevenir XSS)
  const sanitizeInput = (input) => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  };

  // Função para hashear senhas
  async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Função para exibir mensagens
  const showMessage = (msg, isError = true) => {
    message.textContent = msg;
    message.className = isError ? "alert alert-danger text-center" : "alert alert-success text-center";
    message.classList.remove("d-none");
    message.setAttribute("role", "alert");
    message.tabIndex = -1;
    message.focus();
    setTimeout(() => message.classList.add("d-none"), 4000);
  };

  // Função para salvar tarefas no localStorage
  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasksCache));
  };

  // Função para atualizar progresso
  const updateProgress = () => {
    const completed = tasksCache.filter(task => task.status === "concluída").length;
    const total = tasksCache.length;
    const progress = total ? (completed / total) * 100 : 0;
    document.getElementById("progress-bar").style.width = `${progress}%`;
    document.getElementById("progress-bar").setAttribute("aria-valuenow", progress);
    document.getElementById("progress-text").textContent = `${completed} de ${total} tarefas concluídas`;
  };

  // Função para filtrar tarefas
  const filterTasks = (status = "todos") => {
    return status === "todos" ? tasksCache : tasksCache.filter(task => task.status === status);
  };

  // Função para buscar tarefas
  const searchTasks = (query) => {
    return tasksCache.filter(task =>
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // Função debounce para busca
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

  // Exibir modal de boas-vindas
  if (!localStorage.getItem("welcomeShown")) {
    new bootstrap.Modal(document.getElementById("welcomeModal")).show();
    localStorage.setItem("welcomeShown", "true");
  }

  // Alternar entre login e cadastro
  showRegister.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
  });

  showLogin.addEventListener("click", () => {
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  // Esquecer senha
  forgotPassword.addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("forgotPasswordModal")).show();
  });

  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();
    if (!emailRegex.test(email)) {
      showMessage("E-mail inválido.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email);
    if (user) {
      showMessage("Instruções de recuperação enviadas para o e-mail! (Simulação)", false);
    } else {
      showMessage("E-mail não encontrado.");
    }
    bootstrap.Modal.getInstance(document.getElementById("forgotPasswordModal")).hide();
  });

  // Deslogar
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    mainPanel.style.display = "none";
    loginContainer.style.display = "block";
    showMessage("Você saiu do sistema.", false);
  });

  // Cadastro
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username");
    const email = document.getElementById("register-email");
    const password = document.getElementById("register-password");
    const confirmPassword = document.getElementById("register-password-confirm");

    if (!usernameRegex.test(username.value.trim())) {
      username.classList.add("is-invalid");
      showMessage("Nome de usuário inválido. Use 3 a 15 letras ou números.");
      return;
    } else {
      username.classList.remove("is-invalid");
    }

    if (!emailRegex.test(email.value.trim())) {
      email.classList.add("is-invalid");
      showMessage("E-mail inválido.");
      return;
    } else {
      email.classList.remove("is-invalid");
    }

    if (!passwordRegex.test(password.value.trim())) {
      password.classList.add("is-invalid");
      showMessage("Senha inválida. Mínimo 6 caracteres, com pelo menos uma letra e um número.");
      return;
    } else {
      password.classList.remove("is-invalid");
    }

    if (password.value.trim() !== confirmPassword.value.trim()) {
      confirmPassword.classList.add("is-invalid");
      showMessage("As senhas não coincidem.");
      return;
    } else {
      confirmPassword.classList.remove("is-invalid");
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email === email.value.trim())) {
      email.classList.add("is-invalid");
      showMessage("Este e-mail já está cadastrado.");
      return;
    }
    if (users.some(u => u.username === username.value.trim())) {
      username.classList.add("is-invalid");
      showMessage("Nome de usuário já existe.");
      return;
    }

    const hashedPassword = await hashPassword(password.value.trim());
    users.push({ username: username.value.trim(), email: email.value.trim(), password: hashedPassword });
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("Cadastro realizado com sucesso!", false);
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username");
    const password = document.getElementById("login-password");
    const btn = document.getElementById("login-btn");

    btn.querySelector(".spinner-border").classList.remove("d-none");
    const hashedPassword = await hashPassword(password.value.trim());
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username.value.trim() && u.password === hashedPassword);

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      loginContainer.style.display = "none";
      mainPanel.style.display = "block";
      renderTasks();
    } else {
      username.classList.add("is-invalid");
      password.classList.add("is-invalid");
      showMessage("Usuário ou senha inválidos.");
    }
    btn.querySelector(".spinner-border").classList.add("d-none");
  });

  // Criar/Editar tarefa
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const status = document.getElementById("status").value;
    const category = document.getElementById("category").value.trim();
    const tagsInput = document.getElementById("tags").value.trim();
    const tags = tagsInput ? tagsInput.split(",").map(tag => tag.trim()) : [];

    if (!title || !description || !dueDate) {
      showMessage("Preencha todos os campos obrigatórios.");
      return;
    }
    for (let tag of tags) {
      if (tag && !tagRegex.test(tag)) {
        showMessage("Tag inválida. Use apenas letras, números ou traços.");
        return;
      }
    }

    const taskObj = { title, description, dueDate, priority, status, category, tags };
    if (editingTaskIndex !== null) {
      tasksCache[editingTaskIndex] = taskObj;
      editingTaskIndex = null;
    } else {
      tasksCache.push(taskObj);
    }

    saveTasks();
    taskForm.reset();
    showMessage("Tarefa salva com sucesso!", false);
    renderTasks();
  });

  // Renderizar tarefas
  function renderTasks(tasks = tasksCache) {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
      const div = document.createElement("div");
      div.className = "border rounded p-3 mb-3 task";
      div.setAttribute("role", "listitem");
      div.setAttribute("data-priority", task.priority);
      div.setAttribute("data-status", task.status);
      div.innerHTML = `
        <h5>${sanitizeInput(task.title)}</h5>
        <p>${sanitizeInput(task.description)}</p>
        <p><strong>Prazo:</strong> ${sanitizeInput(task.dueDate)}</p>
        <p><strong>Prioridade:</strong> ${sanitizeInput(task.priority)} | <strong>Status:</strong> ${sanitizeInput(task.status)}</p>
        <p><strong>Categoria:</strong> ${sanitizeInput(task.category)} | <strong>Tags:</strong> ${task.tags.map(sanitizeInput).join(", ")}</p>
        <button class="btn btn-warning btn-sm me-2" data-index="${index}" aria-label="Editar tarefa ${sanitizeInput(task.title)}">Editar</button>
        <button class="btn btn-danger btn-sm" data-index="${index}" aria-label="Excluir tarefa ${sanitizeInput(task.title)}">Excluir</button>
      `;
      taskList.appendChild(div);
    });

    taskList.querySelectorAll(".btn-warning").forEach(btn => {
      btn.addEventListener("click", e => editTask(e.target.getAttribute("data-index")));
    });
    taskList.querySelectorAll(".btn-danger").forEach(btn => {
      btn.addEventListener("click", e => deleteTask(e.target.getAttribute("data-index")));
    });

    updateProgress();
  }

  // Excluir tarefa
  function deleteTask(index) {
    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
    modal.show();
    document.getElementById("confirmDelete").onclick = () => {
      tasksCache.splice(index, 1);
      saveTasks();
      showMessage("Tarefa removida com sucesso!", false);
      renderTasks();
      modal.hide();
    };
  }

  // Editar tarefa
  function editTask(index) {
    const task = tasksCache[index];
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("priority").value = task.priority;
    document.getElementById("status").value = task.status;
    document.getElementById("category").value = task.category;
    document.getElementById("tags").value = task.tags.join(", ");
    editingTaskIndex = index;
    showMessage("Editando tarefa...", false);
  }

  // Filtro por status
  filterStatus.addEventListener("change", (e) => {
    const filteredTasks = filterTasks(e.target.value);
    renderTasks(filteredTasks);
  });

  // Busca
  searchTasks.addEventListener("input", debounce((e) => {
    const filteredTasks = searchTasks(e.target.value);
    renderTasks(filteredTasks);
  }, 300));

  // Exportar tarefas
  exportTasksBtn.addEventListener("click", () => {
    const csv = [
      ["Título", "Descrição", "Prazo", "Prioridade", "Status", "Categoria", "Tags"],
      ...tasksCache.map(task => [
        task.title,
        task.description,
        task.dueDate,
        task.priority,
        task.status,
        task.category,
        task.tags.join(";")
      ])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarefas.csv";
    a.click();
    URL.revokeObjectURL(url);
    showMessage("Tarefas exportadas com sucesso!", false);
  });

  // Notificações de prazo
  function checkDueDates() {
    if (Notification.permission === "granted") {
      tasksCache.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        if (dueDate - now < 24 * 60 * 60 * 1000 && task.status !== "concluída") {
          new Notification(`Tarefa "${task.title}" vence em breve!`, {
            body: `Prazo: ${task.dueDate}`,
          });
        }
      });
    }
  }
  Notification.requestPermission().then(permission => {
    if (permission === "granted") setInterval(checkDueDates, 60 * 60 * 1000); // Verifica a cada hora
  });

  // Inicializar
  renderTasks();
});