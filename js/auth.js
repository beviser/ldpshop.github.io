// ============================================
// LDP TOOLS - AUTHENTICATION SYSTEM
// Handles login, register, and session management
// ============================================

// Initialize default admin account
function initializeSystem() {
    // Check if users exist in localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Create admin account if not exists
    const adminExists = users.some(u => u.username === 'bevis');
    if (!adminExists) {
        users.push({
            username: 'bevis',
            password: 'leduc',
            isAdmin: true,
            createdAt: new Date().toISOString(),
            tools: {
                toolv1: { active: false, expiry: null, key: null },
                toolmd5: { active: false, expiry: null, key: null },
                toolsicbo: { active: false, expiry: null, key: null }
            }
        });
        localStorage.setItem('users', JSON.stringify(users));
        console.log('✅ Admin account created');
    }
    
    // Initialize other storage if needed
    if (!localStorage.getItem('keys')) {
        localStorage.setItem('keys', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', JSON.stringify([]));
    }
}

// Call initialization
initializeSystem();

// ============================================
// LOGIN FUNCTION
// ============================================
function login(username, password) {
    console.log('🔐 Attempting login:', username);
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        showNotification('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
        return false;
    }
    
    // Save current user session
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Show success notification
    showNotification('Đăng nhập thành công! Đang chuyển hướng...', 'success');
    
    // Redirect to home page after 1 second
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1000);
    
    return true;
}

// ============================================
// REGISTER FUNCTION
// ============================================
function register(username, password, confirmPassword) {
    console.log('📝 Attempting registration:', username);
    
    // Validation
    if (!username || !password || !confirmPassword) {
        showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
        return false;
    }
    
    if (username.length < 3) {
        showNotification('Tên tài khoản phải có ít nhất 3 ký tự!', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return false;
    }
    
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.username === username);
    
    if (userExists) {
        showNotification('Tên tài khoản đã tồn tại!', 'error');
        return false;
    }
    
    // Create new user
    const newUser = {
        username: username,
        password: password,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        tools: {
            toolv1: { active: false, expiry: null, key: null },
            toolmd5: { active: false, expiry: null, key: null },
            toolsicbo: { active: false, expiry: null, key: null }
        }
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ User registered successfully:', username);
    
    // Show success notification
    showNotification('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');
    
    // Redirect to login page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
    
    return true;
}

// ============================================
// LOGOUT FUNCTION
// ============================================
function logout() {
    console.log('🚪 Logging out...');
    
    localStorage.removeItem('currentUser');
    showNotification('Đã đăng xuất thành công!', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ============================================
// CHECK AUTHENTICATION
// ============================================
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Not logged in, redirect to login page
        if (window.location.pathname !== '/index.html' && 
            !window.location.pathname.endsWith('index.html') &&
            !window.location.pathname.endsWith('register.html')) {
            window.location.href = 'index.html';
        }
        return null;
    }
    
    return currentUser;
}

// ============================================
// CHECK IF USER IS ADMIN
// ============================================
function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.isAdmin === true;
}

// ============================================
// GET CURRENT USER
// ============================================
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// ============================================
// UPDATE CURRENT USER
// ============================================
function updateCurrentUser(updatedUser) {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Also update in users array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.username === updatedUser.username);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// ============================================
// SHOW NOTIFICATION
// ============================================
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.log('Notification:', message);
        return;
    }
    
    const messageEl = notification.querySelector('.notification-message');
    const iconEl = notification.querySelector('.notification-icon');
    
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    // Update icon based on type
    if (iconEl) {
        if (type === 'success') {
            iconEl.textContent = '✓';
        } else if (type === 'error') {
            iconEl.textContent = '✕';
        } else if (type === 'warning') {
            iconEl.textContent = '⚠';
        }
    }
    
    // Remove existing type classes
    notification.classList.remove('success', 'error', 'warning');
    
    // Add new type class
    notification.classList.add(type);
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// ============================================
// AUTO-REDIRECT IF ALREADY LOGGED IN
// ============================================
function autoRedirectIfLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPath = window.location.pathname;
    
    // If user is logged in and on login/register page, redirect to home
    if (currentUser && (currentPath.endsWith('index.html') || currentPath.endsWith('register.html'))) {
        window.location.href = 'home.html';
    }
}

// ============================================
// INITIALIZE HEADER INFO
// ============================================
function initializeHeader() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const usernameEl = document.getElementById('headerUsername');
    if (usernameEl) {
        usernameEl.textContent = currentUser.username;
    }
}

// ============================================
// INITIALIZE SIDEBAR
// ============================================
function initializeSidebar() {
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');
    
    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !menuIcon.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Show/hide admin panel link
    const adminPanelLink = document.getElementById('adminPanelLink');
    if (adminPanelLink) {
        if (isAdmin()) {
            adminPanelLink.classList.remove('hidden');
        } else {
            adminPanelLink.classList.add('hidden');
        }
    }
}

// ============================================
// FORMAT CURRENCY
// ============================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ============================================
// FORMAT DATE
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// GET TIME REMAINING
// ============================================
function getTimeRemaining(expiryTimestamp) {
    const now = Date.now();
    const remaining = expiryTimestamp - now;
    
    if (remaining <= 0) {
        return 'Đã hết hạn';
    }
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (days > 0) {
        return `${days} ngày ${hours} giờ`;
    } else if (hours > 0) {
        return `${hours} giờ ${minutes} phút`;
    } else if (minutes > 0) {
        return `${minutes} phút ${seconds} giây`;
    } else {
        return `${seconds} giây`;
    }
}

// ============================================
// CHECK TOOL ACCESS
// ============================================
function checkToolAccess(toolName) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Admin has access to all tools
    if (currentUser.isAdmin) return true;
    
    const tool = currentUser.tools[toolName];
    if (!tool || !tool.active) return false;
    
    // Check if key is expired
    if (tool.expiry && Date.now() > tool.expiry) {
        // Deactivate expired tool
        tool.active = false;
        updateCurrentUser(currentUser);
        return false;
    }
    
    return true;
}

// ============================================
// ACTIVATE TOOL WITH KEY
// ============================================
function activateToolWithKey(toolName, key) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập!', 'error');
        return false;
    }
    
    // Get all keys
    const keys = JSON.parse(localStorage.getItem('keys')) || [];
    
    // Find matching key
    const keyData = keys.find(k => 
        k.key === key && 
        k.toolName === toolName && 
        k.username === currentUser.username &&
        !k.used
    );
    
    if (!keyData) {
        showNotification('Key không hợp lệ hoặc đã được sử dụng!', 'error');
        return false;
    }
    
    // Check if key is expired
    if (keyData.expiry && Date.now() > keyData.expiry) {
        showNotification('Key đã hết hạn!', 'error');
        return false;
    }
    
    // Activate tool
    currentUser.tools[toolName] = {
        active: true,
        expiry: keyData.expiry,
        key: key,
        activatedAt: Date.now()
    };
    
    // Mark key as used
    keyData.used = true;
    keyData.usedAt = Date.now();
    
    // Update storage
    localStorage.setItem('keys', JSON.stringify(keys));
    updateCurrentUser(currentUser);
    
    showNotification(`Tool ${toolName} đã được kích hoạt thành công!`, 'success');
    return true;
}

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ============================================
window.login = login;
window.register = register;
window.logout = logout;
window.checkAuth = checkAuth;
window.isAdmin = isAdmin;
window.getCurrentUser = getCurrentUser;
window.updateCurrentUser = updateCurrentUser;
window.showNotification = showNotification;
window.autoRedirectIfLoggedIn = autoRedirectIfLoggedIn;
window.initializeHeader = initializeHeader;
window.initializeSidebar = initializeSidebar;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getTimeRemaining = getTimeRemaining;
window.checkToolAccess = checkToolAccess;
window.activateToolWithKey = activateToolWithKey;

console.log('✅ Auth system initialized');
