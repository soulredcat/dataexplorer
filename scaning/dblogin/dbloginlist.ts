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
    const createTokenPriceTable = `
        CREATE TABLE IF NOT EXISTS tokenprice (
            id INT AUTO_INCREMENT PRIMARY KEY,
            flip VARCHAR(10) DEFAULT '1',
            symbol VARCHAR(255),
            address VARCHAR(255),
            price0 DECIMAL(64, 18) DEFAULT 0,
            price1 DECIMAL(64, 18) DEFAULT 0,
            color VARCHAR(10) NOT NULL DEFAULT 'green',
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_symbol_address (symbol, address)
        )
    `;

    db.query(createTokenPriceTable, (error, results) => {
        if (error) {
            console.error('Error creating token price table: ', error);
            return; 
        }
        console.log('Token price table checked/created successfully.');
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
