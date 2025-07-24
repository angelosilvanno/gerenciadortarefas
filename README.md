<h1 align="center">🧪 Projeto de Teste de Software</h1>
<h1 align="center">📃 Gerenciamento de Tarefa: NextTask</h1>

<p align="center">
  🚀 Acesse o sistema em produção: <a href="https://nextask-app.onrender.com/">nextask-app.onrender.com</a>
</p>

<p align="justify">🧭 Um gerenciador de tarefas online projetado para ajudar os usuários a organizar suas atividades diárias de forma eficiente e intuitiva.</p>

## ✍🏽 Introdução

<p align="justify">📌 O NextTask é uma aplicação web que visa simplificar o gerenciamento de tarefas, permitindo que os usuários criem, editem, priorizem e acompanhem o progresso de suas atividades. O objetivo principal é fornecer uma ferramenta de produtividade que seja fácil de usar, acessível e que ajude os usuários a manterem o foco em suas metas.</p>

<p align="justify">📱 Com o NextTask, você pode se livrar de listas de papel desorganizadas e centralizar todas as suas pendências em um único lugar, acessível de qualquer dispositivo com conexão à internet.</p>

## 💻 Funcionalidades Principais:

* 🔐 **Autenticação de Usuário:**
  * Cadastro de novos usuários com nome de usuário, e-mail e senha.
  * Login seguro para usuários existentes.

* ✅ **Gerenciamento de Tarefas:**
  * **Criação de Tarefas:** Adicione novas tarefas com título, descrição detalhada, data e hora de vencimento, prioridade (baixa, média, alta), lembrete e status inicial (pendente).
  * **Edição de Tarefas:** Modifique qualquer informação de uma tarefa existente, incluindo lembrete e data/hora.
  * **Exclusão de Tarefas:** Remova tarefas que não são mais necessárias, com confirmação.
  * **Visualização de Tarefas:** Lista organizada, agrupamento por data, status e prioridade com indicadores visuais.
  * **Atualização de Status:** Marque como "pendente", "em andamento" ou "concluída" diretamente na lista.

* 📂 **Organização e Filtragem:**
  * **Busca:** Pesquise por título.
  * **Filtro por Status:** Visualize apenas tarefas pendentes, em andamento ou concluídas.
  * **Categorias:** Atribua categorias.

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
  * **⭐ Fixar Tarefas no Topo: Priorize tarefas importantes clicando na estrela (⭐).
  * **😊 Mensagens Positivas sem Tarefas: Quando não há tarefas cadastradas, o sistema exibe mensagens motivacionais e positivas para incentivar o usuário, tornando a experiência mais leve e acolhedora.

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

#### Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes softwares instalados:
* **Node.js** (versão 18.x ou superior)
* **npm** (geralmente instalado com o Node.js)
* **PostgreSQL** (servidor de banco de dados)

#### Passos

1.  **🔽 Clone o Repositório**
    ```bash
    git clone https://github.com/angelosilvanno/gerenciadortarefas.git
    ```

2.  **📁 Acesse a Pasta do Projeto**
    ```bash
    cd gerenciadortarefas
    ```

3.  **⚙️ Configure o Banco de Dados**
    * Acesse o PostgreSQL e crie o banco de dados para a aplicação:
        ```sql
        CREATE DATABASE taskmanager;
        ```
    * Em seguida, execute o script SQL para criar as tabelas necessárias. O script se encontra em: `db/db_script.sql`.

4.  **📦 Instale as Dependências do Backend**
    * Navegue até a pasta do servidor e instale os pacotes necessários.
        ```bash
        cd backend
        npm install
        ```

5.  **🔑 Crie o Arquivo de Variáveis de Ambiente (`.env`)**
    * Ainda na pasta `backend`, crie um arquivo chamado `.env`.
    * Preencha-o com suas credenciais do PostgreSQL e uma chave secreta para o JWT.
        ```env
        # Credenciais do seu banco de dados PostgreSQL
        DB_USER=seu_usuario_do_postgres
        DB_HOST=localhost
        DB_NAME=taskmanager
        DB_PASSWORD=sua_senha_do_postgres
        DB_PORT=5432

        # Chave secreta para gerar os tokens de autenticação
        JWT_SECRET=crie_uma_chave_secreta_longa_e_aleatoria
        ```

6.  **▶️ Inicie o Servidor Backend**
    * Com tudo configurado, inicie o servidor.
      ```bash
      npm start
      ```
    * Se tudo estiver correto, você verá uma mensagem no terminal indicando que o servidor está rodando na porta `3000`.

7.  **🌐 Execute o Frontend**
    * Abra o arquivo `index.html` que está na **raiz do projeto** (`gerenciadortarefas/index.html`) diretamente no seu navegador.
    * **Recomendado:** Utilize a extensão **Live Server** do VS Code para uma melhor experiência de desenvolvimento.

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
