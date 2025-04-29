async function getCsrfToken() {
    try {
        const response = await fetch('/csrf', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }

        const data = await response.json();
        return data.token || data._csrf; // Algunas implementaciones usan '_csrf'
    } catch (error) {
        console.error('Error getting CSRF token:', error);
        throw error; // Re-lanzar el error para manejo superior
    }
}

const apiUrl = "http://ec2-3-95-154-132.compute-1.amazonaws.com:8080/api/properties";

document.addEventListener("DOMContentLoaded", fetchProperties);

document.getElementById("propertyForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const csrfToken = await getCsrfToken();

    const id = document.getElementById("propertyId").value;
    const property = {
        address: document.getElementById("address").value,
        price: document.getElementById("price").value,
        size: document.getElementById("size").value,
        description: document.getElementById("description").value
    };

    try {
        const options = {
            method: id ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken
            },
            credentials: 'include',
            body: JSON.stringify(property)
        };

        const url = id ? `${apiUrl}/${id}` : apiUrl;
        const response = await fetch(url, options);

        if (!response.ok) throw new Error('Network response was not ok');

        resetForm();
        fetchProperties();
    } catch (error) {
        console.error("Error saving property:", error);
    }
});

async function fetchProperties() {
    try {
        const response = await fetch(apiUrl);
        const properties = await response.json();
        displayProperties(properties);
    } catch (error) {
        console.error("Error fetching properties:", error);
    }
}

function displayProperties(properties) {
    const tableBody = document.getElementById("propertyList");
    tableBody.innerHTML = "";

    properties.forEach(property => {
        const row = document.createElement("tr");

        // Crear celdas con textContent (seguro contra XSS)
        const addCell = (value) => {
            const td = document.createElement("td");
            td.textContent = value;
            return td;
        };

        row.appendChild(addCell(property.address));
        row.appendChild(addCell(`$${property.price}`));
        row.appendChild(addCell(`${property.size} m²`));
        row.appendChild(addCell(property.description));

        // Celda de acciones
        const actionCell = document.createElement("td");

        // Botón Edit con event listener
        const editBtn = document.createElement("button");
        editBtn.className = "edit";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
            editProperty(
                property.id,
                property.address,
                property.price,
                property.size,
                property.description
            );
        });

        // Botón Delete con event listener
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
            deleteProperty(property.id);
        });

        actionCell.appendChild(editBtn);
        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

document.getElementById("searchForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const address = document.getElementById("searchAddress").value;
    const minPrice = document.getElementById("searchMinPrice").value;
    const maxPrice = document.getElementById("searchMaxPrice").value;
    const minSize = document.getElementById("searchMinSize").value;
    const maxSize = document.getElementById("searchMaxSize").value;

    let queryParams = new URLSearchParams();
    if (address) queryParams.append("address", address);
    if (minPrice) queryParams.append("minPrice", minPrice);
    if (maxPrice) queryParams.append("maxPrice", maxPrice);
    if (minSize) queryParams.append("minSize", minSize);
    if (maxSize) queryParams.append("maxSize", maxSize);

    try {
        const response = await fetch(`${apiUrl}/search?${queryParams.toString()}`);
        const properties = await response.json();
        displayProperties(properties);
    } catch (error) {
        console.error("Error searching properties:", error);
    }
});

async function deleteProperty(id) {
    if (confirm("Are you sure you want to delete this property?")) {
        try {
            const csrfToken = await getCsrfToken();
            await fetch(`${apiUrl}/${id}`, {
                method: "DELETE",
                headers: {
                    "X-XSRF-TOKEN": csrfToken
                },
                credentials: 'include'
            });
            fetchProperties();
        } catch (error) {
            console.error("Error deleting property:", error);
        }
    }
}

function editProperty(id, address, price, size, description) {
    // Ya no necesitamos JSON.parse porque los valores vienen directos
    document.getElementById("propertyId").value = id;
    document.getElementById("address").value = address;
    document.getElementById("price").value = price;
    document.getElementById("size").value = size;
    document.getElementById("description").value = description;
}

function resetForm() {
    document.getElementById("propertyId").value = "";
    document.getElementById("propertyForm").reset();
}