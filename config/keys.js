module.exports = {
    app: {
        name: "records-backend",
        apiURL: `${process.env.BASE_API_URL}`,
        clientURL: process.env.CLIENT_URL
    },
    port: process.env.PORT || 5000,
    database: {
        url: process.env.MONGO_URI
    }
}