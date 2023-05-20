Gmail often blocks external images, including tracking pixels, to protect user privacy. However, you can try a few things to improve the chances of your open pixel being loaded in Gmail:

1. **Use a unique filename for the tracking pixel.** Gmail may cache images with the same filename, so using a unique filename for each email can help bypass this issue.

```html
<img src="https://yourserver.com/pixel/unique_id.png" width="1" height="1" alt="" />
```

2. **Add relevant alt text.** Although it won't guarantee that the pixel will be loaded, adding a relevant alt text can help improve the chances.

```html
<img src="https://yourserver.com/pixel/unique_id.png" width="1" height="1" alt="Email Open Tracker" />
```

3. **Use HTTPS for the tracking pixel URL.** Gmail prefers secure connections, so using HTTPS instead of HTTP can help.

```html
<img src="https://yourserver.com/pixel/unique_id.png" width="1" height="1" alt="Email Open Tracker" />
```

4. **Set the tracking pixel dimensions to 1x1.** This ensures that the pixel is as small as possible and doesn't affect the email layout.

```html
<img src="https://yourserver.com/pixel/unique_id.png" width="1" height="1" alt="Email Open Tracker" />
```

5. **Consider using a different tracking method.** If the open pixel still doesn't work, you might want to explore other tracking methods, such as link tracking or using a service like Google Analytics.

Keep in mind that even with these improvements, there's no guarantee that Gmail will load the tracking pixel. Some users may have image loading disabled, or Gmail may still block the pixel for other reasons.