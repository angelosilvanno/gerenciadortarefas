document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");
  const mainPanel = document.getElementById("main-panel");
  const logoutButton = document.getElementById("logout-button");

  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const taskForm = document.getElementById("task-form");
  const taskList = document.getElementById("task-list");

  const message = document.getElementById("message");
  const loadingSpinner = document.getElementById("loading-spinner");

  let editingTaskIndex = null;

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const tagRegex = /^[a-zA-Z0-9-]+$/;

  const showMessage = (msg, isError = true) => {
    message.textContent = msg;
    message.className = isError ? "alert alert-danger text-center" : "alert alert-success text-center";
    message.classList.remove('d-none');
    setTimeout(() => message.classList.add('d-none'), 4000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Show register form
  showRegister.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
  });

  // Show login form
  showLogin.addEventListener("click", () => {
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  // Register form submission
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPassword = document.getElementById("register-password-confirm").value.trim();

    if (!usernameRegex.test(username)) {
      showMessage("Nome de usuário inválido. Use de 3 a 15 letras ou números.");
      return;
    }
    if (!passwordRegex.test(password)) {
      showMessage("Senha inválida. Mínimo 6 caracteres, com pelo menos uma letra e um número.");
      return;
    }
    if (password !== confirmPassword) {
      showMessage("As senhas não coincidem.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email === email)) {
      showMessage("Este e-mail já está cadastrado.");
      return;
    }
    if (users.some(u => u.username === username)) {
      showMessage("Nome de usuário já existe.");
      return;
    }

    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("Cadastro realizado com sucesso!", false);
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  // Login form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem("loggedIn", true);
      loginContainer.style.display = "none";
      mainPanel.style.display = "block";
      renderTasks();
    } else {
      showMessage("Usuário ou senha inválidos.");
    }
  });

  // Task form submission
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

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskObj = { title, description, dueDate, priority, status, category, tags };

    if (editingTaskIndex !== null) {
      tasks[editingTaskIndex] = taskObj;
      editingTaskIndex = null;
    } else {
      tasks.push(taskObj);
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskForm.reset();
    showMessage("Tarefa salva com sucesso!", false);
    renderTasks();
  });

  // Render tasks
  function renderTasks() {
    document.getElementById("loading-spinner").classList.remove("d-none");
    setTimeout(() => {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      taskList.innerHTML = "";
      
      tasks.forEach((task, index) => {
        const div = document.createElement("div");
        div.className = "border rounded p-3 mb-3 task";
        div.innerHTML = `
          <h5>${task.title}</h5>
          <p>${task.description}</p>
          <p><strong>Prazo:</strong> ${formatDate(task.dueDate)}</p>
          <p><strong>Prioridade:</strong> ${task.priority} | <strong>Status:</strong> ${task.status}</p>
          <p><strong>Categoria:</strong> ${task.category} | <strong>Tags:</strong> ${task.tags.join(", ")}</p>
          <button class="btn btn-warning btn-sm me-2" data-index="${index}">Editar</button>
          <button class="btn btn-danger btn-sm" data-index="${index}">Excluir</button>
        `;
        taskList.appendChild(div);
      });

      taskList.querySelectorAll(".btn-warning").forEach(btn => {
        btn.addEventListener("click", e => editTask(e.target.getAttribute("data-index")));
      });
      taskList.querySelectorAll(".btn-danger").forEach(btn => {
        btn.addEventListener("click", e => deleteTask(e.target.getAttribute("data-index")));
      });

      document.getElementById("loading-spinner").classList.add("d-none");
    }, 500);
  }

  // Delete task
  function deleteTask(index) {
    if (confirm("Você tem certeza que deseja excluir esta tarefa?")) {
      const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      showMessage("Tarefa removida com sucesso!", false);
      renderTasks();
    }
  }

  // Edit task
  function editTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks[index];
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

  // Logout
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      window.location.reload();
    });
  }

  // Check if user is logged in
  if (localStorage.getItem("loggedIn") === "true") {
    loginContainer.style.display = "none";
    mainPanel.style.display = "block";
    renderTasks();
  } else {
    loginContainer.style.display = "block";
    registerContainer.style.display = "none";
    mainPanel.style.display = "none";
  }

  renderTasks();
});
