import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { accountsAtom } from '@popup/store/account';
import MenuButton from '@popup/shared/MenuButton';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { CreationStatus } from '@shared/storage/types';
import { useCurrentOpenTabUrl } from '@popup/shared/utils/tabs';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { accountRoutes } from './routes';
import { accountSettingsRoutes } from './AccountSettings/routes';
import AccountActions from './AccountActions';
import DisplayAddress from './DisplayAddress';
import AccountDetails from './AccountDetails';
import AccountSettings from './AccountSettings';
import TransactionLog from './TransactionLog/TransactionLog';
import SendCcd from './SendCcd';
import ConnectedBox from './ConnectedBox';
import TokenOverview from './tokens/TokenOverview';

function Account({
    detailsExpanded,
    setDetailsExpanded,
}: {
    detailsExpanded: boolean;
    setDetailsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const currentUrl = useCurrentOpenTabUrl();
    const nav = useNavigate();

    const selectedCred = useSelectedCredential();

    const isConfirmed = !selectedCred || selectedCred.status === CreationStatus.Confirmed;

    return (
        <div className="flex-column justify-space-between align-center h-full relative">
            <div className="account-page__content">
                {accounts.length === 0 && (
                    <div className="flex-column align-center h-full">
                        <p className="m-t-20 m-h-40">{t('noAccounts')}</p>
                        <Button
                            className="m-b-40 m-t-auto"
                            width="wide"
                            onClick={() => nav(absoluteRoutes.home.account.add.path)}
                        >
                            {t('request')}
                        </Button>
                    </div>
                )}
                {selectedCred !== undefined && (
                    <>
                        <div className="account-page__details">
                            <MenuButton
                                className="account-page__hide"
                                open={detailsExpanded}
                                onClick={() => setDetailsExpanded((o) => !o)}
                            />
                            <AccountDetails expanded={detailsExpanded} account={selectedCred} />
                            <ConnectedBox
                                url={currentUrl}
                                link={`${accountRoutes.settings}/${accountSettingsRoutes.connectedSites}`}
                                onNavigate={() => setDetailsExpanded(false)}
                                accountAddress={selectedCred.address}
                            />
                        </div>
                        <div className="account-page__routes">
                            {isConfirmed && <Outlet />}
                            {!isConfirmed && <div className="account-page__not-finalized">{t('accountPending')}</div>}
                        </div>
                    </>
                )}
            </div>
            <AccountActions
                className="account-page__actions"
                disabled={!isConfirmed}
                setDetailsExpanded={setDetailsExpanded}
            />
        </div>
    );
}

export default function AccountRoutes() {
    const [detailsExpanded, setDetailsExpanded] = useState(true);

    return (
        <Routes>
            <Route element={<Account detailsExpanded={detailsExpanded} setDetailsExpanded={setDetailsExpanded} />}>
                <Route index element={<TransactionLog setDetailsExpanded={setDetailsExpanded} />} />
                <Route path={`${accountRoutes.send}/*`} element={<SendCcd setDetailsExpanded={setDetailsExpanded} />} />
                <Route path={accountRoutes.receive} element={<DisplayAddress />} />
                <Route path={`${accountRoutes.tokens}/*`} element={<TokenOverview />} />
                <Route path={`${accountRoutes.settings}/*`} element={<AccountSettings />} />
            </Route>
        </Routes>
    );
}
