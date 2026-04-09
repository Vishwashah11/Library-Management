// In-Memory Database Simulation
const state = {
    books: [
        { id: 1, title: 'Python Programming', author: 'Guido Van Rossum', copies: 5, category: 'Programming' },
        { id: 2, title: 'Discrete Mathematics', author: 'Kenneth Rosen', copies: 3, category: 'Math' },
        { id: 3, title: 'Design Patterns', author: 'Gang of Four', copies: 2, category: 'Software' }
    ],
    reservations: [],
    issues: []
};

// UI Navigation Logic
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update tabs
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update views
        const role = e.target.getAttribute('data-role');
        document.querySelectorAll('.role-view').forEach(v => v.classList.remove('active-view'));
        document.getElementById(`${role}-view`).classList.add('active-view');
        
        app.refreshViews();
    });
});

// App Logic
const app = {
    // ---- STUDENT ACTIONS ----
    searchBooks: () => {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const results = state.books.filter(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query));
        
        const container = document.getElementById('searchResults');
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted)">No books found.</p>';
            return;
        }

        results.forEach(book => {
            const available = book.copies > 0;
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <h4>${book.title}</h4>
                <p>by ${book.author} <br><span class="badge">${book.category}</span></p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color: ${available ? 'var(--success)' : 'var(--danger)'}">
                        ${book.copies} available
                    </span>
                    ${available ? `<button class="btn action-btn success" onclick="app.reserveBook(${book.id})">Reserve</button>` : ''}
                </div>
            `;
            container.appendChild(card);
        });
    },

    reserveBook: (bookId) => {
        const book = state.books.find(b => b.id === bookId);
        if (book && book.copies > 0) {
            // book.copies--; // we decrease on issue, not strictly reservation in this demo
            const resId = Date.now();
            state.reservations.push({ id: resId, bookId: book.id, bookTitle: book.title, status: 'Pending' });
            alert(`Reservation placed for '${book.title}'`);
            app.searchBooks();
            app.refreshViews();
        }
    },

    requestExtension: (issueId) => {
        const issue = state.issues.find(i => i.id === issueId);
        if(issue) {
            issue.status = 'Extension Pending';
            alert('Extension requested for 7 days.');
            app.refreshViews();
        }
    },

    // ---- LIBRARIAN ACTIONS ----
    approveReservation: (resId) => {
        const resIndex = state.reservations.findIndex(r => r.id === resId);
        if (resIndex > -1) {
            const res = state.reservations[resIndex];
            const book = state.books.find(b => b.id === res.bookId);
            if(book && book.copies > 0) {
                book.copies--;
                state.reservations.splice(resIndex, 1);
                state.issues.push({
                    id: Date.now(),
                    bookId: book.id,
                    bookTitle: book.title,
                    status: 'Issued'
                });
                app.refreshViews();
            } else {
                alert("Book no longer available.");
            }
        }
    },

    processReturn: (issueId) => {
        const issueIndex = state.issues.findIndex(i => i.id === issueId);
        if (issueIndex > -1) {
            const issue = state.issues[issueIndex];
            const book = state.books.find(b => b.id === issue.bookId);
            if(book) book.copies++;
            state.issues.splice(issueIndex, 1);
            app.refreshViews();
        }
    },

    // ---- ADMIN ACTIONS ----
    addBook: () => {
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const copies = parseInt(document.getElementById('bookCopies').value);
        const category = document.getElementById('bookCategory').value;

        if(!title || !author) return alert("Title and Author required");

        state.books.push({
            id: Date.now(),
            title, author, copies, category
        });

        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookCategory').value = '';

        alert('Book added to catalog');
        app.refreshViews();
    },

    // ---- RENDER LOGIC ----
    refreshViews: () => {
        // Student Dash
        document.getElementById('my-reservations').innerHTML = state.reservations.map(r => `<li>${r.bookTitle} - <span style="color:var(--secondary)">${r.status}</span></li>`).join('') || '<li>No active reservations</li>';
        document.getElementById('my-issues').innerHTML = state.issues.map(i => `<li>${i.bookTitle} <button class="btn action-btn text-small" style="float:right; padding:2px 8px" onclick="app.requestExtension(${i.id})">Extend</button></li>`).join('') || '<li>No books issued</li>';

        // Librarian Dash
        document.getElementById('pending-res-count').innerText = state.reservations.length;
        document.getElementById('active-issues-count').innerText = state.issues.length;

        document.getElementById('pending-reservations').innerHTML = state.reservations.map(r => `
            <div class="list-item">
                <span><strong>${r.bookTitle}</strong> (Student ID: 101)</span>
                <button class="btn action-btn success" onclick="app.approveReservation(${r.id})">Approve & Issue</button>
            </div>
        `).join('') || '<p style="color:var(--text-muted)">No pending reservations.</p>';

        document.getElementById('active-issues').innerHTML = state.issues.map(i => `
            <div class="list-item">
                <span><strong>${i.bookTitle}</strong> - Status: ${i.status}</span>
                <button class="btn action-btn" onclick="app.processReturn(${i.id})">Process Return</button>·
            </div>
        `).join('') || '<p style="color:var(--text-muted)">No active issues.</p>';

        // Admin Dash
        document.getElementById('catalogue-list').innerHTML = state.books.map(b => `
            <li><strong>${b.title}</strong> by ${b.author} <span style="float:right">${b.copies} copies</span></li>
        `).join('');
    }
};

// Initial Render
app.searchBooks();
app.refreshViews();
