import { createConnection, Connection } from 'mysql';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'karangkobar',
};

const ohcldb: Connection = createConnection(dbConfig);

const connectToDatabase = async (symbol: string): Promise<void> => {
    ohcldb.connect((err) => {
        if (err) {
            console.error('Error connecting to the database: ', err);
            return;
        }
        console.log('Connected to the database.');
        ensureDatabaseAndTable(symbol);
    });
};

const ensureDatabaseAndTable = async (symbol: string): Promise<void> => {
    try {
        await ohcldb.query(`CREATE DATABASE IF NOT EXISTS ohcldata`);
        console.log('Database "ohcldata" created or already exists.');

        await ohcldb.query(`USE ohcldata`);

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${symbol} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                timestamp BIGINT NOT NULL,
                open DECIMAL(18, 10) NOT NULL,
                high DECIMAL(18, 10) NOT NULL,
                low DECIMAL(18, 10) NOT NULL,
                close DECIMAL(18, 10) NOT NULL,
                volume DECIMAL(18, 10) NOT NULL
            );
        `;

        await ohcldb.query(createTableQuery);
        console.log(`Table for symbol "${symbol}" created or already exists.`);
    } catch (error) {
        console.error('Error creating database or table:', error);
    }
};

const closeConnection = (): void => {
    ohcldb.end((err) => {
        if (err) {
            console.error('Error closing the database connection: ', err);
        } else {
            console.log('Database connection closed.');
        }
    });
};

export {
    ohcldb,
    connectToDatabase,
    closeConnection,
};
