import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useForm, SubmitHandler, Validate, ValidateResult } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, Location } from 'react-router-dom';
import debounce from 'lodash.debounce';

import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { jsonRpcClientAtom } from '@popup/store/settings';
import {
    CIS2ConfirmationError,
    confirmCIS2Contract,
    ContractDetails,
    ContractTokenDetails,
} from '@shared/utils/token-helpers';
import TokenDetails from '@popup/shared/TokenDetails';
import { selectedAccountAtom } from '@popup/store/account';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { contractBalancesFamily, currentAccountTokensAtom } from '@popup/store/token';
import { accountPageContext } from '../utils';
import {
    checkedTokensAtom,
    contractDetailsAtom,
    contractTokensAtom,
    listScrollPositionAtom,
    searchAtom,
    searchResultAtom,
    topTokensAtom,
} from './state';
import { addTokensRoutes, DetailsLocationState } from './utils';
import TokenList from './TokenList';

type AsyncValidate<V> = (fieldValue: V) => Promise<ValidateResult>;

function debouncedAsyncValidate<V>(validator: AsyncValidate<V>, ms: number, leading = false): Validate<V> {
    return async (value) =>
        new Promise((resolve) => {
            debounce(
                async (v: V) => {
                    validator(v).then(resolve);
                },
                ms,
                { leading }
            )(value);
        });
}

const VALIDATE_INDEX_DELAY_MS = 500;

type FormValues = {
    contractIndex: string;
};

/**
 * Component used to choose the contract index for a CIS-2 compliant smart contract instance.
 */
function ChooseContract() {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });
    const [contractDetails, setContractDetails] = useAtom(contractDetailsAtom);
    const form = useForm<FormValues>({
        defaultValues: { contractIndex: contractDetails?.index?.toString() },
    });
    const contractIndexValue = form.watch('contractIndex');
    const client = useAtomValue(jsonRpcClientAtom);
    const nav = useNavigate();
    const validContractDetails = useRef<ContractDetails | undefined>();

    const onSubmit: SubmitHandler<FormValues> = async () => {
        if (validContractDetails.current === undefined) {
            throw new Error('Expected contract details');
        }

        setContractDetails(validContractDetails.current);
        nav(addTokensRoutes.update, { replace: true });
    };

    const cis2ErrorText = useCallback((error: CIS2ConfirmationError) => {
        switch (error) {
            case CIS2ConfirmationError.Cis0Error: {
                return t('cis0Error');
            }
            case CIS2ConfirmationError.Cis2Error: {
                return t('cis2Error');
            }
            default: {
                throw new Error('Unsupported error type.');
            }
        }
    }, []);

    const validateIndex = useCallback(
        debouncedAsyncValidate<string>(
            async (value) => {
                const index = BigInt(value);
                const instanceInfo = await client.getInstanceInfo({ index, subindex: 0n });

                if (!instanceInfo) {
                    return t('noContractFound');
                }

                const contractName = instanceInfo.name.substring(5);
                const cd: ContractDetails = { contractName, index, subindex: 0n };
                const error = await confirmCIS2Contract(client, cd);

                if (error !== undefined) {
                    return cis2ErrorText(error);
                }

                validContractDetails.current = cd;
                return true;
            },
            VALIDATE_INDEX_DELAY_MS,
            true
        ),
        [client]
    );

    useEffect(() => {
        validContractDetails.current = undefined;
    }, [contractIndexValue]);

    return (
        <Form
            className="h-full w-full flex-column p-10 justify-space-between text-center"
            formMethods={form}
            onSubmit={onSubmit}
        >
            {(f) => (
                <>
                    <div>
                        <p className="m-t-0">{t('chooseContractHeader')}</p>
                        <FormInput
                            register={f.register}
                            label={t('contractIndex')}
                            name="contractIndex"
                            rules={{
                                required: t('indexRequired'),
                                validate: validateIndex,
                            }}
                        />
                    </div>
                    <Submit>{t('chooseContract')}</Submit>
                </>
            )}
        </Form>
    );
}

function Details() {
    const { state } = useLocation() as Location & { state?: DetailsLocationState };
    const nav = useNavigate();

    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const { contractIndex, token, balance } = state;

    return (
        <TokenDetails
            contractIndex={contractIndex.toString()}
            balance={balance}
            token={token}
            onClose={() => nav(-1)}
        />
    );
}

export default function AddTokens() {
    const { setDetailsExpanded } = useContext(accountPageContext);
    const accountTokens = useAtomValue(currentAccountTokensAtom);
    const contractDetails = useAtomValue(contractDetailsAtom);
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'Expected account to be selected');
    const currentContractBalances = useAtomValue(
        contractBalancesFamily(account, contractDetails?.index.toString() ?? '')
    );

    // Keep the following in memory while add token flow lives
    const [, updateTokens] = useAtom(contractTokensAtom);
    const [, setChecked] = useAtom(checkedTokensAtom);
    const [, setTopTokens] = useAtom(topTokensAtom);
    useAtom(searchAtom);
    useAtom(searchResultAtom);
    useAtom(listScrollPositionAtom);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    useEffect(() => {
        if (contractDetails !== undefined) {
            updateTokens('reset');
        }
    }, [contractDetails?.index]);

    useEffect(() => {
        if (contractDetails?.index !== undefined && !accountTokens.loading) {
            const currentChecked: ContractTokenDetails[] =
                accountTokens.value[contractDetails.index.toString()]?.map((token) => ({
                    ...token,
                    balance: currentContractBalances[token.id] ?? 0n,
                })) ?? [];

            setTopTokens(currentChecked);
            setChecked(currentChecked.map((t) => t.id));
        }
    }, [contractDetails?.index, accountTokens.loading]);

    return (
        <Routes>
            <Route index element={<ChooseContract />} />
            <Route path={addTokensRoutes.update} element={<TokenList />} />
            <Route path={addTokensRoutes.details} element={<Details />} />
        </Routes>
    );
}
