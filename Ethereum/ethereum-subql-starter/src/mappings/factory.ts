// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { fetchTokenName,
    ADDRESS_ZERO, FACTORY_ADDRESS, ONE_BI, ZERO_BD, ZERO_BI,
} from './utils'
import { BigNumber } from "@ethersproject/bignumber";
import {
    Pool,
    Token,
    Factory,
    createPoolDatasource,
} from '../types'
import { EthereumLog } from "@subql/types-ethereum";
import {PoolCreatedEvent} from "../types/ethers-contracts/Factory";

logger.info(`poolCount: ${BigNumber.from(ZERO_BI).toNumber()}`)

export async function handlePoolCreated(event: EthereumLog<PoolCreatedEvent["args"]> ): Promise<void> {
    if (event.address === '0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248') {
        return
    }
    // load factory

    let factory = await Factory.get(FACTORY_ADDRESS);
    logger.info(`factory ${typeof factory}`)
    if (factory === null || factory === undefined) {
        logger.info('Factory is null')
        factory = new Factory(FACTORY_ADDRESS)

        factory.poolCount = ZERO_BI.toBigInt()
        factory.totalVolumeETH = ZERO_BD.toNumber()
        factory.totalVolumeUSD = ZERO_BD.toNumber()
        factory.untrackedVolumeUSD = ZERO_BD.toNumber()
        factory.totalFeesUSD = ZERO_BD.toNumber()
        factory.totalFeesETH = ZERO_BD.toNumber()
        factory.totalValueLockedETH = ZERO_BD.toNumber()
        factory.totalValueLockedUSD = ZERO_BD.toNumber()
        factory.totalValueLockedUSDUntracked = ZERO_BD.toNumber()
        factory.totalValueLockedETHUntracked = ZERO_BD.toNumber()
        factory.txCount = ZERO_BI.toBigInt()
        factory.owner = ADDRESS_ZERO
    }

    factory.poolCount = BigNumber.from(factory.poolCount).add(ONE_BI).toBigInt()

    const pool = new Pool(event.address)

    logger.info(`token0: ${event.args.token0}`)
    logger.info(`token1: ${event.args.token1}`)

    // get Token method is wrong, it is not getting the info
    let token0 = await Token.get(event.args.token0)
    let token1 = await Token.get(event.args.token1)
    // fetch info if nul
    if (token0 === undefined || token0 == null) {
        token0 = new Token(event.args.token0)
        token0.name = await fetchTokenName(event.args.token0)
    }

    if (token1 === undefined || token1 == null) {
        token1 = new Token(event.args.token1)
        token1.name = await fetchTokenName(event.args.token1)
    }

    // update white listed pools
    pool.token0Id = token0.id
    pool.token1Id = token1.id

    await token0.save()
    await token1.save()

    await createPoolDatasource({
        address: event.address,
    })
    await pool.save()
    logger.info('pool saved')

    await factory.save()
    logger.info('factory saved')
}