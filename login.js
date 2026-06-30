// ১. Supabase কানেকশন সেটআপ
const SUPABASE_URL = "https://mbxkickfugdkgsabizrr.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_ButTVVb8ZxL7QeaL919qJg_gZ2HDjfb";

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const loginIdentifier = document.getElementById('loginIdentifier').value;
    const loginPassword = document.getElementById('loginPassword').value;

    try {
        // ২. Supabase ডেটাবেস থেকে ইউজার খোঁজা
        let response = await fetch(`${SUPABASE_URL}users?or=(email.eq.${loginIdentifier},phone.eq.${loginIdentifier})`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const users = await response.json();

        // ৩. ইউজার চেক এবং লজিক অ্যাপ্লাই
        if (users && users.length > 0) {
            const user = users[0];

            // ডাটাবেসের পাসওয়ার্ডের সাথে ইউজারের দেওয়া পাসওয়ার্ড মিললে তবেই বার্তাটি দেখাবে
            if (user.password === loginPassword) {
                // ব্রাউজারে ইউজার ডাটা সেভ করা
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                
                // তথ্য সঠিক হলে এখানে এসে কাস্টম সাকসেস মডাল (পপআপ) কল হবে
                showSuccessModal(user.fullName || 'User');
                
            } else {
                // পাসওয়ার্ড ভুল হলে পপআপ আসবে না, এই অ্যালার্ট দেখাবে
                alert('ভুল পাসওয়ার্ড! দয়া করে আবার চেষ্টা করুন।');
            }
        } else {
            // অ্যাকাউন্ট না থাকলে এই অ্যালার্ট দেখাবে
            alert('এই ইমেইল বা ফোন নাম্বার দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি! আগে রেজিস্ট্রেশন করুন।');
        }

    } catch (error) {
        console.error('Error during login:', error);
        alert('কিছু একটা সমস্যা হয়েছে! দয়া করে আপনার নেটওয়ার্ক চেক করুন।');
    }
});

// ৪. সফলতার বার্তা দেখানোর ফাংশন (যা সম্পূর্ণ 54772.jpg এর কালার ও লেআউট ম্যাচ করা)
function showSuccessModal(userName) {
    const modalHtml = `
        <div id="successModal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; 
            align-items: center; z-index: 9999; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            backdrop-filter: blur(4px);
        ">
            <div style="
                background: #ffffff; padding: 40px 30px; border-radius: 28px; 
                text-align: center; box-shadow: 0 15px 30px rgba(0,0,0,0.1); 
                max-width: 380px; width: 88%; border: 3px solid #2ae077;
                animation: popupTransform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-sizing: border-box;
            ">
                <!-- ইমেজ অনুযায়ী গোল বৃত্তের ভেতর সবুজ টিক চিহ্ন -->
                <div style="
                    width: 80px; height: 80px; background: #e8fbf1; 
                    border-radius: 50%; display: flex; justify-content: center; 
                    align-items: center; margin: 0 auto 20px auto;
                    border: 2px solid #2ae077;
                ">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                <!-- ইংরেজি সাকসেস টাইটেল -->
                <h2 style="
                    margin: 0 0 15px 0; color: #14b8a6; font-size: 28px; 
                    font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
                ">SUCCESS!</h2>

                <!-- ছোট বিবরণ (ইংরেজি) -->
                <p style="
                    margin: 0 0 30px 0; color: #475569; font-size: 15px; 
                    line-height: 1.6; font-weight: 500; padding: 0 10px;
                ">
                    Login successful! Welcome back, <span style="color: #0f172a; font-weight: 700;">${userName}</span>. You can now enter the page.
                </p>

                <!-- ইমেজের মতো সুন্দর সবুজ OK বাটন -->
                <button id="modalOkBtn" style="
                    background: #14b8a6; color: white; border: none; 
                    padding: 14px 0; font-size: 16px; border-radius: 16px; 
                    cursor: pointer; width: 100%; font-weight: 700; 
                    letter-spacing: 0.5px; transition: all 0.2s ease;
                    box-shadow: 0 8px 16px rgba(20, 184, 166, 0.3);
                ">OK</button>
            </div>
        </div>
        <style>
            @keyframes popupTransform {
                from { transform: scale(0.7); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            #modalOkBtn:hover { 
                background: #0d9488; 
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(20, 184, 166, 0.4);
            }
            #modalOkBtn:active {
                transform: translateY(0);
            }
        </style>
    `;

    // স্ক্রিনে পপআপটি যুক্ত করা
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // OK বাটনে ক্লিক করলে একবারে মেইন হোম পেজে নিয়ে যাবে
    document.getElementById('modalOkBtn').addEventListener('click', function() {
        window.location.href = "index.html"; 
    });
}
