// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

package org.alephium.explorer.persistence.schema

import akka.util.ByteString
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

import org.alephium.explorer.persistence.model.{AppState, AppStateKey}
import org.alephium.explorer.persistence.schema.CustomJdbcTypes._

object AppStateSchema extends Schema[AppState]("app_state") {

  class AppStates(tag: Tag) extends Table[AppState](tag, name) {
    def key: Rep[AppStateKey[_]] = column[AppStateKey[_]]("key", O.PrimaryKey)
    def value: Rep[ByteString]   = column[ByteString]("value")

    def * : ProvenShape[AppState] =
      (key, value).<>((AppState.applyOrThrow _).tupled, AppState.unapplyOpt)
  }

  val table: TableQuery[AppStates] = TableQuery[AppStates]
}
