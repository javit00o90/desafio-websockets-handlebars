console.log('realTimeProducts.js cargado')


const socket = io();
socket.on('productos', (listaDeProductos) => {
    renderizarProductos(listaDeProductos);
});

function renderizarProductos(productos) {
    const productosContainer = document.getElementById('productosContainer');

    productosContainer.innerHTML = '';
    productos.forEach((producto) => {
        const productoDiv = document.createElement('div');

        productoDiv.innerHTML = `
        <div class="productCard">
        <h2>${producto.title}</h2>
        <p>${producto.description}</p>
        <p class="price">Precio: ${producto.price}</p>
        <p class="stock">Stock: ${producto.stock}</p>
        <button class="deleteBtn" data-product-id="${producto.id}">Eliminar</button>
        </div>
      `;
        productosContainer.appendChild(productoDiv);
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll('.deleteBtn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            deleteProduct(productId);
        });
    });
}

async function deleteProduct(productId) {
    try {
        const response = await fetch(`/realtimeproducts/${productId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Server Error:', errorDetails);
            return;
        }

        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error('Error sending the delete request:', error);
    }
}

document.getElementById('productForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Read price and stock as numbers
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value, 10);

    // Read thumbnails as a comma-separated string and convert to an array
    const thumbnailsString = document.getElementById('thumbnails').value;
    const thumbnailsArray = thumbnailsString.split(',').map(thumbnail => thumbnail.trim());

    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: isNaN(price) ? 0 : price, // Ensure a default value if conversion fails
        code: document.getElementById('code').value,
        stock: isNaN(stock) ? 0 : stock, // Ensure a default value if conversion fails
        category: document.getElementById('category').value,
        status: document.getElementById('status').checked,
        thumbnails: thumbnailsArray, // Set the thumbnails as an array
    };

    console.log('FormData:', formData);

    try {
        const response = await fetch('/realtimeproducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Server Error:', errorDetails);
            return;
        }

        const result = await response.json();

        // Handle the response from the server
        console.log(result.message);
    } catch (error) {
        console.error('Error sending the request:', error);
    }
});

// Function to handle the update product button
function updateProduct() {
    const updateProductId = document.getElementById('updateProductId').value;

    // Validate that the product ID is provided
    if (!updateProductId) {
        alert('Se requiere el ID del producto para la actualización.');
        return;
    }

    // Retrieve values from the form
    const updateTitle = document.getElementById('updateTitle').value;
    const updateDescription = document.getElementById('updateDescription').value;
    const updatePrice = document.getElementById('updatePrice').value;
    const updateCode = document.getElementById('updateCode').value;
    const updateStock = document.getElementById('updateStock').value;
    const updateCategory = document.getElementById('updateCategory').value;
    const updateStatus = document.getElementById('updateStatus').checked;

    // Build the formData object dynamically based on the fields that have values
    const formData = {};
    if (updateTitle) formData.title = updateTitle;
    if (updateDescription) formData.description = updateDescription;
    if (updatePrice) formData.price = updatePrice;
    if (updateCode) formData.code = updateCode;
    if (updateStock) formData.stock = updateStock;
    if (updateCategory) formData.category = updateCategory;
    formData.status = updateStatus;

    // Send a PUT request to update the product
    fetch(`/realtimeproducts/${updateProductId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(result => {
            console.log(result.message);
            // Optionally, refresh the product list after updating
            socket.emit('productos');
        })
        .catch(error => console.error('Error sending the update request:', error));
}
