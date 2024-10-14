import { createConnection, Connection } from 'mysql'; 

const db: Connection = createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'karangkobar', 
    database: 'coinlist' 
});


const connectToDatabase = (): void => {
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to the database: ', err);
            return;
        }
        console.log('Connected to the database.');
        createTables(); 
    });
};


const createTables = (): void => {
    const createTokenBalancesTable = `
        CREATE TABLE IF NOT EXISTS tokenprice (
            flip VARCHAR(10) DEFAULT '1',
            symbol VARCHAR(255),
            address VARCHAR(255),
            price0 DECIMAL(64, 18) DEFAULT 0,
            price1 DECIMAL(64, 18) DEFAULT 0,
            PRIMARY KEY (address, symbol)
        )
    `;

    db.query(createTokenBalancesTable, (error, results) => {
        if (error) {
            console.error('Error creating token balances table: ', error);
            return; 
        }
        console.log('Token balances table checked/created successfully.');
    });
};


const closeConnection = (): void => {
    db.end((err) => {
        if (err) {
            console.error('Error closing the database connection: ', err);
        } else {
            console.log('Database connection closed.');
        }
    });
};


export {
    db,
    connectToDatabase,
    closeConnection, 
};
