const t = {
    noAccounts: 'You have no accounts in your wallet',
    removeAccount: 'Remove account (local only)',
    resetConnections: 'Reset connections',
    accountAddress: 'Account address',
    siteConnected: 'Connected',
    siteNotConnected: 'Not connected',
    accountBalanceError: 'Unable to retrieve account balance',
    actions: {
        log: 'Transaction log',
        send: 'Send CCD',
        receive: 'Receive CCD',
        settings: 'Account settings',
        tokens: 'Tokens',
    },
    details: {
        total: 'Public balance total',
        atDisposal: 'Public amount at disposal',
        stakeAmount: 'Stake / delegation amount',
    },
    settings: {
        connectedSites: {
            title: 'Connected sites',
            noConnected: 'The selected account is not connected to any sites.',
            connect: 'Connect',
            disconnect: 'Disconnect',
        },
        exportPrivateKey: {
            title: 'Export private key',
            description: 'Please enter your passcode to show the private key.',
            copyDescription: 'Press the button to copy your private key.',
            show: 'Show private key',
            done: 'Done',
            export: 'Export',
        },
    },
    sendCcd: {
        labels: {
            ccd: 'Enter amount to transfer',
            recipient: 'Enter recipient address',
        },
        buttons: {
            back: 'Back',
            send: 'Send',
            finish: 'Finish',
            continue: 'Continue',
        },
        title: 'Send CCD',
        currentBalance: 'Current balance',
        unableToCoverCost: 'Insufficient CCD to cover estimated cost',
        fee: 'Estimated transaction fee',
    },
    tokens: {
        tabBar: {
            ft: 'Fungible',
            nft: 'Collectibles',
            new: 'Add new',
        },
        indexRequired: 'Contract index is required',
        chooseContract: 'Choose Contract',
        contractIndex: 'Contract Index',
        contractName: 'Contract name',
        tokenId: 'Token id',
        addToken: 'Add token',
        duplicateId: 'Token already in the list',
        updateTokens: 'Update tokens',
        unownedUnique: 'not owned',
        hexId: 'Id must be HEX encoded',
    },
    accountPending: 'This account is still pending finalization.',
    request: 'Create account',
};

export default t;
