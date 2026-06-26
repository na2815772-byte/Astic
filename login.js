// ১. Supabase কানেকশন সেটআপ (আপনার দেওয়া লিংক ও কি)
const SUPABASE_URL = "https://mbxkickfugdkgsabizrr.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_ButTVVb8ZxL7QeaL919qJg_gZ2HDjfb";

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const loginIdentifier = document.getElementById('loginIdentifier').value;
    const loginPassword = document.getElementById('loginPassword').value;

    try {
        // ২. Supabase ডেটাবেস থেকে ইউজার খোঁজা (ইমেইল অথবা ফোন নাম্বার দিয়ে)
        // নোট: এখানে 'users' হলো আপনার Supabase-এর টেবিলের নাম। টেবিলের নাম অন্য কিছু হলে সেটা দিন।
        let response = await fetch(`${SUPABASE_URL}users?or=(email.eq.${loginIdentifier},phone.eq.${loginIdentifier})`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const users = await response.json();

        // ৩. ইউজার পাওয়া গেছে কিনা এবং পাসওয়ার্ড মিলছে কিনা তা চেক করা
        if (users && users.length > 0) {
            const user = users[0]; // প্রথম ম্যাচ হওয়া ইউজার

            if (user.password === loginPassword) {
                alert(`Welcome back, ${user.fullName || 'User'}! Login Successful.`);
                
                // সফল লগইনের পর ইউজারের তথ্য সাময়িকভাবে ব্রাউজারে রাখার জন্য (যেমন প্রোফাইল ছবি দেখানোর জন্য)
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                
                // অন্য পেজে যাওয়ার কোড (যেমন: window.location.href = "dashboard.html";)
            } else {
                alert('Invalid Password. Please try again.');
            }
        } else {
            alert('No account found with this Email/Phone! Please sign up first.');
        }

    } catch (error) {
        console.error('Error during login:', error);
        alert('Something went wrong! Please check your network or configuration.');
    }
});
