// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Pool, Token } from '../types'
import {EthereumLog} from "@subql/types-ethereum";
import {InitializeEvent }from "../types/ethers-contracts/Pool";


export async function handleInitialize(event: EthereumLog<InitializeEvent["args"]>): Promise<void> {
    // update pool sqrt price and tick
    // the error happens to trying `get` pool
    // as handleInitialize is a dynamicDS, it fails to get from the store
    const pool = await Pool.get(event.address)

    // in an instance where pool values needs updating
    pool.updatingValue = 100

    await pool.save()
    try {
        const token0 = await Token.get(pool.token0Id)
        const token1 = await Token.get(pool.token1Id)
        // update token prices
        token0.name = 'new token0 name'
        token1.name = 'new token1 name'
        await token0.save()
        await token1.save()
    } catch (e) {
        logger.info(e, 'handleInitialize error')
    }
}
