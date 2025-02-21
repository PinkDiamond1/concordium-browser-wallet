import { Network, JsonRpcClient, CryptographicParameters, sha256 } from '@concordium/web-sdk';
import { NetworkConfiguration } from '@shared/storage/types';
import urls from '@shared/constants/url';

export const mainnetGenesisHash = '9dd9ca4d19e9393877d2c44b70f89acbfc0883c2243e5eeaecc0d1cd0503f478';

export function isMainnet(network: NetworkConfiguration) {
    return network.genesisHash === mainnetGenesisHash;
}

export function getNet(network: NetworkConfiguration): Network {
    return isMainnet(network) ? 'Mainnet' : 'Testnet';
}

export async function getGlobal(client: JsonRpcClient): Promise<CryptographicParameters> {
    const global = await client.getCryptographicParameters();
    if (!global) {
        throw new Error('no global fetched');
    }
    return global.value;
}

export async function getTermsAndConditionHash() {
    const site = await (await fetch(urls.termsAndConditions)).arrayBuffer();
    return sha256([new Uint8Array(site)]).toString('base64');
}
