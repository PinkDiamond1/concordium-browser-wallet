import React, { useEffect, useContext, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    identitiesAtom,
    pendingIdentityAtom,
    identityProvidersAtom,
    selectedIdentityIdAtom,
    selectedIdentityAtom,
} from '@popup/store/identity';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import PageHeader from '@popup/shared/PageHeader';
import { noOp } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';
import { CreationStatus } from '@shared/storage/types';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';
import { BackgroundResponseStatus } from '@shared/utils/types';

interface Location {
    state: {
        payload: IdentityIssuanceBackgroundResponse;
    };
}

interface Props {
    onFinish: () => void;
}

// TODO start checking status on identity

export default function IdentityIssuanceEnd({ onFinish }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('identityIssuance');
    const providers = useAtomValue(identityProvidersAtom);
    const [pendingIdentity, setPendingIdentity] = useAtom(pendingIdentityAtom);
    const [identities, setIdentities] = useAtom(identitiesAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const setSelectedIdentityId = useSetAtom(selectedIdentityIdAtom);
    const selectedIdentity = useAtomValue(selectedIdentityAtom);

    const identityProvider = useMemo(
        () => providers.find((p) => p.ipInfo.ipIdentity === selectedIdentity?.provider),
        [selectedIdentity?.provider]
    );
    useEffect(() => onClose(onFinish), [onClose, onFinish]);

    useEffect(() => {
        if (pendingIdentity) {
            if (state.payload.status === BackgroundResponseStatus.Success) {
                setIdentities(
                    identities.concat({
                        ...pendingIdentity,
                        status: CreationStatus.Pending,
                        location: state.payload.result,
                    })
                );
                setSelectedIdentityId(pendingIdentity.id);
            }
            setPendingIdentity(undefined);
        }
    }, [pendingIdentity]);

    return (
        <>
            <PageHeader>{t('title')}</PageHeader>
            <div className="identity-issuance__end">
                {state.payload.status === BackgroundResponseStatus.Aborted && (
                    <p className="identity-issuance__text m-t-40 m-b-60">{t('abortExplanation')}</p>
                )}
                {state.payload.status === BackgroundResponseStatus.Error && (
                    <p className="identity-issuance__text m-t-40 m-b-60">
                        {t('errorExplanation', { reason: state.payload.reason })}
                    </p>
                )}
                {state.payload.status === BackgroundResponseStatus.Success && (
                    <>
                        <p className="identity-issuance__text">{t('successExplanation')}</p>
                        <IdCard
                            className="identity-issuance__card"
                            name={pendingIdentity?.name || selectedIdentity?.name || 'Identity'}
                            provider={<IdentityProviderIcon provider={identityProvider} />}
                            status="pending"
                        />
                    </>
                )}
                <Button width="wide" onClick={withClose(noOp)} className="identity-issuance__button">
                    {t('continue')}
                </Button>
            </div>
        </>
    );
}
