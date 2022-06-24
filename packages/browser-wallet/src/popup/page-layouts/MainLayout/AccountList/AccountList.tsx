import React from 'react';
import clsx from 'clsx';
import { useAtomValue, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

import CopyButton from '@popup/shared/CopyButton';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import { ClassName } from '@shared/utils/types';
import EntityList from '../EntityList';

export type Account = { address: string };

type ItemProps = {
    account: Account;
    checked: boolean;
    selected: boolean;
};

function AccountListItem({ account: { address }, checked, selected }: ItemProps) {
    return (
        <div className={clsx('account-list-item', checked && 'account-list-item--checked')}>
            <div className="account-list-item__account">
                <div className="flex align-center">
                    {address.slice(0, 4)}...{address.slice(address.length - 4)}{' '}
                    {selected && <CheckmarkIcon className="account-list-item__check" />}
                </div>
                <CopyButton
                    className="absolute r-0"
                    value={address}
                    onMouseUp={(e) => e.stopPropagation()}
                    tabIndex={-1}
                />
            </div>
            <div className="account-list-item__identity">Identity 1</div>
            <div className="account-list-item__amount">10,000.00 CCD</div>
        </div>
    );
}

type Props = ClassName & {
    onSelect(): void;
};

export default function AccountList({ className, onSelect }: Props) {
    const accounts = useAtomValue(accountsAtom).map((a) => ({ address: a }));
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const nav = useNavigate();

    return (
        <EntityList<Account>
            className={className}
            onSelect={(a) => {
                setSelectedAccount(a.address);
                onSelect();
            }}
            onNew={() => nav(absoluteRoutes.home.account.add.path)}
            entities={accounts}
            getKey={(a) => a.address}
            newText="Add new"
        >
            {(a, checked) => <AccountListItem account={a} checked={checked} selected={a.address === selectedAccount} />}
        </EntityList>
    );
}
