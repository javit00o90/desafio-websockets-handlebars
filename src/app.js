const express = require('express');
const { engine } = require('express-handlebars')
const Server = require('socket.io').Server
const path = require('path');
const ProductManager = require('./classes/productManager');

const app = express();

const port = 8080;
const productsRouter = require('./routes/products-router');
const cartRouter = require('./routes/carts-router');
const homeRouter = require('./routes/home-router');
const realTimeProductRouter = require('./routes/realTimeProduct-router');

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);
app.use('/', homeRouter);
app.use('/realtimeproducts', realTimeProductRouter);


app.use((req, res) => {
    res.status(404).json({ message: 'Página no encontrada' });
});

const server = app.listen(port, () => {
    console.log(`Servidor encendido y escuchando el puerto ${port}`);
});

const io = new Server(server);
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    const productManager = new ProductManager();
    productManager.getProducts().then((productos) => {
            socket.emit('productos', productos);
    });
});