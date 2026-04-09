/**
 * Stellar Library Management System — Express REST API
 * All data stored in-memory (no database required).
 * Classes mirror the class diagram: Book, User, Student, Librarian,
 * Administrator, Reservation, IssueTransaction, ExtensionRequest.
 */

const express = require('express');
const path    = require('path');
const app     = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────────
//  IN-MEMORY DATABASE  (seeded with demo data)
// ─────────────────────────────────────────────────────────
let _id = 1000;
const nextId = () => ++_id;

const DB = {
  books: [
    { book_id:1, title:'Python Programming',       author:'Guido Van Rossum',    isbn:'978-0-13-468599-1', publisher:'Addison-Wesley', year:2020, copies:5, available_copies:5, category:'Programming',        description:'Comprehensive guide to Python 3, data types, OOP, and standard libraries.', edition:'3rd', location:'A-01' },
    { book_id:2, title:'Discrete Mathematics',     author:'Kenneth Rosen',       isbn:'978-0-07-338309-5', publisher:'McGraw-Hill',    year:2018, copies:3, available_copies:3, category:'Mathematics',        description:'Covering logic, sets, combinatorics, graph theory and algorithm analysis.', edition:'8th', location:'B-05' },
    { book_id:3, title:'Design Patterns',          author:'Gang of Four',        isbn:'978-0-20-163361-5', publisher:'Addison-Wesley', year:1994, copies:2, available_copies:2, category:'Software Engineering',description:'23 foundational object-oriented design patterns with C++ and Smalltalk examples.', edition:'1st', location:'C-12' },
    { book_id:4, title:'The Pragmatic Programmer', author:'David Thomas',        isbn:'978-0-13-595705-9', publisher:'Addison-Wesley', year:2019, copies:4, available_copies:4, category:'Programming',        description:'Tips and techniques for pragmatic programmers for every stage of development.', edition:'20th Anniversary', location:'A-03' },
    { book_id:5, title:'Clean Code',               author:'Robert C. Martin',    isbn:'978-0-13-235088-4', publisher:'Prentice Hall',  year:2008, copies:3, available_copies:3, category:'Software Engineering',description:'A handbook of agile software craftsmanship with real refactoring examples.', edition:'1st', location:'C-09' },
    { book_id:6, title:'Computer Networks',        author:'Andrew Tanenbaum',    isbn:'978-0-13-212695-3', publisher:'Pearson',        year:2021, copies:2, available_copies:2, category:'Networks',           description:'In-depth coverage of network layers, protocols, TCP/IP, and wireless networks.', edition:'6th', location:'D-02' },
    { book_id:7, title:'Introduction to Algorithms',author:'Cormen et al.',      isbn:'978-0-26-204630-5', publisher:'MIT Press',      year:2009, copies:3, available_copies:3, category:'Algorithms',         description:'Comprehensive textbook on algorithms, data structures, and complexity theory.', edition:'3rd', location:'B-01' },
    { book_id:8, title:'Operating System Concepts',author:'Silberschatz',        isbn:'978-1-11-856333-6', publisher:'Wiley',          year:2018, copies:2, available_copies:2, category:'Systems',            description:'Classic OS textbook covering processes, memory, file systems, and I/O.', edition:'10th', location:'D-07' },
  ],
  users: [
    { user_id:1, name:'Alice Student',   email:'alice@uni.edu',          password:'pass', role:'student',   roll_no:'CS2023001', department:'Computer Science',   status:'active',   joined:'2023-07-01' },
    { user_id:2, name:'Bob Wilson',      email:'bob@uni.edu',            password:'pass', role:'student',   roll_no:'CS2023002', department:'Information Tech.',    status:'active',   joined:'2023-07-01' },
    { user_id:3, name:'Sam Librarian',   email:'librarian@library.com',  password:'pass', role:'librarian', librarian_id:'LIB-501',                                status:'active',   joined:'2022-01-15' },
    { user_id:4, name:'Admin User',      email:'admin@library.com',      password:'pass', role:'admin',     admin_id:'ADM-001',                                    status:'active',   joined:'2021-06-01' },
  ],
  reservations:   [],
  issues:         [],        // active issues
  extensions:     [],
  allTransactions:[],        // archived completed transactions
  finePerDay:     5,         // ₹5 per overdue day
};

// ─────────────────────────────────────────────────────────
//  HELPER UTILITIES
// ─────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr, n) => {
  const d = new Date(dateStr); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const calcFine = (dueDateStr) => {
  const due  = new Date(dueDateStr);
  const now  = new Date();
  if (now <= due) return 0;
  const days = Math.ceil((now - due) / 86400000);
  return days * DB.finePerDay;
};
const findBook   = id => DB.books.find(b => b.book_id   === +id);
const findUser   = id => DB.users.find(u => u.user_id   === +id);
const findIssue  = id => DB.issues.find(i => i.issue_id === +id);
const findRes    = id => DB.reservations.find(r => r.reservation_id === +id);
const findExt    = id => DB.extensions.find(e => e.extension_id    === +id);

// ─────────────────────────────────────────────────────────
//  MIDDLEWARE — simple session via X-User-Id / X-User-Role
//  (no JWT needed for in-memory demo)
// ─────────────────────────────────────────────────────────
const auth = (allowedRoles) => (req, res, next) => {
  const uid  = +req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  if (!uid || !role) return res.status(401).json({ error: 'Not authenticated' });
  if (allowedRoles && !allowedRoles.includes(role))
    return res.status(403).json({ error: `Access denied. Requires: ${allowedRoles.join(' or ')}` });
  req.currentUser = findUser(uid);
  req.userRole    = role;
  next();
};

// ─────────────────────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────────────────────
// POST /api/auth/login  { email, password?, role? }
app.post('/api/auth/login', (req, res) => {
  const { email, name, role } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let user = DB.users.find(u => u.email === email);
  if (!user) {
    // Auto-register for demo
    const newRole = role || 'student';
    user = {
      user_id: nextId(), name: name || email.split('@')[0],
      email, password: 'pass', role: newRole, status: 'active', joined: today(),
    };
    if (newRole === 'student')   { user.roll_no = `CS${Date.now().toString().slice(-6)}`; user.department = 'Computer Science'; }
    if (newRole === 'librarian') { user.librarian_id = `LIB-${nextId()}`; }
    if (newRole === 'admin')     { user.admin_id = `ADM-${nextId()}`; }
    DB.users.push(user);
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, message: `Welcome, ${user.name}!` });
});

// GET /api/auth/me
app.get('/api/auth/me', auth(), (req, res) => res.json(req.currentUser));

// ─────────────────────────────────────────────────────────
//  BOOK CATALOG ROUTES
// ─────────────────────────────────────────────────────────
// GET /api/books  ?search=&category=&available=
app.get('/api/books', (req, res) => {
  let books = [...DB.books];
  const { search, category, available } = req.query;
  if (search) {
    const q = search.toLowerCase();
    books = books.filter(b =>
      b.title.toLowerCase().includes(q)   ||
      b.author.toLowerCase().includes(q)  ||
      b.isbn.includes(q)                  ||
      b.category.toLowerCase().includes(q)
    );
  }
  if (category) books = books.filter(b => b.category === category);
  if (available === 'true') books = books.filter(b => b.available_copies > 0);
  res.json(books);
});

// GET /api/books/:id   — full book details
app.get('/api/books/:id', (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  // Attach live stats
  const activeIssues = DB.issues.filter(i => i.book_id === book.book_id).length;
  const pendingRes   = DB.reservations.filter(r => r.book_id === book.book_id && r.status === 'pending').length;
  res.json({ ...book, active_issues: activeIssues, pending_reservations: pendingRes });
});

// POST /api/books  — Admin/Librarian add book
app.post('/api/books', auth(['admin', 'librarian']), (req, res) => {
  const { title, author, isbn, publisher, year, copies, category, description, edition, location } = req.body;
  if (!title || !author || !copies) return res.status(400).json({ error: 'title, author and copies are required' });
  const book = {
    book_id: nextId(), title, author,
    isbn: isbn || 'N/A', publisher: publisher || 'Unknown',
    year: year || new Date().getFullYear(),
    copies: +copies, available_copies: +copies,
    category: category || 'General',
    description: description || '',
    edition: edition || '1st',
    location: location || 'TBD',
  };
  DB.books.push(book);
  res.status(201).json({ book, message: `Book "${title}" added to catalog.` });
});

// PUT /api/books/:id  — Admin/Librarian update book
app.put('/api/books/:id', auth(['admin', 'librarian']), (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const allowed = ['title','author','isbn','publisher','year','category','description','edition','location'];
  allowed.forEach(f => { if (req.body[f] !== undefined) book[f] = req.body[f]; });
  if (req.body.copies !== undefined) {
    const diff = +req.body.copies - book.copies;
    book.copies = +req.body.copies;
    book.available_copies = Math.max(0, book.available_copies + diff);
  }
  res.json({ book, message: 'Book updated.' });
});

// DELETE /api/books/:id  — Admin only
app.delete('/api/books/:id', auth(['admin']), (req, res) => {
  const idx = DB.books.findIndex(b => b.book_id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  const [removed] = DB.books.splice(idx, 1);
  res.json({ message: `"${removed.title}" removed from catalog.` });
});

// PATCH /api/books/:id/availability  — Librarian toggle availability
app.patch('/api/books/:id/availability', auth(['admin', 'librarian']), (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const { available } = req.body;
  book.available_copies = available ? book.copies : 0;
  res.json({ book, message: `"${book.title}" availability set to ${available ? 'Available' : 'Unavailable'}.` });
});

// GET /api/books/categories/list
app.get('/api/books/categories/list', (req, res) => {
  const cats = [...new Set(DB.books.map(b => b.category))].sort();
  res.json(cats);
});

// ─────────────────────────────────────────────────────────
//  USER MANAGEMENT ROUTES
// ─────────────────────────────────────────────────────────
// GET /api/users  — Admin/Librarian
app.get('/api/users', auth(['admin', 'librarian']), (req, res) => {
  const { role } = req.query;
  let users = DB.users.map(({ password: _, ...u }) => u);
  if (role) users = users.filter(u => u.role === role);
  res.json(users);
});

// GET /api/users/:id
app.get('/api/users/:id', auth(['admin', 'librarian']), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safe } = user;
  const myIssues = DB.issues.filter(i => i.student_id === user.user_id);
  const myRes    = DB.reservations.filter(r => r.student_id === user.user_id);
  const myTx     = DB.allTransactions.filter(t => t.student_id === user.user_id);
  res.json({ ...safe, active_issues: myIssues, reservations: myRes, transaction_count: myTx.length });
});

// PUT /api/users/:id  — Admin update user
app.put('/api/users/:id', auth(['admin']), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const allowed = ['name','department','roll_no','status','permissions'];
  allowed.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
  const { password: _, ...safe } = user;
  res.json({ user: safe, message: 'User updated.' });
});

// POST /api/users/:id/permission  — Admin give permission
app.post('/api/users/:id/permission', auth(['admin']), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { permission } = req.body;
  if (!user.permissions) user.permissions = [];
  if (!user.permissions.includes(permission)) user.permissions.push(permission);
  res.json({ message: `Permission "${permission}" granted to ${user.name}.`, permissions: user.permissions });
});

// ─────────────────────────────────────────────────────────
//  RESERVATION ROUTES
// ─────────────────────────────────────────────────────────
// GET /api/reservations  ?student_id= &status= &book_id=
app.get('/api/reservations', auth(['admin', 'librarian', 'student']), (req, res) => {
  const { student_id, status, book_id } = req.query;
  let list = DB.reservations;
  if (req.userRole === 'student') list = list.filter(r => r.student_id === req.currentUser.user_id);
  if (student_id) list = list.filter(r => r.student_id === +student_id);
  if (book_id)    list = list.filter(r => r.book_id    === +book_id);
  if (status)     list = list.filter(r => r.status     === status);
  // Enrich with names
  const enriched = list.map(r => ({
    ...r,
    book_title:   (findBook(r.book_id) || {}).title,
    student_name: (findUser(r.student_id) || {}).name,
  }));
  res.json(enriched);
});

// POST /api/reservations  — Student reserve a book
app.post('/api/reservations', auth(['student', 'admin', 'librarian']), (req, res) => {
  const { book_id, student_id } = req.body;
  const sid  = student_id || req.currentUser.user_id;
  const book = findBook(book_id);
  if (!book)                        return res.status(404).json({ error: 'Book not found' });
  if (book.available_copies <= 0)   return res.status(400).json({ error: 'Book not available for reservation' });
  const dup = DB.reservations.find(r => r.student_id === +sid && r.book_id === +book_id && r.status === 'pending');
  if (dup) return res.status(400).json({ error: 'You already have a pending reservation for this book' });

  const res_ = {
    reservation_id:   nextId(),
    student_id:       +sid,
    book_id:          +book_id,
    reservation_date: today(),
    status:           'pending',
    amount:           0,
  };
  DB.reservations.push(res_);
  book.available_copies -= 1;
  res.status(201).json({ reservation: { ...res_, book_title: book.title }, message: `Reservation for "${book.title}" submitted. Awaiting librarian approval.` });
});

// PATCH /api/reservations/:id/approve  — Librarian/Admin
app.patch('/api/reservations/:id/approve', auth(['librarian', 'admin']), (req, res) => {
  const r = findRes(req.params.id);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  if (r.status !== 'pending') return res.status(400).json({ error: `Reservation is already ${r.status}` });
  r.status = 'approved';
  res.json({ reservation: r, message: `Reservation #${r.reservation_id} approved.` });
});

// PATCH /api/reservations/:id/reject  — Librarian/Admin
app.patch('/api/reservations/:id/reject', auth(['librarian', 'admin']), (req, res) => {
  const r = findRes(req.params.id);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  if (r.status !== 'pending') return res.status(400).json({ error: `Reservation is already ${r.status}` });
  const book = findBook(r.book_id);
  if (book) book.available_copies += 1;
  r.status = 'rejected';
  res.json({ reservation: r, message: `Reservation #${r.reservation_id} rejected. Book copy restored.` });
});

// GET /api/reservations/:id
app.get('/api/reservations/:id', auth(['admin', 'librarian', 'student']), (req, res) => {
  const r = findRes(req.params.id);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  res.json({ ...r, book_title: (findBook(r.book_id)||{}).title, student_name: (findUser(r.student_id)||{}).name });
});

// ─────────────────────────────────────────────────────────
//  ISSUE / BORROW ROUTES
// ─────────────────────────────────────────────────────────
// GET /api/issues  ?student_id= &book_id=
app.get('/api/issues', auth(['admin', 'librarian', 'student']), (req, res) => {
  const { student_id, book_id } = req.query;
  let list = DB.issues;
  if (req.userRole === 'student') list = list.filter(i => i.student_id === req.currentUser.user_id);
  if (student_id) list = list.filter(i => i.student_id === +student_id);
  if (book_id)    list = list.filter(i => i.book_id    === +book_id);
  const enriched = list.map(i => ({
    ...i,
    fine_amount:  calcFine(i.due_date),
    book_title:   (findBook(i.book_id)   || {}).title,
    student_name: (findUser(i.student_id)|| {}).name,
    is_overdue:   new Date() > new Date(i.due_date),
  }));
  res.json(enriched);
});

// GET /api/issues/:id
app.get('/api/issues/:id', auth(['admin', 'librarian', 'student']), (req, res) => {
  const i = findIssue(req.params.id);
  if (!i) return res.status(404).json({ error: 'Issue not found' });
  res.json({
    ...i,
    fine_amount:  calcFine(i.due_date),
    book_title:   (findBook(i.book_id)   || {}).title,
    student_name: (findUser(i.student_id)|| {}).name,
    is_overdue:   new Date() > new Date(i.due_date),
  });
});

// POST /api/issues  — Librarian issue (borrow) a book
app.post('/api/issues', auth(['librarian', 'admin']), (req, res) => {
  const { student_id, book_id, days } = req.body;
  if (!student_id || !book_id) return res.status(400).json({ error: 'student_id and book_id required' });
  const book    = findBook(book_id);
  const student = findUser(student_id);
  if (!book)    return res.status(404).json({ error: 'Book not found' });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (book.available_copies <= 0) return res.status(400).json({ error: 'No available copies to issue' });
  // Check student doesn't already have this book
  const already = DB.issues.find(i => i.student_id === +student_id && i.book_id === +book_id);
  if (already) return res.status(400).json({ error: 'Student already has this book issued' });

  const dueDays = +days || 14;
  const issue = {
    issue_id:    nextId(),
    student_id:  +student_id,
    book_id:     +book_id,
    issue_date:  today(),
    due_date:    addDays(today(), dueDays),
    return_date: null,
    fine_amount: 0,
    issued_by:   req.currentUser.user_id,
  };
  DB.issues.push(issue);
  // Archive a copy for transaction log
  DB.allTransactions.push({ ...issue, status: 'active' });
  book.available_copies -= 1;
  res.status(201).json({
    issue: { ...issue, book_title: book.title, student_name: student.name },
    message: `"${book.title}" issued to ${student.name}. Due: ${issue.due_date}.`,
  });
});

// POST /api/issues/:id/return  — Librarian process return
app.post('/api/issues/:id/return', auth(['librarian', 'admin']), (req, res) => {
  const idx = DB.issues.findIndex(i => i.issue_id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Active issue not found' });
  const issue = DB.issues[idx];
  const book  = findBook(issue.book_id);
  const fine  = calcFine(issue.due_date);

  issue.return_date = today();
  issue.fine_amount = fine;

  // Update archived transaction
  const tx = DB.allTransactions.find(t => t.issue_id === issue.issue_id);
  if (tx) { tx.return_date = today(); tx.fine_amount = fine; tx.status = 'returned'; }

  // Return copy to shelf
  if (book) book.available_copies += 1;

  // Save a snapshot then remove from active list
  const completed = { ...issue };
  DB.issues.splice(idx, 1);

  res.json({
    transaction: { ...completed, book_title: (book||{}).title },
    fine_charged: fine,
    message: fine > 0
      ? `Book returned with ₹${fine} fine (${Math.ceil((new Date()-new Date(completed.due_date))/86400000)} days overdue).`
      : `Book returned successfully. No fine.`,
  });
});

// ─────────────────────────────────────────────────────────
//  EXTENSION REQUEST ROUTES
// ─────────────────────────────────────────────────────────
// GET /api/extensions  ?issue_id= &status=
app.get('/api/extensions', auth(['admin', 'librarian', 'student']), (req, res) => {
  const { issue_id, status } = req.query;
  let list = DB.extensions;
  if (req.userRole === 'student') {
    const myIssueIds = [
      ...DB.issues.filter(i => i.student_id === req.currentUser.user_id).map(i => i.issue_id),
      ...DB.allTransactions.filter(t => t.student_id === req.currentUser.user_id).map(t => t.issue_id),
    ];
    list = list.filter(e => myIssueIds.includes(e.issue_id));
  }
  if (issue_id) list = list.filter(e => e.issue_id === +issue_id);
  if (status)   list = list.filter(e => e.status   === status);
  const enriched = list.map(e => {
    const issue = DB.issues.find(i => i.issue_id === e.issue_id) || DB.allTransactions.find(t => t.issue_id === e.issue_id);
    return { ...e, book_title: (findBook((issue||{}).book_id)||{}).title, student_name: (findUser((issue||{}).student_id)||{}).name };
  });
  res.json(enriched);
});

// POST /api/extensions  — Student request extension
app.post('/api/extensions', auth(['student', 'admin', 'librarian']), (req, res) => {
  const { issue_id, extra_days, reason } = req.body;
  if (!issue_id || !extra_days) return res.status(400).json({ error: 'issue_id and extra_days required' });
  const issue = findIssue(issue_id);
  if (!issue) return res.status(404).json({ error: 'Active issue not found' });
  if (req.userRole === 'student' && issue.student_id !== req.currentUser.user_id)
    return res.status(403).json({ error: 'Not your issue' });
  const already = DB.extensions.find(e => e.issue_id === +issue_id && e.status === 'pending');
  if (already) return res.status(400).json({ error: 'A pending extension already exists for this issue' });

  const ext = {
    extension_id: nextId(),
    issue_id:     +issue_id,
    return_date:  issue.due_date,
    moew_days:    +extra_days,
    reason:       reason || '',
    status:       'pending',
    requested_at: today(),
    student_id:   issue.student_id,
  };
  DB.extensions.push(ext);
  res.status(201).json({ extension: ext, message: `Extension of ${extra_days} days requested for Issue #${issue_id}.` });
});

// PATCH /api/extensions/:id/approve  — Librarian
app.patch('/api/extensions/:id/approve', auth(['librarian', 'admin']), (req, res) => {
  const ext = findExt(req.params.id);
  if (!ext) return res.status(404).json({ error: 'Extension not found' });
  if (ext.status !== 'pending') return res.status(400).json({ error: `Extension is already ${ext.status}` });
  ext.status      = 'approved';
  ext.actioned_at = today();
  // Push the due date forward
  const issue = findIssue(ext.issue_id);
  if (issue) issue.due_date = addDays(issue.due_date, ext.moew_days);
  // Also update archived tx
  const tx = DB.allTransactions.find(t => t.issue_id === ext.issue_id);
  if (tx && issue) tx.due_date = issue.due_date;
  res.json({ extension: ext, new_due_date: issue ? issue.due_date : null, message: `Extension #${ext.extension_id} approved. Due date extended by ${ext.moew_days} days.` });
});

// PATCH /api/extensions/:id/reject  — Librarian
app.patch('/api/extensions/:id/reject', auth(['librarian', 'admin']), (req, res) => {
  const ext = findExt(req.params.id);
  if (!ext) return res.status(404).json({ error: 'Extension not found' });
  if (ext.status !== 'pending') return res.status(400).json({ error: `Extension is already ${ext.status}` });
  ext.status      = 'rejected';
  ext.actioned_at = today();
  res.json({ extension: ext, message: `Extension #${ext.extension_id} rejected.` });
});

// ─────────────────────────────────────────────────────────
//  TRANSACTION / AUDIT ROUTES
// ─────────────────────────────────────────────────────────
// GET /api/transactions  — full audit log
app.get('/api/transactions', auth(['admin', 'librarian', 'student']), (req, res) => {
  const { student_id, book_id, status } = req.query;
  let list = DB.allTransactions;
  if (req.userRole === 'student') list = list.filter(t => t.student_id === req.currentUser.user_id);
  if (student_id) list = list.filter(t => t.student_id === +student_id);
  if (book_id)    list = list.filter(t => t.book_id    === +book_id);
  if (status)     list = list.filter(t => t.status === status);
  const enriched = list.map(t => ({
    ...t,
    fine_amount:  t.return_date ? t.fine_amount : calcFine(t.due_date),
    book_title:   (findBook(t.book_id)   || {}).title,
    student_name: (findUser(t.student_id)|| {}).name,
    is_overdue:   !t.return_date && new Date() > new Date(t.due_date),
  }));
  res.json(enriched);
});

// GET /api/transactions/:id
app.get('/api/transactions/:id', auth(['admin', 'librarian', 'student']), (req, res) => {
  const t = DB.allTransactions.find(x => x.issue_id === +req.params.id);
  if (!t) return res.status(404).json({ error: 'Transaction not found' });
  res.json({
    ...t,
    fine_amount:  t.return_date ? t.fine_amount : calcFine(t.due_date),
    book_title:   (findBook(t.book_id)   || {}).title,
    student_name: (findUser(t.student_id)|| {}).name,
    is_overdue:   !t.return_date && new Date() > new Date(t.due_date),
  });
});

// ─────────────────────────────────────────────────────────
//  REPORTS / DASHBOARD  — Admin + Librarian
// ─────────────────────────────────────────────────────────
app.get('/api/reports/summary', auth(['admin', 'librarian']), (req, res) => {
  const totalFinesCollected = DB.allTransactions
    .filter(t => t.return_date && t.fine_amount > 0)
    .reduce((sum, t) => sum + t.fine_amount, 0);
  const pendingFines = DB.issues
    .reduce((sum, i) => sum + calcFine(i.due_date), 0);

  res.json({
    total_books:           DB.books.length,
    total_copies:          DB.books.reduce((s, b) => s + b.copies, 0),
    available_copies:      DB.books.reduce((s, b) => s + b.available_copies, 0),
    total_users:           DB.users.length,
    total_students:        DB.users.filter(u => u.role === 'student').length,
    total_librarians:      DB.users.filter(u => u.role === 'librarian').length,
    active_issues:         DB.issues.length,
    overdue_issues:        DB.issues.filter(i => new Date() > new Date(i.due_date)).length,
    pending_reservations:  DB.reservations.filter(r => r.status === 'pending').length,
    approved_reservations: DB.reservations.filter(r => r.status === 'approved').length,
    pending_extensions:    DB.extensions.filter(e => e.status === 'pending').length,
    total_transactions:    DB.allTransactions.length,
    fines_collected:       totalFinesCollected,
    pending_fines:         pendingFines,
    categories:            [...new Set(DB.books.map(b => b.category))].length,
  });
});

// GET /api/reports/overdue  — list overdue books
app.get('/api/reports/overdue', auth(['admin', 'librarian']), (req, res) => {
  const overdue = DB.issues
    .filter(i => new Date() > new Date(i.due_date))
    .map(i => ({
      ...i,
      fine_amount:  calcFine(i.due_date),
      days_overdue: Math.ceil((new Date() - new Date(i.due_date)) / 86400000),
      book_title:   (findBook(i.book_id)   || {}).title,
      student_name: (findUser(i.student_id)|| {}).name,
      student_email:(findUser(i.student_id)|| {}).email,
    }));
  res.json(overdue);
});

// GET /api/reports/popular — most borrowed books
app.get('/api/reports/popular', auth(['admin', 'librarian']), (req, res) => {
  const counts = {};
  DB.allTransactions.forEach(t => { counts[t.book_id] = (counts[t.book_id] || 0) + 1; });
  const result = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([book_id, count]) => ({ ...(findBook(book_id) || {}), borrow_count: count }));
  res.json(result);
});

// ─────────────────────────────────────────────────────────
//  SETTINGS  — Admin
// ─────────────────────────────────────────────────────────
app.get('/api/settings', auth(['admin']), (req, res) => {
  res.json({ fine_per_day: DB.finePerDay });
});
app.put('/api/settings', auth(['admin']), (req, res) => {
  if (req.body.fine_per_day !== undefined) DB.finePerDay = +req.body.fine_per_day;
  res.json({ fine_per_day: DB.finePerDay, message: 'Settings updated.' });
});

// ─────────────────────────────────────────────────────────
//  FALLBACK → SPA
// ─────────────────────────────────────────────────────────
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ─────────────────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Stellar Library Management System      ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  🟢  Server : http://localhost:${PORT}       ║`);
  console.log('║                                          ║');
  console.log('║  API Endpoints:                          ║');
  console.log('║  POST /api/auth/login                    ║');
  console.log('║  GET  /api/books                         ║');
  console.log('║  POST /api/books          (lib/admin)    ║');
  console.log('║  GET  /api/reservations                  ║');
  console.log('║  POST /api/reservations   (student)      ║');
  console.log('║  POST /api/issues         (librarian)    ║');
  console.log('║  POST /api/issues/:id/return             ║');
  console.log('║  POST /api/extensions     (student)      ║');
  console.log('║  GET  /api/transactions                  ║');
  console.log('║  GET  /api/reports/summary               ║');
  console.log('╚══════════════════════════════════════════╝\n');
});
