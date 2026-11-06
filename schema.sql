-- Mahesh Babu Karanam | Personal Expense Tracker Management System (MySQL 8+)
CREATE DATABASE IF NOT EXISTS expense_tracker; USE expense_tracker;
CREATE TABLE users (user_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL);
CREATE TABLE categories (category_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, category_name VARCHAR(100) NOT NULL, category_type VARCHAR(20) NOT NULL,
  CONSTRAINT chk_ctype CHECK (category_type IN ('income','expense')), FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE);
-- category_id is added to transactions so every transaction can be categorised
CREATE TABLE transactions (trans_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, category_id INT NULL, amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  trans_type VARCHAR(20) NOT NULL, description VARCHAR(255), transaction_date DATE NOT NULL, CONSTRAINT chk_ttype CHECK (trans_type IN ('income','expense')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL);
CREATE TABLE budgets (bud_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, category_id INT NOT NULL, monthly_limit DECIMAL(10,2) NOT NULL CHECK (monthly_limit > 0),
  `month` INT NOT NULL CHECK (`month` BETWEEN 1 AND 12), `year` INT NOT NULL, UNIQUE KEY uq_budget (user_id, category_id, `month`, `year`),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE);
