const axios = require('axios');

const baseUrl = 'http://localhost:5000/api/auth';

const testUsers = [
    {
        name: 'Invalid User',
        email: 'test@gmail.com',
        password: 'password123',
        description: 'Should fail (external domain)'
    },
    {
        name: 'Valid User',
        email: `test_${Date.now()}@xim.edu.in`,
        password: 'password123',
        description: 'Should pass (primary domain)'
    },
    {
        name: 'Valid Subdomain User',
        email: `test_sub_${Date.now()}@student.xim.edu.in`,
        password: 'password123',
        description: 'Should pass (subdomain)'
    }
];

async function runTests() {
    console.log('--- Starting Domain Validation Tests ---');
    for (const user of testUsers) {
        process.stdout.write(`Testing: ${user.name} (${user.email}) - ${user.description}... `);
        try {
            const response = await axios.post(`${baseUrl}/register`, user);
            console.log('\x1b[32mPASS\x1b[0m', `(Status: ${response.status})`);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 403 && user.description.includes('fail')) {
                    console.log('\x1b[32mPASS\x1b[0m', `(Expectedly rejected with 403: ${error.response.data.msg})`);
                } else if (error.response.status === 400 && error.response.data.msg === "User already exists") {
                    console.log('\x1b[33mSKIPPED\x1b[0m', `(User already exists)`);
                } else {
                    console.log('\x1b[31mFAIL\x1b[0m', `(Status: ${error.response.status}, Msg: ${error.response.data.msg || error.response.data.message})`);
                }
            } else {
                console.log('\x1b[31mFAIL\x1b[0m', `(Error: ${error.message})`);
            }
        }
    }
    console.log('--- Tests Completed ---');
}

runTests();
