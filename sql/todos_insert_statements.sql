-- Insert statements for the 'todos' table

INSERT INTO todos (title, description, is_completed, created_at)
VALUES ('Buy groceries', 'Milk, Bread, Eggs', false, CURRENT_TIMESTAMP);

INSERT INTO todos (title, description, is_completed, created_at)
VALUES ('Finish report', 'Complete the quarterly financial report', true, CURRENT_TIMESTAMP);

INSERT INTO todos (title, description, is_completed, created_at)
VALUES ('Call plumber', 'Fix the leaking kitchen sink', true, CURRENT_TIMESTAMP);

INSERT INTO todos (title, description, is_completed, created_at)
VALUES ('Schedule meeting', 'Team sync-up on project status', false, CURRENT_TIMESTAMP);

INSERT INTO todos (title, description, is_completed, created_at)
VALUES ('Read book', 'Read ''Clean Code'' by Robert C. Martin', false, CURRENT_TIMESTAMP);