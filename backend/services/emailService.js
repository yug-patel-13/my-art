const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // You can change this to your preferred email service
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password' // Use App Password for Gmail
      }
    });
  }

  // Send custom sketch order notification
  async sendCustomSketchNotification(orderData, photoPath) {
    try {
      const { name, email, size, numberOfPersons, price } = orderData;
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: process.env.ADMIN_EMAIL || 'admin@artgallery.com', // Your email to receive orders
        cc: email, // CC the customer
        subject: `🎨 New Custom Sketch Order - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">🎨 New Custom Sketch Order</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #34495e; margin-top: 0;">Customer Details</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Size:</strong> ${size}</p>
              <p><strong>Number of Persons:</strong> ${numberOfPersons}</p>
              <p><strong>Total Price:</strong> ₹${price.toLocaleString()}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">📸 Reference Photo Attached</h3>
              <p>The customer has uploaded a reference photo for this custom sketch order.</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>📋 Next Steps:</strong></p>
              <ul style="color: #856404;">
                <li>Review the uploaded reference photo</li>
                <li>Contact the customer to confirm details</li>
                <li>Provide timeline and any additional requirements</li>
                <li>Update order status in the admin panel</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 2px solid #ecf0f1; margin: 30px 0;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This email was sent from your Art Gallery website. Order placed on ${new Date().toLocaleString()}.
            </p>
          </div>
        `,
        attachments: photoPath ? [{
          filename: `reference-photo-${name.replace(/\s+/g, '-')}.png`,
          path: photoPath,
          cid: 'reference-photo'
        }] : []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Custom sketch notification email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending custom sketch email:', error);
      throw error;
    }
  }

  // Send custom painting order notification
  async sendCustomPaintingNotification(orderData) {
    try {
      const { name, email, phone, description } = orderData;
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: process.env.ADMIN_EMAIL || 'admin@artgallery.com',
        cc: email,
        subject: `🎨 New Custom Painting Request - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">🎨 New Custom Painting Request</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #34495e; margin-top: 0;">Customer Details</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">🎨 Customer's Vision</h3>
              <p style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3;">
                "${description}"
              </p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>📋 Next Steps:</strong></p>
              <ul style="color: #856404;">
                <li>Review the customer's vision and requirements</li>
                <li>Contact the customer within 24 hours</li>
                <li>Discuss size, style, and timeline</li>
                <li>Provide a personalized quote</li>
                <li>Update request status in the admin panel</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 2px solid #ecf0f1; margin: 30px 0;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              This email was sent from your Art Gallery website. Request placed on ${new Date().toLocaleString()}.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Custom painting notification email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending custom painting email:', error);
      throw error;
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(orderData) {
    try {
      const { customerEmail, orderNumber, totalAmount, items } = orderData;
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: customerEmail,
        subject: `🎨 Order Confirmation - ${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">🎨 Order Confirmation</h2>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">✅ Order Placed Successfully!</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString()}</p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #34495e; margin-top: 0;">📦 Order Items</h3>
              ${items.map(item => `
                <div style="border-bottom: 1px solid #ecf0f1; padding: 10px 0;">
                  <p style="margin: 5px 0;"><strong>${item.title}</strong> by ${item.artist}</p>
                  <p style="margin: 5px 0; color: #7f8c8d;">Quantity: ${item.quantity} × ₹${item.price.toLocaleString()}</p>
                </div>
              `).join('')}
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>📋 What's Next?</strong></p>
              <ul style="color: #856404;">
                <li>We'll process your order within 1-2 business days</li>
                <li>You'll receive shipping updates via email</li>
                <li>Contact us if you have any questions</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 2px solid #ecf0f1; margin: 30px 0;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              Thank you for choosing our Art Gallery! 🎨
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      throw error;
    }
  }

  // Test email configuration
  async testEmailConfig() {
    try {
      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Email configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
