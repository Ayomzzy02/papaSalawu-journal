exports.generateLoginDetailsEmailHTML = function (name, email, password) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Journal Publishing Application - Login Details</title>
      </head>
      <body>
          <h1>Welcome, ${name}!</h1>
          <p>You have been added as a Chief Editor in our Journal Publishing Application. Below are your login details:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please use the above credentials to log in to your account and change your password after the first login.</p>
          <p>Click the link below to access the login page:</p>
          <a href="http://yourwebsite.com/login">Login Here</a>
          <p>Thank you,</p>
          <p>The Journal Publishing Application Team</p>
      </body>
      </html>
    `;
  };
  