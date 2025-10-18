# URL Uptime Monitoring API

A lightweight Node.js-based RESTful API for monitoring website uptime. The system periodically checks if URLs are up or down and notifies users via SMS when the status changes.

## 🚀 Features

- **URL Health Monitoring** - Monitor multiple URLs for uptime/downtime
- **SMS Notifications** - Get instant SMS alerts via Twilio when URL status changes
- **User Authentication** - Secure token-based authentication system
- **File-Based Storage** - No database required - all data stored in JSON files
- **RESTful API** - Clean REST endpoints for all operations
- **Zero External Dependencies for Storage** - Built with vanilla Node.js

## 📋 Prerequisites

- Node.js (v12 or higher)
- Twilio Account (for SMS notifications)
  - Account SID
  - Auth Token
  - Twilio Phone Number

## 🔧 Installation

1. Clone the repository:
```bash
git clone [https://github.com/yourusername/uptime-monitor.git](https://github.com/imsubhraroy/uptime-monitor.git)
cd uptime-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create an `environment.js` file in the `helpers` directory:
```javascript
const environments = {
  twilio: {
    accountSid: 'your_twilio_account_sid',
    authToken: 'your_twilio_auth_token',
    fromPhone: 'your_twilio_phone_number'
  },
  maxCheck: 5 // Maximum checks per user
};

export default environments;
```

4. Start the server:
```bash
npm start
```

## 📡 API Endpoints

### User Routes (`/user`)

#### Create User (POST)
```bash
POST /user
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "1234567890",
  "password": "yourpassword",
  "tosAgreement": "true"
}
```

#### Get User (GET)
```bash
GET /user?mobile=1234567890
Headers: { "token": "your_auth_token" }
```

#### Update User (PUT)
```bash
PUT /user
Headers: { "token": "your_auth_token" }
Content-Type: application/json

{
  "mobile": "1234567890",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "newpassword"
}
```

#### Delete User (DELETE)
```bash
DELETE /user?mobile=1234567890
Headers: { "token": "your_auth_token" }
```

### Token Routes (`/token`)

#### Create Token / Login (POST)
```bash
POST /token
Content-Type: application/json

{
  "mobile": "1234567890",
  "password": "yourpassword"
}
```

### Check Routes (`/check`)

#### Create URL Check (POST)
```bash
POST /check
Headers: { "token": "your_auth_token" }
Content-Type: application/json

{
  "protocol": "https",
  "url": "www.google.com",
  "method": "get",
  "successCode": [200, 201],
  "timeoutSeconds": 3
}
```

#### Get Check Details (GET)
```bash
GET /check?id=check_id
Headers: { "token": "your_auth_token" }
```

#### Update Check (PUT)
```bash
PUT /check
Headers: { "token": "your_auth_token" }
Content-Type: application/json

{
  "id": "check_id",
  "protocol": "http",
  "url": "www.example.com",
  "method": "post",
  "successCode": [200],
  "timeoutSeconds": 5
}
```

#### Delete Check (DELETE)
```bash
DELETE /check?id=check_id
Headers: { "token": "your_auth_token" }
```

## 🔐 Authentication

1. Create a user account using the `/user` POST endpoint
2. Generate a token using the `/token` POST endpoint with your mobile and password
3. Include the token in the headers of all subsequent requests:
   ```
   Headers: { "token": "your_20_character_token" }
   ```

## 📦 Project Structure

```
├── handlers/
│   ├── userHandler.js      # User CRUD operations
│   ├── checkHandler.js     # URL check management
│   └── routeHandler/
│       └── tokenHandler.js # Authentication logic
├── helpers/
│   ├── utilities.js        # Utility functions
│   ├── environment.js      # Configuration
│   └── notification.js     # SMS notification handler
├── lib/
│   └── data.js            # File-based data storage
└── routes.js              # Route definitions
```

## 🔔 How It Works

1. **User Registration**: Users create an account with mobile number and password
2. **Authentication**: Users log in to receive a 20-character authentication token
3. **Create Checks**: Authenticated users can create URL monitoring checks (max 5 per user)
4. **Background Monitoring**: The system periodically checks URLs based on configured intervals
5. **Status Change Detection**: When a URL goes down or comes back up, the status is recorded
6. **SMS Notification**: Users receive SMS alerts via Twilio when their monitored URLs change status

## 📝 Data Storage

All data is stored as JSON files in the file system:
- **Users**: Stored in `/data/user/` directory
- **Tokens**: Stored in `/data/token/` directory
- **Checks**: Stored in `/data/checks/` directory

## ⚙️ Configuration

Key configuration options in `environment.js`:
- `maxCheck`: Maximum number of URL checks per user (default: 5)
- `twilio`: Twilio API credentials for SMS notifications

## 🛡️ Security Features

- Password hashing for secure storage
- Token-based authentication (20-character tokens)
- Token verification for all protected routes
- Mobile number validation (10-digit format)

## 📄 License

MIT License

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📧 Contact

Your Name - Subhra Roy (https://www.subhraroy.com)

Project Link: [https://github.com/imsubhraroy/uptime-monitor](https://github.com/imsubhraroy/uptime-monitor)

---

**Note**: This project uses basic Node.js without external database dependencies. For production use, consider implementing a proper database solution and additional security measures.
