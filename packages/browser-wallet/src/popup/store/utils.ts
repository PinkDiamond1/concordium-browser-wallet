import {
    sessionPasscode,
    StorageAccessor,
    getGenesisHash,
    useIndexedStorage,
    storedConnectedSites,
    storedCredentials,
    storedCurrentNetwork,
    storedEncryptedSeedPhrase,
    storedSelectedAccount,
    storedTheme,
    storedIdentities,
    sessionPendingIdentity,
    storedSelectedIdentity,
    storedSeedPhrase,
    storedIdentityProviders,
    sessionCreatingCredential,
    sessionAccountInfoCache,
    sessionIsRecovering,
} from '@shared/storage/access';
import { ChromeStorageKey } from '@shared/storage/types';
import { atom, WritableAtom } from 'jotai';
import { noOp } from 'wallet-common-helpers/src/utils/basicHelpers';

const accessorMap = {
    [ChromeStorageKey.Identities]: useIndexedStorage(storedIdentities, getGenesisHash),
    [ChromeStorageKey.SelectedIdentity]: storedSelectedIdentity,
    [ChromeStorageKey.ConnectedSites]: storedConnectedSites,
    [ChromeStorageKey.Credentials]: useIndexedStorage(storedCredentials, getGenesisHash),
    [ChromeStorageKey.SelectedAccount]: storedSelectedAccount,
    [ChromeStorageKey.SeedPhrase]: storedEncryptedSeedPhrase,
    [ChromeStorageKey.NetworkConfiguration]: storedCurrentNetwork,
    [ChromeStorageKey.Theme]: storedTheme,
    [ChromeStorageKey.SeedPhrase]: storedSeedPhrase,
    [ChromeStorageKey.IdentityProviders]: useIndexedStorage(storedIdentityProviders, getGenesisHash),
    [ChromeStorageKey.Passcode]: sessionPasscode,
    [ChromeStorageKey.IsRecovering]: sessionIsRecovering,
    [ChromeStorageKey.PendingIdentity]: sessionPendingIdentity,
    [ChromeStorageKey.IsCreatingCredential]: sessionCreatingCredential,
    [ChromeStorageKey.AccountInfoCache]: useIndexedStorage(sessionAccountInfoCache, getGenesisHash),
};

export type AsyncWrapper<V> = {
    loading: boolean;
    value: V;
};

export function atomWithChromeStorage<V>(
    key: ChromeStorageKey,
    fallback: V,
    withLoading: true,
    withSync?: boolean
): WritableAtom<AsyncWrapper<V>, V, void>;
export function atomWithChromeStorage<V>(
    key: ChromeStorageKey,
    fallback: V,
    withLoading?: false,
    withSync?: boolean
): WritableAtom<V, V, void>;

/**
 * @description
 * Create an atom that automatically syncs with chrome local storage.
 */
export function atomWithChromeStorage<V>(key: ChromeStorageKey, fallback: V, withLoading = false, withSync = false) {
    const accessor = accessorMap[key] as unknown as StorageAccessor<V>;

    if (accessor === undefined) {
        throw new Error(`Could not find storage for key: ${key}`);
    }

    const { get: getStoredValue, set: setStoredValue } = accessor;
    const base = atom<AsyncWrapper<V>>({ loading: true, value: fallback });

    base.onMount = (setValue) => {
        getStoredValue().then((value) =>
            setValue({
                loading: false,
                value: value ?? fallback,
            })
        );

        if (withSync) {
            const listener = (changes: Record<string, chrome.storage.StorageChange>) =>
                getStoredValue().then((value) => {
                    if (key in changes) {
                        setValue({
                            loading: false,
                            value: value ?? fallback,
                        });
                    }
                });
            chrome.storage[accessor.area].onChanged.addListener(listener);
            return () => chrome.storage[accessor.area].onChanged.removeListener(listener);
        }
        return noOp;
    };

    const derived = atom(
        (get) => (withLoading ? get(base) : get(base).value),
        (_, set, next: V) => {
            setStoredValue(next);
            set(base, (v) => ({ ...v, value: next }));
        }
    );

    return derived;
}
