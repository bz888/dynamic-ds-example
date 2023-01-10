// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {atob} from 'abab';

if (!global.atob) {
    global.atob = atob;
}
export * from "./mappings/mappingHandlers";