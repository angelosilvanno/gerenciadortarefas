-- Remove o banco de dados de teste se já existir (evita conflitos em reexecuções)
DROP DATABASE IF EXISTS taskmanager_test;

-- Cria o banco de dados de teste
CREATE DATABSE taskmanager_test;

-- ***A partir daqui, execute este script dentro do banco `taskmanager_test`.***
-- Dependendo do ambiente, conecte-se ao banco `taskmanager_test` e então execute o conteúdo abaixo:
-- Ou copie e cole a partir do seu `db_script.sql` original abaixo
-- Começo da estrutura do banco de dados de teste:

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    priority VARCHAR(50) DEFAULT 'média' CHECK (priority IN ('baixa', 'média', 'alta')),
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em andamento', 'concluída')),
    category VARCHAR(100),
    date_time TIMESTAMP,
    reminder_minutes INTEGER DEFAULT 15,
    fixed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT tasks_user_id_title_key UNIQUE (user_id, title)
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50),
    description TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    user_name VARCHAR(255), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);