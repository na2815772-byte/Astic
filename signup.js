document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    const userData = {
        fullName: fullName,
        email: email,
        phone: phone,
        password: password
    };

    localStorage.setItem('registeredUser', JSON.stringify(userData));

    alert('Account created successfully! Please login.');
    window.location.href = 'login.html';
});
