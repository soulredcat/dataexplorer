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
import slick.lifted.ProvenShape

import org.alephium.explorer.api.model.NFTMetadata
import org.alephium.explorer.persistence.schema.CustomJdbcTypes._
import org.alephium.protocol.model.{ContractId, TokenId}
import org.alephium.util.U256

object NFTMetadataSchema extends SchemaMainChain[NFTMetadata]("nft_metadata") {

  class NFTMetadatas(tag: Tag) extends Table[NFTMetadata](tag, name) {
    def token: Rep[TokenId]           = column[TokenId]("token", O.PrimaryKey)
    def tokenUri: Rep[String]         = column[String]("token_uri")
    def collectionId: Rep[ContractId] = column[ContractId]("collection_id")
    def nftIndex: Rep[U256]           = column[U256]("nft_index")

    def * : ProvenShape[NFTMetadata] =
      (token, tokenUri, collectionId, nftIndex)
        .<>((NFTMetadata.apply _).tupled, NFTMetadata.unapply)
  }

  val table: TableQuery[NFTMetadatas] = TableQuery[NFTMetadatas]
}
