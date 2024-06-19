import mongoose from 'mongoose'

export const dbConnection = async (url, db = 'defaultDB') => {

    await mongoose.connect(url, {
        dbName: db,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
        .then(db => console.log('Base de datos online'))
        .catch(error => console.log(error));
        return mongoose.connection;
}