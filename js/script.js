document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const registerContainer = document.getElementById("register-container");
  const taskContainer = document.getElementById("task-container");
  const dashboardContainer = document.getElementById("dashboard-container");

  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const taskForm = document.getElementById("task-form");
  const taskList = document.getElementById("task-list");

  const message = document.getElementById("message");
  let editingTaskIndex = null;

  const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  const tagRegex = /^[a-zA-Z0-9-]+$/;

  const showMessage = (msg, isError = true) => {
    message.textContent = msg;
    message.className = isError ? "text-danger mb-3" : "text-success mb-3";
    setTimeout(() => (message.textContent = ""), 4000);
  };

  showRegister?.addEventListener("click", () => {
    loginContainer.style.display = "none";
    registerContainer.style.display = "block";
  });

  showLogin?.addEventListener("click", () => {
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  registerForm?.addEventListener("submit", (e) => {
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
    const emailExists = users.some(user => user.email === email);
    const usernameExists = users.some(user => user.username === username);

    if (emailExists) {
      showMessage("Este e-mail já está cadastrado.");
      return;
    }

    if (usernameExists) {
      showMessage("Nome de usuário já existe.");
      return;
    }

    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("Cadastro realizado com sucesso!", false);
    registerContainer.style.display = "none";
    loginContainer.style.display = "block";
  });

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
      loginContainer.style.display = "none";
      taskContainer.style.display = "block";
      dashboardContainer.style.display = "block";
      renderTasks();
      renderDashboard();
    } else {
      showMessage("Usuário ou senha inválidos.");
    }
  });

  taskForm?.addEventListener("submit", (e) => {
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
      showMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    for (let tag of tags) {
      if (tag && !tagRegex.test(tag)) {
        showMessage("Tag inválida. Use apenas letras, números ou traços.");
        return;
      }
    }

    const task = { title, description, dueDate, priority, status, category, tags };
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (editingTaskIndex !== null) {
      tasks[editingTaskIndex] = task;
      editingTaskIndex = null;
    } else {
      tasks.push(task);
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskForm.reset();
    showMessage("Tarefa salva com sucesso!", false);
    renderTasks();
    renderDashboard();
  });

  function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
      const taskDiv = document.createElement("div");
      taskDiv.classList.add("border", "rounded", "p-2", "mb-2");
      taskDiv.innerHTML = `
        <h5>${task.title}</h5>
        <p>${task.description}</p>
        <p><strong>Prazo:</strong> ${task.dueDate}</p>
        <p><strong>Prioridade:</strong> ${task.priority} | <strong>Status:</strong> ${task.status}</p>
        <p><strong>Categoria:</strong> ${task.category} | <strong>Tags:</strong> ${task.tags.join(", ")}</p>
        <button class="btn btn-sm btn-warning" data-index="${index}">Editar</button>
        <button class="btn btn-sm btn-danger" data-index="${index}">Excluir</button>
      `;
      taskList.appendChild(taskDiv);
    });

    taskList.querySelectorAll(".btn-warning").forEach(button => {
      button.addEventListener("click", (e) => editTask(e.target.getAttribute("data-index")));
    });

    taskList.querySelectorAll(".btn-danger").forEach(button => {
      button.addEventListener("click", (e) => deleteTask(e.target.getAttribute("data-index")));
    });
  }

  function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    showMessage("Tarefa removida com sucesso!", false);
    renderTasks();
    renderDashboard();
  }

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

  function renderDashboard() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    document.getElementById("total-tasks").textContent = tasks.length;

    const completed = tasks.filter(task => task.status.toLowerCase() === "concluída").length;
    const pending = tasks.length - completed;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("pending-tasks").textContent = pending;

    const statusCtx = document.getElementById("statusChart").getContext("2d");
    new Chart(statusCtx, {
      type: "doughnut",
      data: {
        labels: ["Concluídas", "Pendentes"],
        datasets: [{
          data: [completed, pending],
          backgroundColor: ["#28a745", "#ffc107"]
        }]
      }
    });

    const priorityMap = { alta: 0, média: 0, baixa: 0 };
    tasks.forEach(task => {
      const key = task.priority.toLowerCase();
      if (priorityMap.hasOwnProperty(key)) priorityMap[key]++;
    });

    const priorityCtx = document.getElementById("priorityChart").getContext("2d");
    new Chart(priorityCtx, {
      type: "bar",
      data: {
        labels: ["Alta", "Média", "Baixa"],
        datasets: [{
          label: "Tarefas",
          data: [priorityMap.alta, priorityMap.média, priorityMap.baixa],
          backgroundColor: ["#dc3545", "#fd7e14", "#17a2b8"]
        }]
      }
    });

    const urgentList = document.getElementById("urgent-tasks");
    urgentList.innerHTML = "";

    const hoje = new Date();
    const doisDias = new Date();
    doisDias.setDate(hoje.getDate() + 2);

    const urgentes = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate <= doisDias && task.status.toLowerCase() !== "concluída";
    });

    if (urgentes.length === 0) {
      urgentList.innerHTML = "<li class='list-group-item'>Nenhuma tarefa urgente</li>";
    } else {
      urgentes.forEach(task => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${task.title} (prazo: ${task.dueDate})`;
        urgentList.appendChild(li);
      });
    }
  }

  renderTasks();
  renderDashboard();
});
