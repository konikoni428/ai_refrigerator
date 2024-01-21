const express = require('express');
var bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 8000;

// app.use(express.raw({ type: 'image/*', limit: '10mb' }));
var options = {
  inflate: true,
  limit: '1mb',
  type: '*/*'
};
app.use(bodyParser.raw(options));


app.post('/api/image', (req, res) => {
  const imageData = req.body;
  const imagePath = './uploads/image.jpg';
  console.log(imageData);
  // console.log(req)

  fs.writeFile(imagePath, imageData, (err) => {
    if (err) {
      console.error('Error saving image:', err);
      res.status(500).send('Error saving image');
    } else {
      console.log('Image saved successfully');
      res.send('Image received and saved successfully');
    }
  });
});

// 0.0.0.0で待ち受ける
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});
