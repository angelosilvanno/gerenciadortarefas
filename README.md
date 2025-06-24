<h1 align="center">🧪 Projeto de Teste de Software</h1>
<h1 align="center">📃 Gerenciamento de Tarefa: NextTask</h1>

<p align="justify">🧭 Um gerenciador de tarefas online projetado para ajudar os usuários a organizar suas atividades diárias de forma eficiente e intuitiva.</p>

## ✍🏽 Introdução

<p align="justify">📌 O NextTask é uma aplicação web que visa simplificar o gerenciamento de tarefas, permitindo que os usuários criem, editem, priorizem e acompanhem o progresso de suas atividades. O objetivo principal é fornecer uma ferramenta de produtividade que seja fácil de usar, acessível e que ajude os usuários a manterem o foco em suas metas.</p>

<p align="justify">📱 Com o NextTask, você pode se livrar de listas de papel desorganizadas e centralizar todas as suas pendências em um único lugar, acessível de qualquer dispositivo com conexão à internet.</p>

## 💻 Funcionalidades Principais:

* 🔐 **Autenticação de Usuário:**
  * Cadastro de novos usuários com nome de usuário, e-mail e senha.
  * Login seguro para usuários existentes.
  * Funcionalidade de "Esqueci minha senha" (envia mensagem de confirmação).

* ✅ **Gerenciamento de Tarefas:**
  * **Criação de Tarefas:** Adicione novas tarefas com título, descrição detalhada, data e hora de vencimento, prioridade (baixa, média, alta), lembrete e status inicial (pendente).
  * **Edição de Tarefas:** Modifique qualquer informação de uma tarefa existente, incluindo lembrete e data/hora.
  * **Exclusão de Tarefas:** Remova tarefas que não são mais necessárias, com confirmação.
  * **Visualização de Tarefas:** Lista organizada, agrupamento por data, status e prioridade com indicadores visuais.
  * **Atualização de Status:** Marque como "pendente", "em andamento" ou "concluída" diretamente na lista.

* 📂 **Organização e Filtragem:**
  * **Busca:** Pesquise por título ou tags.
  * **Filtro por Status:** Visualize apenas tarefas pendentes, em andamento ou concluídas.
  * **Categorias e Tags:** Atribua categorias e tags múltiplas (separadas por vírgula).

* 📊 **Acompanhamento de Progresso:**
  * Barra de progresso visual.
  * Contador textual de tarefas concluídas.

* 🌗 **Tema Claro e Escuro:**
  * Alternância entre tema escuro e claro com salvamento da preferência.

* 🧰 **Recursos Adicionais:**
  * **📤 Exportação:** Exporte tarefas para CSV.
  * **🔔 Notificações:** Alertas via navegador sobre tarefas próximas (hoje ou amanhã).
  * **📱 Responsividade:** Funciona bem em desktop e mobile.
  * **🔎 Feedbacks Visuais:** Alertas de sucesso/erro.
  * **👋 Modal de Boas-vindas:** Apresentação inicial para novos usuários.

## 🧪 Testes Aplicados

* ✅ **Testes de Caixa Branca:**
  * Validação de campos obrigatórios (como `validarCamposTarefa`, `formatarData`, login, alternância de tema, token).

* ✅ **Testes de Caixa Preta:**
  * Fluxos de uso reais como login inválido, criação com campos vazios, filtros, edição e exclusão de tarefas.

* 🧪 **Automação com Jest:**
  * Cobertura de testes unitários com relatórios.

* 🔄 **CI com GitHub Actions:**
  * Execução automática dos testes a cada push.

## 🔧 Guia de Instalação

1. 🔽 Clone o repositório:
```bash
git clone https://github.com/angelosilvanno/gerenciadortarefas.git
```

2. 📁 Acesse a pasta:
```bash
cd gerenciadortarefas
```

3. 📦 Instale as dependências do back-end:
```bash
cd backend
npm install
```

4. ⚙️ Crie o arquivo `.env`:
```env
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nextask_db
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=sua_chave_secreta
```

5. ▶️ Inicie o servidor:
```bash
node server.js
```

6. 🌐 Abra `index.html` no navegador ou use o Live Server.

## 👷 Autores

* **Ângelo** - 👤 [angelosilvanno](https://github.com/angelosilvanno)
* **Ludmila Monteiro** - 👤 [ludmilamonteiro](https://github.com/LudmilaMonteiro)
* **Mateus Gomes** - 👤 [GSmateus07](https://github.com/GSmateus07)
* **Levítico Rimon** - 👤 [LEVEL303](https://github.com/LEVEL303)
* **Aluizio** - 👤 [aluiziairesjr007](https://github.com/aluiziairesjr007)

## 🛠️ Tecnologias Utilizadas

* 📞 [Google Meet](https://meet.google.com/) — Reuniões e planejamento
* 🧩 [PlantUML](https://plantuml.com/) — Diagramas UML
* 🧠 [Git e GitHub](https://github.com/) — Controle de versão e repositório
* 🧑‍💻 [VS Code](https://code.visualstudio.com/) — Editor de código
* 🗃️ [PostgreSQL](https://www.postgresql.org/) — Banco de dados relacional

## 📄 Licença

Este projeto está licenciado sob a Licença Apache 2.0. Consulte o arquivo [LICENSE.md](https://github.com/angelosilvanno/gerenciadortarefas/tree/main?tab=Apache-2.0-1-ov-file) para mais detalhes.
