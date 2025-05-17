const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();

// 連接到 MongoDB
mongoose.connect('');

// 設定 EJS 作為模板引擎
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.static('public'));

// 設定 multer 儲存位置和檔名
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // 確保這個資料夾存在
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 使用時間戳作為檔名
    }
});
const upload = multer({ storage });

// 語言資料
const messages = {
    en: {
        login: "Login",
        logout: "Logout",
        books: "Books",
        readingHistory: "Reading History",
        addBook: "Add Book",
        favorites: "Favorites",
        username: "Username",
        password: "Password",
        search: "Search",
        reset: "Reset",
        searchPlaceholder: "Search by title or author",
        author: "Author",
        delete: "Delete",
        markAsRead: "Mark as Read",
        edit: "Edit",
        favorite: "Favorite",
        unfavorite: "Unfavorite",
        managementMenu: "Menu",
        addBook: "Add Book",
        editBook: "Edit Book",
        readingHistory: "Reading History",
        title: "Title",
        author: "Author",
        description: "Description",
        cover: "Cover URL",
        coverPlaceholder: "Leave blank to keep the original cover",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        backToBooks: "Back to Books",
        noHistory: "No reading history available.",
        readTime: "Read Time",
        actions: "Actions",
        unmarkAsRead: "Unmark as Read",
        favorites: "Favorites",
        noFavorites: "No favorite books available.",
        author: "Author",
        favorite: "Favorite",
        unfavorite: "Unfavorite",
        edit: "Edit",
        backToBooks: "Back to Books",
        upload: "Upload Here:",
        loginFailed: "Invaild Login Name Or Password！"
        // 添加其他翻譯
    },
    zh: {
        login: "登入",
        logout: "登出",
        books: "書籍",
        readingHistory: "閱讀歷史",
        addBook: "新增書籍",
        favorites: "收藏",
        username: "使用者名稱",
        password: "密碼",
        search: "搜尋",
        reset: "重設",
        searchPlaceholder: "搜尋書名或作者",
        author: "作者",
        delete: "刪除",
        markAsRead: "標記為已讀",
        edit: "修改",
        favorite: "收藏",
        unfavorite: "取消收藏",
        managementMenu: "選單",
        addBook: "添加書籍",
        editBook: "修改書籍",
        readingHistory: "閱讀歷史",
        title: "書名",
        author: "作者",
        description: "描述",
        cover: "封面 URL",
        coverPlaceholder: "留空以保持原封面",
        saveChanges: "儲存修改",
        cancel: "取消",
        backToBooks: "返回書籍管理",
        noHistory: "目前沒有閱讀歷史。",
        readTime: "閱讀時間",
        actions: "操作",
        unmarkAsRead: "取消標示為已讀",
        favorites: "收藏書籍",
        noFavorites: "目前沒有收藏的書籍。",
        author: "作者",
        favorite: "收藏",
        unfavorite: "取消收藏",
        edit: "修改",
        backToBooks: "返回書籍管理",
        upload: "或上傳封面圖片:",
        loginFailed: "登入名稱或密碼無效！"
        // 添加其他翻譯
    },
};

// 書籍模型
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    cover: String,
    isFavorite: { type: Boolean, default: false }
});
const Book = mongoose.model('Book', bookSchema);

// 預設帳號
const USERNAME = 'root';
const PASSWORD = 'test12345';

// Set language route
app.post('/set-language/:lang', (req, res) => {
    req.session.language = req.params.lang; 
    res.redirect(req.get('referer')); // Redirect to the referring page
});

// Login page
app.get('/', (req, res) => {
    const language = req.session.language || 'zh';
    res.render('login', { messages: messages[language], error: null });
});

// Login logic
app.post('/login', (req, res) => {
    if (req.body.username === USERNAME && req.body.password === PASSWORD) {
        req.session.loggedIn = true;
        res.redirect('/books');
    } else {
        const language = req.session.language || 'zh';
        const errorMessage = messages[language].loginFailed;
        res.render('login', { messages: messages[language], error: errorMessage });
    }
});

// 書籍路由
app.get('/books', async (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    const language = req.session.language || 'zh';
    const books = await Book.find();
    res.render('books', { books, messages: messages[language] });
});

// 添加書籍的頁面
app.get('/books/add', (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    const language = req.session.language || 'zh';
    res.render('add-book', { messages: messages[language] });
});

// 處理添加書籍的請求
app.post('/books/add', upload.single('coverFile'), async (req, res) => {
    const { title, author, description } = req.body;
    const cover = req.file ? `/uploads/${req.file.filename}` : req.body.cover; // 使用上傳的檔案或 URL
    const newBook = new Book({ title, author, description, cover });
    await newBook.save();
    res.redirect('/books');
});

// 搜索書籍
app.get('/books/search', async (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    const language = req.session.language || 'zh';
    const query = req.query.q;
    let books;

    if (query) {
        books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });
    } else {
        books = await Book.find();
    }

    res.render('books', { books, messages: messages[language] });
});

// 刪除書籍
app.post('/books/delete/:id', async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
});

// 獲取編輯書籍頁面
app.get('/books/edit/:id', async (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    const language = req.session.language || 'zh';
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('書籍未找到');
        }
        res.render('edit', { book, messages: messages[language] });
    } catch (error) {
        console.error(error);
        res.status(500).send('伺服器錯誤');
    }
});

// 更新書籍資訊
// Update book info
app.post('/books/edit/:id', upload.single('coverFile'), async (req, res) => {
    const { title, author, description, cover } = req.body;  // Ensure 'cover' is included in the form submission
    const updates = { title, author, description };

    // Check if a file was uploaded
    if (req.file) {
        updates.cover = `/uploads/${req.file.filename}`; // Use uploaded file
    } else if (cover) {
        updates.cover = cover; // Use provided cover URL
    }

    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updatedBook) {
            return res.status(404).send('書籍未找到');
        }
        res.redirect('/books');
    } catch (error) {
        console.error(error);
        res.status(500).send('更新失敗，請再試一次！');
    }
});

// 收藏書籍
app.post('/books/favorite/:id', async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (book) {
        book.isFavorite = !book.isFavorite;
        await book.save();
        console.log(`Book ${book.title} favorite status: ${book.isFavorite}`);
    } else {
        console.log(`Book with id ${req.params.id} not found`);
    }
    res.redirect('/books');
});

// 顯示收藏書籍的頁面
app.get('/books/favorites', async (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    const language = req.session.language || 'zh';
    const favoriteBooks = await Book.find({ isFavorite: true });
    res.render('favorites', { books: favoriteBooks, messages: messages[language] });
});

// 新增閱讀歷史模型
const readingHistorySchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    userId: { type: String },
    readAt: { type: Date, default: Date.now }
});

const ReadingHistory = mongoose.model('ReadingHistory', readingHistorySchema);

// 顯示閱讀歷史的頁面
app.get('/reading-history', async (req, res) => {
    if (!req.session.loggedIn) return res.redirect('/');
    const language = req.session.language || 'zh';
    const history = await ReadingHistory.find().populate('bookId');
    res.render('reading-history', { history, messages: messages[language] });
});

// 記錄閱讀事件
app.post('/reading/:id', async (req, res) => {
    const readingRecord = new ReadingHistory({
        bookId: req.params.id,
        userId: req.session.userId
    });
    await readingRecord.save();
    res.redirect('/books');
});

// 取消標示為已讀
app.post('/reading/unmark/:id', async (req, res) => {
    await ReadingHistory.findByIdAndDelete(req.params.id);
    res.redirect('/reading-history');
});

// 登出
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// 啟動伺服器
app.listen(3000, () => {
    console.log('伺服器正在運行於 http://localhost:3000');
});
