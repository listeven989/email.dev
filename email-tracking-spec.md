Email open tracking is a technique that allows you to track whether your recipients have opened the email you sent. This is typically achieved by embedding a small, invisible image (often called a tracking pixel) into the email. When the recipient opens the email, the image is requested from the server, and this request is logged as an email open event.

To add email open tracking to your mailchimp-like tool, follow these steps:

1. Generate a unique tracking pixel:
Create a small, transparent 1x1 pixel image in a format like GIF or PNG. This image will be embedded in the email you send to your recipients.

2. Host the tracking pixel on your server:
Upload the tracking pixel to your server or a third-party hosting service. Make sure the image is accessible through a unique URL, such as `https://yourserver.com/tracking/unique_id.gif`, where `unique_id` is a unique identifier for each email you send. This will help you track individual email opens.

3. Embed the tracking pixel in your email template:
Add an HTML `img` tag to your email template, pointing to the URL of the tracking pixel. Ensure that the `unique_id` is dynamically generated for each email. Here's an example:

```html
<img src="https://yourserver.com/tracking/unique_id.gif" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin:0!important;padding:0!important" />
```

4. Log email open events:
When the tracking pixel is requested from your server, log the event along with the associated `unique_id`. This will allow you to track the email open events and link them to specific recipients.

5. Update your email sending logic:
Modify your email sending process to include the tracking pixel with a unique identifier for each email. Make sure to replace the `unique_id` placeholder in the tracking pixel URL with the actual identifier.

6. Analyze the data:
Use the logged email open events to analyze the performance of your email campaigns, such as open rates, the best time to send emails, and other insights.

Remember that email open tracking has some limitations, as some email clients block tracking pixels or don't automatically load images. However, it's still a widely used technique for gauging email campaign performance.