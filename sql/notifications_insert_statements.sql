-- Insert statements for users table

INSERT INTO users (username, email, password_hash)
VALUES ('alice', 'alice@example.com', 'hashed_password_1');

INSERT INTO users (username, email, password_hash)
VALUES ('bob', 'bob@example.com', 'hashed_password_2');

INSERT INTO users (username, email, password_hash)
VALUES ('charlie', 'charlie@example.com', 'hashed_password_3');

INSERT INTO users (username, email, password_hash)
VALUES ('diana', 'diana@example.com', 'hashed_password_4');

INSERT INTO users (username, email, password_hash)
VALUES ('eve', 'eve@example.com', 'hashed_password_5');

-- Insert statements for notifications table

INSERT INTO notifications (user_id, title, message, is_read)
VALUES (1, 'Welcome!', 'Hello Alice, welcome to our platform.', FALSE);

INSERT INTO notifications (user_id, title, message, is_read)
VALUES (2, 'Account Update', 'Hi Bob, your account details have been updated.', FALSE);

INSERT INTO notifications (user_id, title, message, is_read)
VALUES (3, 'Password Change', 'Charlie, your password was changed successfully.', TRUE);

INSERT INTO notifications (user_id, title, message, is_read)
VALUES (4, 'New Feature', 'Diana, check out our new feature!', FALSE);

INSERT INTO notifications (user_id, title, message, is_read)
VALUES (5, 'Security Alert', 'Eve, we detected a login from a new device.', TRUE);