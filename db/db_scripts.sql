-- Tabela para armazenar os usuários e suas credenciais
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela principal para armazenar as tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    -- Regra para garantir que a prioridade seja um dos valores permitidos
    priority VARCHAR(50) DEFAULT 'média' CHECK (priority IN ('baixa', 'média', 'alta')),
    -- Regra para garantir que o status seja um dos valores permitidos
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em andamento', 'concluída')),
    category VARCHAR(100),
    tags TEXT[], -- Campo do tipo array de texto para as tags

    -- Campos adicionados:
    date_time TIMESTAMP,
    reminder_minutes INTEGER DEFAULT 15,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tabela para armazenar os comentários de cada tarefa
CREATE TABLE IF NOT EXISTS  comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Liga o comentário a uma tarefa
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    -- Liga o comentário a um usuário
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tabela para armazenar o histórico de atividades de cada tarefa
CREATE TABLE IF NOT EXISTS  activity_logs (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    user_name VARCHAR(255), -- Nome do usuário para fácil exibição
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Liga o log a uma tarefa
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    -- Liga o log a um usuário
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);