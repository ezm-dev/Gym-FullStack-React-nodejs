import mysql from "mysql2/promise"
import dotenv from "dotenv"
/**
 * Abstract Model for database conntection and query
 */

export class DatabaseModel {
    static connection


    /**
     * Set up database connection
     */
    static {
        this.connection = mysql.createPool({
            host: process.env.DB_HOST,  //domain or address of db server (run at the same webserver)
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            nestTables: true,
        })
    }


        /**
         
         * 
         * @param {string} sql query 
         * @param {any | Array<string>} values 
         * @returns {mysql.OkPacket | mysql.RowDataPacket } query result
         * 
         */
    static query(sql, values) {
        return this.connection.query(sql, values)
            .then(([result]) => result)
    }

    /**
     * Convert date from Javascript date to mysql date
     * @param {date} date 
     * @returns {string} date- yyy-mm-dd format
     */
    static toMySqlDate(date) {
        const year = date.toLocaleString("default", { year: "numeric" })
        const month = date.toLocaleString("default", { month: "2-digit" })
        const day = date.toLocaleString("default", { day: "2-digit" })



        return [year, month, day].join("-") //0000-00-00


    }
}