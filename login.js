document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const loginIdentifier = document.getElementById('loginIdentifier').value;
    const loginPassword = document.getElementById('loginPassword').value;

    const savedData = localStorage.getItem('registeredUser');

    if (savedData) {
        const user = JSON.parse(savedData);

        if ((loginIdentifier === user.email || loginIdentifier === user.phone) && loginPassword === user.password) {
            alert(`Welcome back, ${user.fullName}! Login Successful.`);
            // সফল লগইনের পর আপনি চাইলে এখানে অন্য পেজে রিডাইরেক্ট করতে পারেন
        } else {
            alert('Invalid Email/Phone or Password. Please try again.');
        }
    } else {
        alert('No account found! Please create an account first.');
    }
});
