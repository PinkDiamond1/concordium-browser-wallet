import React from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateContractPayload } from '@concordium/web-sdk';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import { SmartContractParameters } from '@shared/utils/types';

interface Props {
    payload: UpdateContractPayload;
    parameters?: SmartContractParameters;
}

/**
 * Displays an overview of a update contract transaction.
 */
export default function DisplayUpdateContract({ payload, parameters }: Props) {
    const { t } = useTranslation('sendTransaction');

    return (
        <>
            <h5>{t('contractIndex')}:</h5>
            <p>
                {payload.contractAddress.index.toString()} ({payload.contractAddress.subindex.toString()})
            </p>
            <h5>{t('receiveName')}:</h5>
            <p>{payload.receiveName}</p>
            <h5>{t('amount')}:</h5>
            {displayAsCcd(payload.amount.microGtuAmount)}
            <h5>{t('maxEnergy')}:</h5>
            <p>
                {payload.maxContractExecutionEnergy.toString()} {t('nrg')}
            </p>
            {!!parameters && (
                <>
                    <h5>{t('parameter')}:</h5>
                    <pre className="transaction-receipt__parameter">{JSON.stringify(parameters, null, 2)}</pre>
                </>
            )}
            {!parameters && !!payload.parameter.length && (
                <>
                    <h5>{t('parameter')} (hex):</h5>
                    <pre className="transaction-receipt__parameter">
                        {JSON.stringify(payload.parameter.toString('hex'), null, 2)}
                    </pre>
                </>
            )}
            {!parameters && !payload.parameter.length && <h5>{t('noParameter')}</h5>}
        </>
    );
}
