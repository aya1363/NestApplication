export const emailVerificationRole = async ({ message, title = `change user Role on application ` }: { message?: string, title?: string } = {}) => {
    await Promise.resolve(); 
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #569d3cff, #6f1546ff);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #fff;
    }

    .container {
      max-width: 600px;
      margin: 60px auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      padding: 50px 35px;
      text-align: center;
      color: #333;
    }

    h1 {
      color: #0d47a1;
      font-size: 28px;
      margin-bottom: 15px;
    }

    p {
      color: #555;
      font-size: 16px;
      margin-bottom: 30px;
    }

    .otp-box {
      display: inline-block;
      background: linear-gradient(135deg, #d219b0ff, #427ef5ff);
      color: #fff;
      font-size: 30px;
      font-weight: bold;
      letter-spacing: 12px;
      padding: 18px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      margin-bottom: 30px;
    }

    .note {
      font-size: 14px;
      color: #777;
      margin-top: 20px;
    }

    .footer {
      font-size: 13px;
      color: #aaa;
      margin-top: 40px;
    }

    @media (max-width: 600px) {
      .container {
        margin: 20px;
        padding: 30px 20px;
      }

      .otp-box {
        font-size: 26px;
        letter-spacing: 8px;
        padding: 15px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>Welcome To Social Media Application as :</p>

    <div class="otp-box">${message}</div>



    <div class="footer">
      &copy; 2025 My Company. All rights reserved.
    </div>
  </div>
</body>
</html>`;
};