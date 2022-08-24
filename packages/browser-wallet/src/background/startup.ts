import { HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import { storedCurrentNetwork, storedCredentials, storedIdentities } from '@shared/storage/access';

import {
    Identity,
    CreationStatus,
    PendingIdentity,
    PendingWalletCredential,
    WalletCredential,
} from '@shared/storage/types';
import { IdentityTokenContainer, IdentityProviderIdentityStatus } from 'wallet-common-helpers/lib/utils/identity/types';
import { updateCredentials, updateIdentities } from './update';

const isPendingCred = (cred: WalletCredential): cred is PendingWalletCredential =>
    cred.status === CreationStatus.Pending;
const isPendingIdentity = (identity: Identity): identity is PendingIdentity =>
    identity.status === CreationStatus.Pending;
const updateInterval = 10000;

/**
 * Continously checks whether pending credentials have been confirmed.
 */
async function monitorAccountStatus() {
    setTimeout(async function loop() {
        const network = await storedCurrentNetwork.get();
        const url = network?.jsonRpcUrl;
        const creds = await storedCredentials.get();
        const toUpdate: WalletCredential[] = [];
        if (url && creds) {
            const client = new JsonRpcClient(new HttpProvider(url, fetch));
            for (const { status, deploymentHash, ...info } of creds.filter(isPendingCred)) {
                const response = await client.getTransactionStatus(deploymentHash);
                if (response?.status === 'finalized') {
                    const isSuccessful = Object.values(response?.outcomes || {}).some(
                        (outcome) => outcome.result.outcome === 'success'
                    );
                    toUpdate.push({
                        ...info,
                        status: isSuccessful ? CreationStatus.Confirmed : CreationStatus.Rejected,
                    });
                }
            }
            if (toUpdate.length) {
                await updateCredentials(toUpdate);
            }
        }
        setTimeout(loop, updateInterval);
    }, 0);
}

/**
 * Continously checks whether pending identities have been confirmed or rejected.
 */
async function monitorIdentityStatus() {
    setTimeout(async function loop() {
        const identities = await storedIdentities.get();
        const toUpdate: Identity[] = [];
        if (identities) {
            for (const { location, ...identity } of identities.filter(isPendingIdentity)) {
                const response = (await (await fetch(location)).json()) as IdentityTokenContainer;
                if (response.status === IdentityProviderIdentityStatus.Error) {
                    toUpdate.push({
                        ...identity,
                        status: CreationStatus.Rejected,
                        error: response.detail,
                    });
                }
                if (response.status === IdentityProviderIdentityStatus.Done) {
                    toUpdate.push({
                        ...identity,
                        status: CreationStatus.Confirmed,
                        idObject: response.token.identityObject,
                    });
                }
            }
            if (toUpdate.length) {
                await updateIdentities(toUpdate);
            }
        }
        setTimeout(loop, updateInterval);
    }, 0);
}

export const startupHandler = () => {
    monitorAccountStatus();
    monitorIdentityStatus();
};
