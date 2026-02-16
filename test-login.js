
async function testLogin() {
    try {
        console.log('Testing User Login...');
        const userRes = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'alice@example.com',
                password: 'User123!'
            })
        });
        const userData = await userRes.json();
        console.log('User Login Status:', userRes.status, userData);
    } catch (err) {
        console.error('User Login Error:', err.message);
    }

    try {
        console.log('\nTesting Admin Login...');
        const adminRes = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@urbanharvesthub.com',
                password: 'Admin123!'
            })
        });
        const adminData = await adminRes.json();
        console.log('Admin Login Status:', adminRes.status, adminData);
    } catch (err) {
        console.error('Admin Login Error:', err.message);
    }
}

testLogin();
