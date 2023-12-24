Backend flow starts from SessionRoutes.js and GoogleCalRoutes.js and proceeds naturally from there to all other possible flows.

Optionally, you can create necessary setups or frontend with buttons to make it work.

Front-end agnostic currently. Won't need to set up Vue in case you're more familiar with setting up a basic setup in some other library like React, e.g. to just set up a 'book', 'cancel', 'connect', 'disconnect' button to send appropriate HTTP signals to the backend. And optionally receive signals back to alert a successful condition.

Additionally, can omit or remove some code that exists there to theoretically update some session data in MongoDB, which is not strictly related to the code you wrote and would prevent you from having to do a MongoDB setup, which would be non-trivial and time consuming.