const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/users/login', {
            email: 'user1@urbanharvesthub.com',
            password: 'pass123'
        });
        console.log('Success:', response.status);
        console.log('Data:', response.data);
    } catch (err) {
        if (err.response) {
            console.log('Error Status:', err.response.status);
            console.log('Error Data:', err.response.data);
        } else {
            console.log('Error:', err.message);
        }
    }
}

testLogin();
