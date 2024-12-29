// Define the method for sending the login request
function sendLoginRequest() {
    // Create the login request
    const loginRequest = {
        url: 'https://100.66.33.36/api/aaaLogin.json',
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
            //'Cookie': pm.environment.get('APIC-cookie') // Usa la variabile di ambiente per impostare i cookie
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                "aaaUser": {
                    "attributes": {
                        "name": "admin",
                        "pwd": "Irideos2018" // Replace with your password
                    }
                }
            })
        }
    };

    // Sending the login request
    pm.sendRequest(loginRequest, function (err, response) {
        if (err) {
            console.error('Error during authentication:', err);
            return;
        }
        if (response.code == 404) {
            console.log('APIC out of service');
            exit();
        }
        for (var c = 0; c < 2; c++) {
            if (response.code == 403) {
                sendLoginRequest();
            }
        }
        console.log('Response received no-JSON:', response);
        // Check the response
        console.log('Response received:', response.json());

        // Process the response
        if (response.json().totalCount === "1") {
            const token = response.json().imdata[0].aaaLogin.attributes.token;
            console.log('Authentication successful!');
            console.log('Token:', token);

            // Extract cookies from the response headers
            const cookies = response.headers.filter(header => header.key.toLowerCase() === 'set-cookie');
            console.log('set-cookie from APIC:', cookies);

            if (cookies.length > 0) {
                var cookieValues = cookies.map(cookie => {
                    return cookie.value.split(';').join('; ');
                })

                const cookieValue = cookieValues[0].split('=')[1]; //prendo la parte destra dell'"="
                cookieValues = cookieValues.toString();

                console.log('Received Cookies', cookieValues);
                pm.environment.set('APIC-cookie', cookieValue); // Salva i cookie come variabile di ambiente
                pm.globals.set('APIC-cookie', cookieValue); // Salva i cookie come variabile globale per utilizzarli in altre richieste
            } else {
                console.log('No cookies received.');
            }
        } else {
            console.error('Authentication failed!');
        }
    });
}

// Call the function to send the login request
sendLoginRequest();