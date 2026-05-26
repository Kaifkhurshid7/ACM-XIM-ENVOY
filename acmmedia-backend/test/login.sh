curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Test User",
           "email": "testuser@example.com",
           "password": "yourpassword123"
         }'