# Personal Expense Tracker Management System
Created by Mahesh Babu Karanam. Built with HTML, CSS, JavaScript, Express.js and MySQL.

## Run it
1. Install Node.js and MySQL.
2. Create the database: `mysql -u root -p < database/schema.sql`
3. Open `server.js` and put your MySQL password in `CFG` (or set the DB_PASSWORD environment variable).
4. In this folder run: `npm install` then `npm start`
5. Open http://localhost:3000, click "New here?" and register.

## Pages
- public/index.html: login and dashboard
- public/pages/users.html, categories.html, transactions.html, budgets.html, reports.html

## Quick preview without Node or MySQL
Open `public/index.html` in a browser. It runs in demo mode (data saved in the browser). Login: demo@mahesh.com / demo123

## Database tables
users, categories, transactions, budgets (see database/schema.sql).
Note: `category_id` was added to the transactions table so each transaction can be categorised and compared with budgets.
