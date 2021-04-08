import mongoose from 'mongoose'

export const dbConnection = async(url) => {

    await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        .then(db => console.log('Base de datos online'))
        .catch(error => console.log(error));
}