// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {StaticTokenDefinition} from './staticTokenDefinition'
import {ERC20__factory, ERC20NameBytes__factory} from "../../types/ethers-contracts";


function isNullEthValue(value: string): boolean {
    return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export async function fetchTokenName(tokenAddress: string): Promise<string> {
  const contract = ERC20__factory.connect(tokenAddress, api)
  const contractNameBytes = ERC20NameBytes__factory.connect(tokenAddress, api)
  // try types string and bytes32 for name
  let nameValue = 'unknown'
  try {
    nameValue = await contract.name()
  } catch (e) {
      const nameResultBytes = await contractNameBytes.name()
      if (!isNullEthValue(nameResultBytes)) {
        nameValue = nameResultBytes
      } else {
        // try with the static definition
        const staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
        if(staticTokenDefinition != null) {
          nameValue = staticTokenDefinition.name
        }
      }

  }
  return nameValue
}
