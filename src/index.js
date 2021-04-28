const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = require('./models');

const userRoute = require('./routes/user.route');
const profileRoute = require('./routes/profile.route');
const commerceRoute = require('./routes/commerce.route');
const customerRoute = require('./routes/customer.route');
const monederoRoute = require('./routes/monedero.route');
const historicoRoute = require('./routes/historico.route');

app.use('/api', userRoute);
app.use('/api', profileRoute);
app.use('/api', commerceRoute);
app.use('/api', customerRoute);
app.use('/api', monederoRoute);
app.use('/api', historicoRoute);

db.sequelize.sync()
.then((req) => {
    app.listen(3030, () =>{
        console.log("Server running on port", 3030);
    });
});