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

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{Index, ProvenShape}

import org.alephium.explorer.persistence.model.{InterfaceIdEntity, TokenInfoEntity}
import org.alephium.explorer.persistence.schema.CustomJdbcTypes._
import org.alephium.protocol.model.TokenId
import org.alephium.util.TimeStamp

object TokenInfoSchema extends SchemaMainChain[TokenInfoEntity]("token_info") {

  class TokenInfos(tag: Tag) extends Table[TokenInfoEntity](tag, name) {
    def token: Rep[TokenId]           = column[TokenId]("token", O.PrimaryKey)
    def lastUsed: Rep[TimeStamp]      = column[TimeStamp]("last_used")
    def category: Rep[Option[String]] = column[Option[String]]("category")
    def interfaceId: Rep[Option[InterfaceIdEntity]] =
      column[Option[InterfaceIdEntity]]("interface_id")

    def * : ProvenShape[TokenInfoEntity] =
      (token, lastUsed, category, interfaceId)
        .<>((TokenInfoEntity.apply _).tupled, TokenInfoEntity.unapply)

    def categoryIdx: Index    = index("token_info_category_idx", category)
    def interfaceIdIdx: Index = index("token_info_interface_id_idx", interfaceId)
  }

  val table: TableQuery[TokenInfos] = TableQuery[TokenInfos]
}
