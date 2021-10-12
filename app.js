const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 3500
const dbsetting = require('./dbsetting')
const socket = require('./socket')
const nunjucks = require('nunjucks');
const mysql = require('mysql2')

require('dotenv').config();

const logger = require('./logger');
const router = require('./routes');



//DB 만들기.
dbsetting.dbinit()

app.use(morgan('dev'));


const originURI = process.env.ORIGIN_URI || `http://localhost:3001`
app.use(
  cors(
    {
      origin: originURI,
      credentials: true
    }
  )
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.set('view engine', 'html');
nunjucks.configure('views', { express: app });


app.use('/', router)

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 정보가 없습니다.`);
  error.status = 404;
  logger.error(error.message);
  res.render('404');
})

socket.wsInit();

app.listen(PORT, () => {
  console.log(`server start port ${PORT}`)
})

