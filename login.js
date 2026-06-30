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

            if (user.password === loginPassword) {
                // ব্রাউজারে ইউজার ডাটা সেভ করা
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                
                // আপনার চাহিদা মতো সফলতার বার্তা (Custom Success Message) দেখানো
                showSuccessModal(user.fullName || 'ইউজার');
                
            } else {
                alert('ভুল পাসওয়ার্ড! দয়া করে আবার চেষ্টা করুন।');
            }
        } else {
            alert('এই ইমেইল বা ফোন নাম্বার দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি! আগে রেজিস্ট্রেশন করুন।');
        }

    } catch (error) {
        console.error('Error during login:', error);
        alert('কিছু একটা সমস্যা হয়েছে! দয়া করে আপনার নেটওয়ার্ক চেক করুন।');
    }
});

// ৪. সফলতার বার্তা এবং হোম পেজে রিডাইরেক্ট করার ফাংশন
function showSuccessModal(userName) {
    // একটি সুন্দর পপআপ বক্স তৈরি করা
    const modalHtml = `
        <div id="successModal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.6); display: flex; justify-content: center; 
            align-items: center; z-index: 9999; font-family: sans-serif;
        ">
            <div style="
                background: #fff; padding: 30px; border-radius: 12px; 
                text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
                max-width: 350px; width: 90%; animation: popup 0.3s ease-in-out;
            ">
                <div style="font-size: 50px; color: #4CAF50; margin-bottom: 15px;">🎉</div>
                <h3 style="margin: 0 0 10px 0; color: #333;">লগইন সফল হয়েছে!</h3>
                <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">
                    স্বাগতম, <b>${userName}</b>। আপনার বার্তাটি সফল হয়েছে। আপনি এখন পেজে প্রবেশ করতে পারেন।
                </p>
                <button id="modalOkBtn" style="
                    background: #4CAF50; color: white; border: none; 
                    padding: 12px 30px; font-size: 16px; border-radius: 6px; 
                    cursor: pointer; width: 100%; font-weight: bold; transition: 0.2s;
                }">OK</button>
            </div>
        </div>
        <style>
            @keyframes popup {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            #modalOkBtn:hover { background: #45a049; }
        </style>
    `;

    // স্ক্রিনে পপআপটি যুক্ত করা
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // OK বাটনে ক্লিক করলে একবারে মেইন হোম পেজে নিয়ে যাওয়ার লজিক
    document.getElementById('modalOkBtn').addEventListener('click', function() {
        window.location.href = "index.html"; // এখানে আপনার হোম পেজের সঠিক নাম দিন
    });
}
