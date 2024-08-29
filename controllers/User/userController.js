const Trycatch = require("../../middleware/Trycatch");
const User = require("../../model/User/users");
const sendToken = require("../../utils/userToken");
const Mail = require("../../utils/sendmail");
const NodeCache = require("node-cache");
const cache = new NodeCache();




const cron = require('node-cron');

// Function to create a dummy user
const createDummyUser = async () => {
  try {
    // Define a dummy user
    const dummyUser = {
      username: 'dummyUser',
      email: 'dummyuser@example.com',
      mobileNumber: 1234567890,
      password: 'dummyPassword123',
      gender: 'Other',
      dateofbirth: new Date('2000-01-01'),
      country: 'Dummyland',
    };

    // Create the dummy user
    const user = await User.create(dummyUser);
    console.log('Dummy user created:', user);
  } catch (error) {
    console.error('Error creating dummy user:', error);
  }
};

// Function to schedule dummy user creation
const scheduleDummyUserCreation = (unixTimestamp) => {
  // Convert Unix timestamp to Date object
  const scheduledDate = new Date(unixTimestamp * 1000);
  const now = new Date();

  // Calculate the delay in seconds
  const delayInSeconds = Math.floor((scheduledDate - now) / 1000);

  if (delayInSeconds < 0) {
    console.log('The specified time is in the past. Scheduling failed.');
    return;
  }

  console.log(`Scheduling dummy user creation in ${delayInSeconds} seconds.`);

  // Schedule the task to run after the calculated delay
  setTimeout(() => {
    createDummyUser();
  }, delayInSeconds * 1000);

  console.log(`Scheduled dummy user creation at ${scheduledDate}`);
};

// Example usage: Schedule a dummy user creation at a specific Unix timestamp
const unixTimestamp = 1724908550; // Replace with your desired Unix timestamp
scheduleDummyUserCreation(unixTimestamp);









// Register User
const RegisterUser = Trycatch(async (req, res, next) => {
  // Check email
  const useremail = await User.findOne({ email: req.body.email });
  const MobileNumber = await User.findOne({ mobileNumber: req.body.mobileNumber });
  if (useremail) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }
  if (MobileNumber) {
    return res.status(400).json({
      success: false,
      message: "Mobile number already exists",
    });
  }
  const user = await User.create(req.body);

  // Remove cache
  cache.del("users");
  cache.del("totalUsers");

  // Send mail
  const { firstName, lastName, email, mobileNumber, gender, dateofbirth, country } = user;
  const subject = "Welcome to SK Food - Registration Successful!";
  const message = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); background-color: #f9f9f9;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dzvsrft15/image/upload/v1720110025/xirkf5pmblltczhjxdyq.png" alt="SK Food Logo" style="width: 100px; height: auto; margin-bottom: 10px;" />
        <h1 style="color: #333; margin: 0;">Welcome to SK Food!</h1>
      </div>
      <div style="background-color: #fff; padding: 20px; border-radius: 10px;">
        <p style="margin: 0; color: #555;">Dear ${firstName} ${lastName},</p>
        <p style="margin: 0 0 20px 0; color: #555;">Congratulations! You have successfully registered an account with SK Food. We are excited to have you join our community.</p>
        <p style="margin: 0 0 20px 0; color: #555;">Here are your registration details:</p>
        <ul style="margin: 0 0 20px 0; color: #555; padding-left: 20px;">
          <li><strong>Email:</strong> ${email}</li>
          ${mobileNumber ? `<li><strong>Mobile Number:</strong> ${mobileNumber}</li>` : ''}
        </ul>
        <p style="margin: 0 0 20px 0; color: #555;">You can now login to your account and start exploring the best and freshest food products we offer. Stay tuned for exciting updates, exclusive offers, and delicious recipes straight to your inbox.</p>
        <p style="margin: 0 0 20px 0; color: #555;">Thank you for joining our community. We look forward to serving you!</p>
        <p style="margin: 0; color: #555;">Best Regards,</p>
        <p style="margin: 0; color: #555;"><strong>SK Food Team</strong></p>
      </div>
      <p style="font-size: 0.8em; color: #999; text-align: center; margin-top: 20px;">If you did not register for this account or have any questions, please <a href="#" style="color: #007BFF; text-decoration: none;">contact us</a>.</p>
    </div>
  `;

  await Mail(email, subject, message, true); // Send HTML email

  res.status(201).json({
    success: true,
    user,
  });
});


// Login User
const LoginUser = Trycatch(async (req, res, next) => {
  const { email, password } = req.body;
  //   if there is no email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  //   check if user exists
  const user = await User.findOne({ email }).select("+password");

  //   if user does not exist
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  //   if user exists
  const isMatch = await user.comparePassword(password);
  // if password does not match
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
  // if all is good then send token
  sendToken(user, 200, res);
});

// my profile
const myProfile = Trycatch(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// update user
const updateUser = Trycatch(async (req, res, next) => {
  if (req.body.mobileNumber) {
    // find mobile number
    const mobileNumberCheck = await User.findOne({
      mobileNumber: req.body.mobileNumber,
    });
    if (mobileNumberCheck) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
      });
    }
  }
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  // remove cache
  cache.del("users");
  cache.del("totalUsers");

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

// get all users
const getAllUsers = Trycatch(async (req, res, next) => {
  // check cache
  if (cache.has("users")) {
    const users = cache.get("users");
    const totalUsers = cache.get("totalUsers");
    return res.status(200).json({
      success: true,
      users,
      totalUsers,
    });
  } else {
    const users = await User.find();
    const totalUsers = users.length;
    cache.set("users", users, 10);
    cache.set("totalUsers", totalUsers, 10);
    res.status(200).json({
      success: true,
      totalUsers,
      users,
    });
  }
});

// delete user
const deleteUser = Trycatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  await user.remove();
  // remove cache
  cache.del("users");
  cache.del("totalUsers");

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// get single user
const getSingleUser = Trycatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// forgot password

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
// otp
var OTPs = {};



// send otp and update password
const ForgotPassword = Trycatch(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // check user us exist or not
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  // generate otp
  const OTP = generateOTP();
  OTPs[email] = OTP;

  // send otp
  try {

    const generateEmailContent = (otp) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sura:wght@400;700&display=swap" rel="stylesheet">
  <title>Password Reset</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;   font-family: Sura, serif; font-weight: 400; font-style: normal; width: 100%; ">
  <div style="position: relative;background-color: white; border: 1px solid #232F6D; border-radius: 10px; padding: 30px; padding-bottom: 15px; padding-top: 64px; max-width: 500px; text-align: center; height: 400px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div>
      <img src="https://res.cloudinary.com/dtakusspm/image/upload/v1724484115/uffc8a6nzd13s0zfiik9.png" alt="SK Foods"
        style="width: 170px; position: absolute; top: -45px; left: 50%; transform: translateX(-50%);">
    </div>
    <p style="font-size: 20px; margin: 0; color: #AE7B37;">Dear ${user.firstName}</p>
    <p style="font-size: 16px; margin: 8px 0; margin-top: 2px; color: #555; color: #AE7B37;">Please enter this code to
      reset your
      password</p>
    <p style="font-size: 32px; margin: 20px 0; font-weight: bold; letter-spacing: 10px;">${otp}</p>
    <p style="font-size: 16px; margin: 10px 0; color: #AE7B37;">Keeps visiting <span
        style="font-weight: bold; color: #AE7B37;">SK Foods</span></p>
    <p style="font-size: 16px; margin-top: 20px; color: #AE7B37;">Regards,<br><span style="font-size: 18px;">United &
        Co.</span></p>
  </div>
</body>

</html>
`;
    const subject = "Password Reset OTP";
    // const message = `Your OTP for resetting the password is: ${OTP}. Please do not share this OTP with anyone.`;
    const message = generateEmailContent(OTP);
  await Mail(email, subject, message, true);

   
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// check otp
const checkOTP = Trycatch(async (req, res, next) => {
  const { email, OTP } = req.body;
  if (OTPs[email] !== OTP) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  } else {
    // remove OTP
    delete OTPs[email];
  }

  res.status(200).json({
    success: true,
    message: "OTP verified",
  });
});

// reset password with OTP
const resetPasswordWithOTP = Trycatch(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  // if user does not exist
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  // update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

// Send Email to All Registered Users
const sendEmailToAllUsers = Trycatch(async (req, res, next) => {
  const { template } = req.body;
  // Fetch all registered users
  const users = await User.find();

  // Check if there are any users
  if (users.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No users found",
    });
  }

  let emailsSentCount = 0;

  // Send email to each user
  for (let user of users) {
    await Mail(
      user.email,
      "Test email from vaibhav ",
      "This is testing email from Sk-Food E-com.",
      template
    );
    emailsSentCount++;
  }

  res.status(200).json({
    success: true,
    message: "Email sent to all registered users",
    usersCount: users.length,
    emailsSentCount: emailsSentCount,
  });
});

// export all
module.exports = {
  RegisterUser,
  LoginUser,
  myProfile,
  updateUser,
  getAllUsers,
  deleteUser,
  getSingleUser,
  ForgotPassword,
  resetPasswordWithOTP,
  sendEmailToAllUsers,
  checkOTP,
};
