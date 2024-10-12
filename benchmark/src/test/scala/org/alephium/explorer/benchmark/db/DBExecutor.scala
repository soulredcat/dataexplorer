package org.alephium.explorer.benchmark.db

import scala.concurrent.Await
import scala.concurrent.duration._

import com.typesafe.config.ConfigFactory
import com.typesafe.scalalogging.StrictLogging
import slick.basic.DatabaseConfig
import slick.jdbc.MySQLProfile
import slick.lifted.AbstractTable

import org.alephium.explorer.persistence.DBAction

object DBExecutor extends StrictLogging {

  /** Builds a [[DBExecutor]] instance for MySQL.
    *
    * @param name
    *   Target database name
    * @param host
    *   Target database host
    * @param port
    *   Target database port
    */
  def apply(name: String, host: String, port: Int, connectionPool: DBConnectionPool): DBExecutor = {
    logger.info(s"Connecting to database: '$name'")
    val config =
      DatabaseConfig.forConfig[MySQLProfile](
        path = "db",
        config = ConfigFactory.parseString(
          s"""db = {
             |  profile = "slick.jdbc.MySQLProfile$$"
             |  db {
             |    connectionPool = $connectionPool
             |    name           = $name
             |    host           = $host
             |    port           = $port
             |    user           = "root"
             |    password       = "password"
             |    url            = "jdbc:mysql://$host:$port/$name?useSSL=false&serverTimezone=UTC"
             |  }
             |}
             |""".stripMargin
        )
      )

    new DBExecutor(config)
  }

  // scalastyle:off magic.number
  def forTest(): DBExecutor =
    DBExecutor(
      name = "mysql",
      host = "localhost",
      port = 3306,
      connectionPool = DBConnectionPool.Disabled
    )
  // scalastyle:on magic.number
}

/** Provides execution functions for interacting with the target ([[config]]) database.
  *
  * @param config
  *   Target database config
  *
  * @note
  *   Similar to [[org.alephium.explorer.persistence.DBRunner]] but provides blocking execution. To
  *   avoid naming conflicts it's named [[DBExecutor]] instead of `DBRunner`.
  */
class DBExecutor private (val config: DatabaseConfig[MySQLProfile]) extends StrictLogging {

  import config.profile.api._

  /** Executes a database action.
    */
  def runNow[R, E <: Effect](action: DBAction[R, E], timeout: FiniteDuration): R =
    Await.result[R](config.db.run(action), timeout)

  def dropTableIfExists[T <: AbstractTable[_]](table: TableQuery[T]): Int =
    runNow(sqlu"DROP TABLE IF EXISTS #${table.baseTableRow.tableName}", 5.seconds)

  /** Closes DB connection
    */
  def close(): Unit =
    config.db.close()
}
